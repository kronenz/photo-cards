# Quickstart Guide - Template Marketplace

> Generated: 2025-01-07
> Phase: 001-template-marketplace
> Status: Developer Onboarding Guide

---

## Overview

This guide helps you set up a local development environment for the **Template Marketplace** feature and run your first end-to-end template upload/download workflow.

**Time to Complete**: 15-20 minutes

**Prerequisites**:
- Node.js 18+ installed
- Git installed
- Basic understanding of SvelteKit and TypeScript

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Template Marketplace                      │
└─────────────────────────────────────────────────────────────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                │                 │                 │
                ▼                 ▼                 ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │   SvelteKit  │  │  PocketBase  │  │ Cloudflare   │
        │   Frontend   │  │   Backend    │  │  R2 Storage  │
        └──────────────┘  └──────────────┘  └──────────────┘
                │                 │                 │
                │                 │                 │
        Components:         Collections:     Objects:
        - Marketplace       - templates       - templates/
        - Upload Modal      - reviews         - thumbnails/
        - Template Card     - categories
        - Search Bar        - downloads
```

### Data Flow

**Upload Workflow**:
```
1. User clicks "Upload Template"
2. Client requests presigned URL from SvelteKit API
3. SvelteKit generates S3 presigned URL via R2 SDK
4. Client uploads JSON directly to R2
5. Client creates template record in PocketBase
6. PocketBase triggers copyright detection hook
7. Template appears in marketplace (if approved)
```

**Download Workflow**:
```
1. User clicks "Download Template"
2. Client creates download record in PocketBase
3. Client fetches template JSON from R2 CDN
4. Client deserializes JSON to UnifiedHolographicCard
5. Template appears in user's collection
```

---

## 1. Clone and Install

### 1.1 Clone Repository

```bash
cd /root/develop/claudecode
git clone <repository-url> photo-cards
cd photo-cards
```

### 1.2 Checkout Feature Branch

```bash
# Switch to 001-template-marketplace branch
git checkout 001-template-marketplace

# Verify you're on the correct branch
git branch --show-current
# Expected output: 001-template-marketplace
```

### 1.3 Install Dependencies

```bash
# Install npm packages
npm install

# Install additional dependencies for Template Marketplace
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner jszip phash-js
npm install -D @types/jszip
```

**Key Dependencies**:
- `@aws-sdk/client-s3`: S3-compatible R2 client
- `@aws-sdk/s3-request-presigner`: Presigned URL generation
- `jszip`: Template packaging/compression
- `phash-js`: Client-side logo detection (perceptual hashing)

---

## 2. Environment Setup

### 2.1 Create Environment File

```bash
# Copy example environment file
cp .env.example .env
```

### 2.2 Configure Cloudflare R2

Edit `.env` and add R2 credentials:

```env
# Cloudflare R2 Storage
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_key_here
R2_BUCKET_NAME=kbo-templates
R2_PUBLIC_URL=https://cdn.kbo-cards.com

# PocketBase
PUBLIC_POCKETBASE_URL=http://localhost:8090

# Auth (OAuth providers)
AUTH_SECRET=your_auth_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret
```

### 2.3 Get Cloudflare R2 Credentials

**Option 1: Use Cloudflare Dashboard**

1. Go to https://dash.cloudflare.com
2. Navigate to **R2 Object Storage**
3. Click **Create Bucket** → Name it `kbo-templates`
4. Go to **Manage R2 API Tokens**
5. Click **Create API Token**
6. Copy `Account ID`, `Access Key ID`, `Secret Access Key`
7. Paste into `.env`

**Option 2: Use Local Storage (Development Only)**

For local development without R2, use filesystem storage:

```env
# .env.development
STORAGE_BACKEND=filesystem
STORAGE_PATH=./storage/templates
```

Update `src/lib/server/storage.ts`:

```typescript
// Fallback to local filesystem if R2 not configured
export const storageBackend = process.env.STORAGE_BACKEND === 'filesystem'
  ? new FilesystemStorage(process.env.STORAGE_PATH)
  : new R2Storage({
      accountId: process.env.R2_ACCOUNT_ID,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    });
```

---

## 3. PocketBase Setup

### 3.1 Start PocketBase Server

```bash
# Start PocketBase on port 8090
./pocketbase serve
```

**Expected Output**:
```
> Server started at http://127.0.0.1:8090
  - REST API: http://127.0.0.1:8090/api/
  - Admin UI: http://127.0.0.1:8090/_/
