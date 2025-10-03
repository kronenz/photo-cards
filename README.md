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

# Remote Access
npm run tunnel           # Create ngrok tunnel for port 5173
npm run dev:tunnel       # Start dev server and ngrok tunnel together

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

## 🌐 Remote Access with ngrok

To share your local development server with others or access it remotely:

### Quick Setup

1. **Start development server and tunnel**
   ```bash
   npm run dev:tunnel
   ```

2. **Or run them separately**
   ```bash
   # Terminal 1: Start dev server
   npm run dev
   
   # Terminal 2: Create tunnel
   npm run tunnel
   ```

### Manual ngrok Setup

1. **Install ngrok** (if not already installed)
   ```bash
   # Download from https://ngrok.com/download
   # Or install via chocolatey: choco install ngrok
   ```

2. **Authenticate ngrok** (already configured)
   ```bash
   ngrok config add-authtoken 2ksPM73of7qikDZdLAwnH11LFeW_4NJhxLQ4jNm77LGD1x6SL
   ```

3. **Create tunnel**
   ```bash
   ngrok http 5173
   ```

### Features
- **Public HTTPS URL**: Share your holographic cards with anyone
- **Traffic Inspection**: Visit `http://localhost:4040` to inspect requests
- **Real-time Updates**: Changes reflect immediately on the public URL
- **Mobile Testing**: Test holographic effects on real mobile devices

### Example Usage
```bash
# Start the development server
npm run dev

# In another terminal, create the tunnel
ngrok http 5173

# ngrok will output something like:
# Forwarding: https://abc123.ngrok.io -> http://localhost:5173
```

Now you can share the `https://abc123.ngrok.io` URL to showcase your holographic cards!

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

This project is licensed under the ISC License.## 
🎴 Holographic Effects System

This project implements advanced holographic effects based on Pokemon Cards CSS techniques with enhanced browser compatibility.

### Browser Compatibility

Our holographic effects are optimized for all modern browsers including:

- ✅ **Chrome/Chromium** - Full support with `color-dodge` blend mode
- ✅ **Firefox** - Enhanced with sRGB color space adjustments  
- ✅ **Edge** - Fallback to `plus-lighter` and `screen` blend modes
- ✅ **Safari** - WebKit optimizations applied

### Technical Implementation

#### Blend Mode Fallbacks
```css
/* Primary blend mode */
.card__foil {
  mix-blend-mode: color-dodge;
}

/* Edge fallback */
@supports (mix-blend-mode: plus-lighter) {
  .card__foil.edge-fallback {
    mix-blend-mode: plus-lighter;
    filter: saturate(160%) contrast(130%) brightness(120%);
  }
}

/* Universal fallback */
@supports not (mix-blend-mode: color-dodge) {
  .card__foil {
    mix-blend-mode: screen;
  }
}
```

#### Blend Context Isolation
```css
.holographic-card {
  background: #000;        /* Opaque background required */
  isolation: isolate;      /* Ensures proper blend context */
  border-radius: 12px;
  overflow: hidden;
}
```

### Effect Types

- **Basic** - Simple rainbow gradient with shimmer
- **Cosmic** - Galaxy effect with rotating conic gradients  
- **Rainbow** - Full spectrum with radial overlays
- **Aurora** - Pastel northern lights effect
- **Neon** - Electric cyberpunk styling
- **Galaxy** - Deep space with star field
- **Secret** - Premium gold effect with patterns

### Performance Optimizations

- **Mobile Detection** - Reduced effects on touch devices
- **Reduced Motion** - Respects user accessibility preferences
- **GPU Acceleration** - Uses `transform3d` and `will-change`
- **Blend Mode Detection** - Automatic fallbacks for unsupported browsers

### Troubleshooting

#### Effects Not Visible in Edge
1. Ensure parent containers have opaque backgrounds
2. Check that `isolation: isolate` is applied
3. Verify blend mode fallbacks are working

#### Performance Issues
1. Reduce effect intensity on mobile devices
2. Disable sparkle effects for low-end devices
3. Use `prefers-reduced-motion` media query

#### Color Differences Between Browsers
1. Colors are optimized for sRGB color space
2. Browser-specific filter adjustments are applied
3. Fallback blend modes maintain visual consistency

For detailed technical information, see `how2effect.md`.