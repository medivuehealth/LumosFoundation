# Lumos Foundation Website

A modern, accessible website for Lumos Foundation - a charitable organization dedicated to supporting children and families affected by Pediatric IBD and Oncology. Part of the officially registered Medivue NPO in North Carolina.

## 🌟 Mission

Lumos Foundation is committed to:
- **Awareness**: Spreading knowledge about pediatric IBD and oncology
- **Support**: Providing direct assistance to families through grants and counseling
- **Hope**: Funding research and innovative programs to improve outcomes

## 🚀 Features

### Frontend
- **Modern React Application** with Tailwind CSS
- **Responsive Design** optimized for all devices
- **Accessible UI** following WCAG guidelines
- **Custom Color Palette** themed for medical/healthcare
- **Interactive Forms** for donations, volunteering, and contact

### Sections
- **Hero Section** with mission statement
- **Mission & Values** overview
- **Blog** with educational content and success stories
- **Events** calendar and upcoming activities
- **Volunteer Opportunities** with signup form
- **Donation System** for financial support
- **Contact Form** for inquiries and support

## 🛠️ Technology Stack

- **Frontend**: React 18, Tailwind CSS
- **Styling**: Custom CSS with medical-themed color palette
- **Build Tool**: Create React App
- **Deployment**: Ready for GitHub Pages, Netlify, or Vercel

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/lumos-foundation-website.git
   cd lumos-foundation-website
   ```

2. **Install dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the `client` directory:
   ```env
   REACT_APP_FOUNDATION_DOMAIN=lumosfoundation.org
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎨 Customization

### Color Palette
The website uses a custom Tailwind color palette:
- **IBD Purple**: Primary brand color (#9966CC)
- **Healing Green**: Support and growth (#66CC99)
- **Comfort Orange**: Warmth and hope (#CC9966)
- **Accent Colors**: Blue, Yellow, Pink for highlights

### Environment Variables
- `REACT_APP_FOUNDATION_DOMAIN`: Set your domain name

## 📁 Project Structure

```
lumos-foundation-website/
├── client/                 # React frontend application
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── App.js         # Main application component
│   │   ├── index.css      # Global styles with Tailwind
│   │   └── index.js       # Application entry point
│   ├── package.json       # Frontend dependencies
│   └── tailwind.config.js # Tailwind configuration
├── README.md              # This file
└── .gitignore            # Git ignore rules
```

## 🚀 Deployment

### GitHub Pages
1. Push to GitHub
2. Go to repository Settings > Pages
3. Select source branch (main/master)
4. Set build folder to `/docs` or use GitHub Actions

### Netlify
1. Connect your GitHub repository
2. Set build command: `cd client && npm run build`
3. Set publish directory: `client/build`

### Vercel
1. Import your GitHub repository
2. Set root directory to `client`
3. Deploy automatically

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Contact

- **Website**: [lumosfoundation.org](https://lumosfoundation.org)
- **Email**: info@lumosfoundation.org
- **Location**: North Carolina, USA

## 📄 License

This project is part of Medivue NPO, a registered nonprofit organization in North Carolina.

## 🙏 Acknowledgments

- Inspired by [The Little Lights Foundation](https://www.thelittlelightsfoundation.org/)
- Built with modern web technologies for accessibility and performance
- Designed for families affected by Pediatric IBD and Oncology

---

**Lumos Foundation** - Lighting the Path for Pediatric IBD & Oncology