```

### 3.2 Create Admin Account

1. Open http://localhost:8090/_/
2. Create admin account (first-time setup)
3. Email: `admin@kbo-cards.local`
4. Password: (choose a strong password)

### 3.3 Create Collections

**Method 1: Import Collections (Recommended)**

```bash
# Use PocketBase migration script
npm run pb:migrate
```

This will create:
- `templates` collection
- `template_reviews` collection
- `template_categories` collection
- `template_downloads` collection
- `flagged_uploads` collection

**Method 2: Manual Creation**

Open PocketBase Admin → **Collections** → **New Collection**

Create each collection using schemas from `specs/001-template-marketplace/data-model.md`.

Example for `templates` collection:

```javascript
{
  "name": "templates",
  "type": "base",
  "schema": [
    {
      "name": "template_id",
      "type": "text",
      "required": true,
      "unique": true,
      "pattern": "^tpl_[a-z0-9_]{3,50}$"
    },
    // ... (see data-model.md for full schema)
  ]
}
```

### 3.4 Seed Initial Data

```bash
# Seed template categories
npm run seed:categories
```

This will create:
- 순간 카드 (Moment Cards)
  - 홈런 (Homerun)
  - 투구 (Pitching)
  - 수비 (Fielding)
- 선수 카드 (Player Cards)
- 시즌 카드 (Season Cards)
- 팀 카드 (Team Cards)
  - LG 트윈스
  - 두산 베어스
  - ... (all 10 teams)

---

## 4. Run Development Server

### 4.1 Start SvelteKit Dev Server

```bash
npm run dev
```

**Expected Output**:
```
  VITE v5.3.5  ready in 421 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 4.2 Verify Services

Open the following URLs to verify everything is running:

- **Main App**: http://localhost:5173
- **PocketBase Admin**: http://localhost:8090/_/
- **PocketBase API**: http://localhost:8090/api/collections/templates/records

---

## 5. First Template Upload Test

### 5.1 Create Test User

1. Go to http://localhost:5173
2. Click **Sign In** → **Google** (or GitHub)
3. Complete OAuth flow
4. Verify you're logged in (avatar in top-right)

### 5.2 Generate Test Template

Run the test template generator:

```bash
# Generate a sample template JSON
npm run generate:test-template
```

This will create `tests/fixtures/tpl_test_lg_homerun_001.json`:

```json
{
  "metadata": {
    "id": "tpl_test_lg_homerun_001",
    "version": "1.0.0",
    "templateVersion": "1.0.0",
    "title": "[TEST] LG 트윈스 홈런 순간",
    "author": { "id": "test_user", "username": "test_designer" },
    "category": "moment",
    "tags": ["LG 트윈스", "홈런", "테스트"],
    "rating": { "average": 0, "count": 0 },
    "remixInfo": { "isRemix": false, "allowRemix": true }
  },
  "cardConfig": {
    "frontImage": {
      "type": "embedded",
      "data": "data:image/svg+xml;base64,...",
      "hash": "sha256:test123..."
    },
    "holographic": {
      "effectType": "lg",
      "intensity": 0.8,
      "animationSpeed": 1.2
    }
  }
}
```

### 5.3 Upload Template via UI

1. Go to http://localhost:5173/marketplace
2. Click **Upload Template** button
3. Fill in the form:
   - **Title**: LG 트윈스 홈런 순간
   - **Description**: 2024년 우승 결정 홈런 템플릿
   - **Category**: 순간 카드 → 홈런
   - **Tags**: LG 트윈스, 홈런, 2024
   - **License**: CC-BY
   - **File**: Select `tests/fixtures/tpl_test_lg_homerun_001.json`
4. Click **Upload**
5. Wait for copyright check (~2 seconds)
6. See success message

**Expected Behavior**:
- Progress indicator shows upload status
- Copyright detection runs automatically
- Template appears in marketplace (if approved)
- Thumbnail is generated

### 5.4 Verify Upload

**Check PocketBase Admin**:
1. Go to http://localhost:8090/_/
2. Navigate to **Collections** → **templates**
3. Find your uploaded template
4. Verify fields:
   - `template_id`: tpl_test_lg_homerun_001
   - `copyright_status`: approved (or pending)
   - `storage_url`: https://cdn.kbo-cards.com/...
   - `author`: Your user ID

**Check R2 Storage**:
1. Go to Cloudflare Dashboard → R2
2. Navigate to `kbo-templates` bucket
3. Verify file exists: `templates/tpl_test_lg_homerun_001.json`

**Check Marketplace UI**:
1. Go to http://localhost:5173/marketplace
2. Your template should appear in the grid
3. Click to view details
4. Verify rating stars, download button, etc.

---

## 6. First Template Download Test

### 6.1 Download Template via UI

1. Go to http://localhost:5173/marketplace
2. Find your uploaded template (or any template)
3. Click **Download** button
4. Wait for download (~1 second)
5. See success message

