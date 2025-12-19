# IVM Premium Showroom - Next.js Version

This is the Next.js version of the IVM Premium Showroom website, migrated from Vite to leverage Next.js SSR/SSG capabilities.

## 🚀 Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Server-Side Rendering (SSR)** and **Static Site Generation (SSG)**
- **Optimized Images** using Next.js Image component
- **Code Splitting** with React Suspense
- **Accessibility** features (ARIA, keyboard navigation)
- **Performance Optimizations** (lazy loading, preloading)

## 📦 Installation

```bash
npm install
```

## 🛠️ Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with fonts and metadata
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── FeaturedModels.tsx
│   ├── VirtualTour.tsx
│   ├── ContactForm.tsx
│   ├── Footer.tsx
│   └── ...
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and constants
├── types/                  # TypeScript type definitions
└── public/                 # Static assets
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Optional: Gemini API Key for image generation
GEMINI_API_KEY=your_api_key_here
```

### Next.js Config

The `next.config.js` file is configured for:
- Image optimization with Unsplash domain
- Standalone output for deployment
- Font optimization
- Compression

## 🎨 Design System

The design follows the AI Studio-inspired UI refinements:
- Premium showroom aesthetic
- Glassmorphism effects
- 3D card hover effects
- Micro-interactions
- Contextual feedback

## 📱 Responsive Design

The website is fully responsive and optimized for:
- Mobile devices
- Tablets
- Desktop screens

## ♿ Accessibility

- ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Screen reader support
- Color contrast compliance (WCAG AA)

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Other Platforms

The `output: 'standalone'` configuration allows deployment to any Node.js hosting platform.

## 📝 Migration Notes

This project was migrated from Vite to Next.js. Key changes:
- All components marked with `'use client'` where needed
- Imports updated to use `@/` alias
- Next.js Image component used for optimized images
- App Router structure implemented
- SSR/SSG capabilities enabled

## 🔄 Next Steps

1. Set up environment variables
2. Configure deployment platform
3. Add analytics (optional)
4. Set up form submission endpoint
5. Configure image CDN (optional)

## 📄 License

All rights reserved - Innoson Vehicle Manufacturing

