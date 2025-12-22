# Vivek Ojha - Backend Engineer Portfolio

A modern, responsive portfolio website showcasing backend engineering expertise with 3D animations and smooth interactions.

## 🚀 Features

- **3D Network Visualization**: Interactive Three.js animation representing microservices architecture
- **Smooth Animations**: Framer Motion for fluid page transitions and scroll animations
- **Responsive Design**: Fully responsive across all devices
- **Dark Theme**: Modern dark UI optimized for developer aesthetic
- **SEO Optimized**: Meta tags and structured data for better search visibility

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **3D Graphics**: Three.js with React Three Fiber
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Vercel will auto-detect Next.js and deploy
5. Your site will be live at `your-project.vercel.app`

**Quick Deploy:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

- **Netlify**: Connect your GitHub repo and deploy
- **Railway**: Import project and deploy with one click

## 📂 Project Structure

```
portfolio/
├── app/
│   ├── layout.tsx       # Root layout with metadata
│   ├── page.tsx         # Main page
│   └── globals.css      # Global styles
├── components/
│   ├── Hero.tsx         # Hero section with 3D background
│   ├── About.tsx        # About section
│   ├── Experience.tsx   # Work experience timeline
│   ├── TechStack.tsx    # Technical skills
│   ├── Contact.tsx      # Contact information
│   └── NetworkVisualization.tsx  # Three.js 3D network
└── public/              # Static assets
```

## 🎨 Customization

### Update Personal Information

Edit the following files:
- `components/Hero.tsx` - Name, title, links
- `components/About.tsx` - Bio and achievements
- `components/Experience.tsx` - Work history
- `components/TechStack.tsx` - Skills and technologies
- `components/Contact.tsx` - Contact details

### Modify Theme Colors

Edit Tailwind classes in components or customize `tailwind.config.ts`

## 📝 License

MIT License - feel free to use this template for your own portfolio!

## 🤝 Contact

- **Email**: vivekojha961@gmail.com
- **LinkedIn**: [vivek-ojha](https://www.linkedin.com/in/vivek-ojha-a540a9172/)
- **GitHub**: [@vivekko](https://github.com/vivekko)

---

Built with ❤️ using Next.js and Three.js