**Expected Behavior**:
- Download counter increments
- Template JSON is fetched from R2
- Template is deserialized to `UnifiedHolographicCard`
- Template appears in "My Templates" section

### 6.2 Apply Template to Card

1. Go to http://localhost:5173/gallery
2. Click on any card in your collection
3. Click **Apply Template** button
4. Select your downloaded template
5. See card update with new template

**Expected Behavior**:
- Card front/back images update
- Holographic effect changes
- Layout updates based on template

---

## 7. Development Workflow

### 7.1 Project Structure

```
photo-cards/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   └── marketplace/
│   │   │       ├── TemplateMarketplace.svelte
│   │   │       ├── TemplateGrid.svelte
│   │   │       ├── TemplateCard.svelte
│   │   │       ├── TemplateDetailModal.svelte
│   │   │       ├── TemplateUploadModal.svelte
│   │   │       └── TemplateSearchBar.svelte
│   │   ├── services/
│   │   │   ├── template-serializer.ts
│   │   │   ├── template-uploader.ts
│   │   │   ├── template-downloader.ts
│   │   │   └── template-storage.ts
│   │   ├── server/
│   │   │   ├── r2.ts                  # R2 client
│   │   │   ├── storage-api.ts         # Storage API routes
│   │   │   └── pocketbase-hooks.ts    # PB hooks
│   │   └── utils/
│   │       └── copyright-detector.ts  # Logo detection
│   ├── routes/
│   │   ├── marketplace/
│   │   │   ├── +page.svelte
│   │   │   └── [templateId]/+page.svelte
│   │   └── api/
│   │       └── storage/
│   │           ├── presign-upload/+server.ts
│   │           ├── presign-download/+server.ts
│   │           └── verify-upload/+server.ts
│   └── tests/
│       ├── unit/
│       │   ├── template-serializer.test.ts
│       │   ├── copyright-detector.test.ts
│       │   └── template-storage.test.ts
│       ├── integration/
│       │   ├── upload-workflow.test.ts
│       │   └── download-workflow.test.ts
│       └── fixtures/
│           └── tpl_test_lg_homerun_001.json
└── specs/
    └── 001-template-marketplace/
        ├── spec.md
        ├── plan.md
        ├── research.md
        ├── data-model.md
        ├── contracts/
        │   ├── template-api.yaml
        │   ├── review-api.yaml
        │   └── storage-api.yaml
        └── quickstart.md  (this file)
```

### 7.2 Common Development Tasks

**Run Tests**:
```bash
# Unit tests
npm run test

# Specific test file
npm run test -- template-serializer.test.ts

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

**Lint & Format**:
```bash
# Lint TypeScript
npm run lint

# Format code
npm run format

# Type check
npm run check
```

**Database Operations**:
```bash
# Reset PocketBase (delete all data)
npm run pb:reset

# Backup PocketBase
npm run pb:backup

# Restore from backup
npm run pb:restore
```

**R2 Operations**:
```bash
# List all files in R2 bucket
npm run r2:list

# Delete all test templates
npm run r2:clean-test

# Backup R2 to local
npm run r2:backup
```

### 7.3 Debug Mode

Enable debug logging:

```env
# .env.development
DEBUG=true
LOG_LEVEL=debug
```

This will show:
- R2 API calls with full request/response
- Copyright detection results
- PocketBase hook executions
- Template serialization/deserialization

**Example debug output**:
```
[DEBUG] template-uploader: Requesting presigned URL
[DEBUG] r2: PutObjectCommand { Bucket: "kbo-templates", Key: "templates/tpl_test_lg_homerun_001.json" }
[DEBUG] copyright-detector: Running pHash check
[DEBUG] copyright-detector: No logo detected (confidence: 0%)
[DEBUG] pocketbase-hooks: afterCreate hook triggered for templates
[DEBUG] template-uploader: Upload complete (524288 bytes in 1.2s)
```

---

## 8. Troubleshooting

### 8.1 Common Issues

#### Issue: "Cannot connect to PocketBase"

**Symptoms**: Frontend shows "Failed to fetch" errors

**Solution**:
```bash
# Verify PocketBase is running
curl http://localhost:8090/api/health

# Check PocketBase logs
tail -f pb_data/logs/2025-01-07.log

# Restart PocketBase
killall pocketbase && ./pocketbase serve
```

#### Issue: "R2 upload fails with 403 Forbidden"

**Symptoms**: Upload succeeds but file not visible in R2

**Solution**:
```bash
# Verify R2 credentials
npm run r2:test-connection

# Check .env file
cat .env | grep R2

# Verify bucket name
npm run r2:list-buckets
```

#### Issue: "Copyright detection not working"

**Symptoms**: All templates stuck in "pending" status

**Solution**:
```bash
# Check if phash-js is installed
npm list phash-js

