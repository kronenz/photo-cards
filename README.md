# Holographic Card Community

홀로그래픽 효과 야구 카드 갤러리 커뮤니케이션 서비스

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Development Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd holographic-card-community
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   - GitHub OAuth credentials
   - SMTP settings for email
   - Other service configurations

3. **Set up PocketBase (Backend)**
   ```bash
   npm run setup:pocketbase
   ```

4. **Start development servers**
   ```bash
   # Start both SvelteKit and PocketBase
   npm run dev:full
   
   # Or start them separately:
   npm run pocketbase    # Backend (http://localhost:8090)
   npm run dev          # Frontend (http://localhost:5173)
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - PocketBase Admin: http://localhost:8090/_/

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- SvelteKit with TypeScript
- Tailwind CSS for styling
- Advanced CSS for holographic effects

**Backend:**
- PocketBase (SQLite for development, PostgreSQL for production)
- GitHub OAuth authentication
- Local file storage (MinIO for production)

**Deployment:**
- Static build for bare metal hosting
- Nginx reverse proxy
- Self-hosted infrastructure

### Project Structure

```
src/
├── lib/
│   ├── auth.ts          # Authentication service
│   ├── config.ts        # Environment configuration
│   ├── email.ts         # Email service
│   ├── pocketbase.ts    # Database client
│   └── storage.ts       # File storage service
├── routes/
│   ├── auth/           # Authentication pages
│   ├── +layout.svelte  # Global layout
│   └── +page.svelte    # Home page
├── app.css             # Global styles + holographic effects
└── app.d.ts            # TypeScript declarations
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# GitHub OAuth (Required)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
AUTH_SECRET=your_random_secret_key

# PocketBase
POCKETBASE_URL=http://localhost:8090

# Email (Optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App with:
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL: `http://localhost:5173/auth/callback/github`
3. Copy Client ID and Client Secret to your `.env` file

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start SvelteKit dev server
npm run dev:full         # Start both frontend and backend
npm run pocketbase       # Start PocketBase only

# Building
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run check            # Type checking
npm run lint             # ESLint
npm run format           # Prettier formatting

# Setup
npm run setup:pocketbase # Download and configure PocketBase
```

## 🎨 Holographic Effects

This project includes advanced CSS holographic effects inspired by physical trading cards:

- Real-time mouse/touch interaction
- Multiple effect types (shine, glare, foil)
- Mobile-optimized performance
- Customizable intensity and colors

## 🚀 Deployment

### Development Deployment
- Uses local PocketBase with SQLite
- Local file storage
- GitHub OAuth for authentication
- Gmail SMTP for emails (free tier)

### Production Deployment
- Static build deployed to bare metal server
- PostgreSQL database
- MinIO object storage
- Nginx reverse proxy with SSL

## 📋 Next Steps

After completing this setup, you can:

1. **Create your first holographic card** - Upload an image and apply effects
2. **Set up the community features** - User profiles, galleries, social interactions
3. **Implement advanced features** - Real-time notifications, grade system, monetization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.