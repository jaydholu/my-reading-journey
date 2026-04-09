# My Reading Journey - Frontend

Modern React application for tracking your reading journey.

## Tech Stack

- **React 18.3** - UI framework
- **React Router 6.22** - Navigation
- **Tailwind CSS 3.4** - Styling
- **Framer Motion 11** - Animations
- **Axios 1.6** - HTTP client
- **date-fns 3.3** - Date utilities
- **Vite 5.1** - Build tool

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update environment variables:
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=My Reading Journey
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

Create production build:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure
```
frontend/
├── src/
│   ├── api/              # API integration
│   ├── components/       # React components
│   │   ├── common/       # Shared components
│   │   ├── auth/         # Auth components
│   │   ├── books/        # Book components
│   │   └── data/         # Data components
│   ├── context/          # React Context
│   ├── hooks/            # Custom hooks
│   ├── layouts/          # Layout components
│   ├── pages/            # Page components
│   ├── router/           # Router configuration
│   ├── utils/            # Utility functions
│   ├── index.css         # Global styles
│   └── main.jsx          # App entry point
├── public/               # Static assets
├── index.html            # HTML template
├── tailwind.config.js    # Tailwind configuration
├── vite.config.js        # Vite configuration
└── package.json          # Dependencies
```

## Features

- ✅ User authentication (JWT)
- ✅ Book CRUD operations
- ✅ Cover image upload
- ✅ Favorites management
- ✅ Reading statistics
- ✅ Data import/export
- ✅ Dark mode
- ✅ Responsive design
- ✅ Smooth animations

## Component Guidelines

### Styling
- Use Tailwind utility classes
- Follow dark mode conventions
- Implement responsive design

### State Management
- Use React Context for global state
- Use custom hooks for data fetching
- Keep component state local when possible

### Code Quality
- Follow ESLint rules
- Use meaningful variable names
- Write clean, readable code
- Add comments for complex logic

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

MIT License - see LICENSE file for details