# Test copyright detector directly
npm run test:copyright-detector

# Check PocketBase hooks are registered
curl http://localhost:8090/api/collections/templates/records?filter=copyright_status='pending'
```

#### Issue: "Template deserialization fails"

**Symptoms**: Downloaded templates show error "Invalid template format"

**Solution**:
```typescript
// Verify template JSON schema
import { TemplateSchema } from '$lib/schemas/template';

const result = TemplateSchema.safeParse(templateJson);
if (!result.success) {
  console.error('Validation errors:', result.error.errors);
}
```

### 8.2 Reset Everything

If things get messed up, reset to clean state:

```bash
# 1. Stop all services
killall pocketbase
killall node

# 2. Delete PocketBase data
rm -rf pb_data/data.db

# 3. Clear npm cache
rm -rf node_modules package-lock.json
npm install

# 4. Clear R2 (CAUTION: Deletes all files!)
npm run r2:clear-all

# 5. Restart from step 3 (PocketBase Setup)
```

---

## 9. Next Steps

### 9.1 Implement User Stories

Now that your environment is set up, start implementing User Stories:

**Priority 1 (P1) - Core Features**:
- [ ] US1: Template Discovery & Browsing
- [ ] US2: Template Reviews & Ratings
- [ ] US3: Template Search & Filtering

**Priority 2 (P2) - Enhanced Features**:
- [ ] US4: Template Versioning
- [ ] US5: Template Remixing

**Priority 3 (P3) - Advanced Features**:
- [ ] US6: Premium Templates (Phase 4)

### 9.2 Follow TDD Approach

For each User Story:

1. **Write Test First** (`tests/integration/`)
2. **Implement Component** (`src/lib/components/marketplace/`)
3. **Connect to Backend** (`src/routes/api/`)
4. **Run Tests** (`npm run test`)
5. **Update Spec** (`specs/001-template-marketplace/tasks.md`)

### 9.3 Read Documentation

- **Spec**: `specs/001-template-marketplace/spec.md`
- **Plan**: `specs/001-template-marketplace/plan.md`
- **Research**: `specs/001-template-marketplace/research.md`
- **Data Model**: `specs/001-template-marketplace/data-model.md`
- **API Contracts**: `specs/001-template-marketplace/contracts/*.yaml`

### 9.4 Join Team Workflow

```bash
# 1. Pull latest changes
git pull origin 001-template-marketplace

# 2. Create feature branch
git checkout -b feat/US1-template-discovery

# 3. Implement feature following TDD
npm run test -- --watch

# 4. Commit with conventional commits
git add .
git commit -m "feat(marketplace): implement template grid component

- Add TemplateGrid.svelte with virtual scrolling
- Implement masonry layout with 3 responsive breakpoints
- Add loading states and error handling

Requirements: US1.1, US1.2
Tests: tests/integration/template-grid.test.ts"

# 5. Push and create PR
git push origin feat/US1-template-discovery
gh pr create --title "feat: Template Discovery & Browsing (US1)" --body "..."
```

---

## 10. Resources

### 10.1 Documentation

- **SvelteKit**: https://kit.svelte.dev/
- **PocketBase**: https://pocketbase.io/docs/
- **Cloudflare R2**: https://developers.cloudflare.com/r2/
- **AWS S3 SDK**: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/

### 10.2 API References

- **Template API**: `specs/001-template-marketplace/contracts/template-api.yaml`
- **Review API**: `specs/001-template-marketplace/contracts/review-api.yaml`
- **Storage API**: `specs/001-template-marketplace/contracts/storage-api.yaml`

Open in Swagger Editor:
```bash
# Install Swagger UI
npm install -g @apidevtools/swagger-cli

# Preview OpenAPI spec
swagger-cli serve specs/001-template-marketplace/contracts/template-api.yaml
```

### 10.3 Team Communication

- **Spec Issues**: Check `specs/001-template-marketplace/spec.md` first
- **Bug Reports**: Create GitHub issue with template
- **Feature Requests**: Discuss in spec review meetings

---

## Congratulations! 🎉

You've successfully set up the Template Marketplace development environment and completed your first upload/download workflow.

**What you've accomplished**:
- ✅ Set up SvelteKit + PocketBase + R2
- ✅ Created PocketBase collections
- ✅ Uploaded a test template
- ✅ Downloaded and applied a template
- ✅ Verified copyright detection
- ✅ Understood the project structure

**Next Steps**:
1. Read `spec.md` to understand User Stories
2. Pick a User Story to implement (start with US1)
3. Write tests first (TDD approach)
4. Implement components following the plan
5. Submit PR and get it reviewed

Happy coding! ⚾🎴
