# QRCRAFT

🎨 **AI-Powered QR Code Studio** - Generate, customize, scan, and track beautiful QR codes with AI superpowers.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## ✨ Features

- 🎯 **16 Content Types**: URL, WhatsApp, Instagram, WiFi, vCard, Email, SMS, and more
- 🤖 **AI Assistant**: Chat-based QR generation with conversation memory
- 🎨 **Smart Design**: AI-powered color and template suggestions
- 📊 **Analytics Dashboard**: Track scans with detailed insights
- 🔍 **QR Scanner**: Built-in camera and image-based QR scanning
- 🎭 **Custom Branding**: Templates, colors, gradients, and logo embedding
- 📦 **Batch Generation**: CSV to multiple QRs
- 🌐 **Vision OCR**: AI image-to-QR extraction

## 🚀 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **AI**: Groq (GPT-OSS models), OpenRouter (fallback)
- **Database**: Prisma + SQLite
- **UI Components**: Radix UI, shadcn/ui
- **QR Generation**: qrcode, qrcode-generator

## 🛠️ Installation

```bash
# Clone repository
git clone https://github.com/yashraj-ghemud/QRCRAFT.git
cd QRCRAFT

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env and add your API keys

# Generate Prisma client and setup database
npm run db:generate
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GROQ_API_KEY="your_groq_api_key_here"
OPENROUTER_API_KEY="your_openrouter_api_key_here"
```

### Getting API Keys:

- **Groq**: Sign up at [console.groq.com](https://console.groq.com/)
- **OpenRouter**: Sign up at [openrouter.ai](https://openrouter.ai/)

## 📦 Production Deployment

### Deploy to Render:

1. Fork this repository
2. Sign up at [render.com](https://render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables** (⚠️ IMPORTANT - All are required):
     - `DATABASE_URL`: `file:./prisma/dev.db`
     - `NEXT_PUBLIC_APP_URL`: `https://your-app-name.onrender.com` (use your actual Render URL)
     - `GROQ_API_KEY`: Your Groq API key
     - `OPENROUTER_API_KEY`: Your OpenRouter API key
     - `NODE_ENV`: `production`
6. Deploy!

### Deploy to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🧪 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
```

## 🐛 Troubleshooting

### Build Errors

If you encounter module resolution errors, ensure all dependencies are in the `dependencies` section, not `devDependencies`.

### Database Issues

For serverless deployments (Vercel, Cloudflare), use Vercel Postgres or Turso instead of SQLite.

## 📝 License

MIT

---

Built with ❤️ by [Yashraj Ghemud](https://github.com/yashraj-ghemud)

## 🌟 Show your support

Give a ⭐️ if this project helped you!
