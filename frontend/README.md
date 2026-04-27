# My Reading Journey — Frontend

> React + Vite frontend for the My Reading Journey application.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss)
![Version](https://img.shields.io/badge/version-4.0.0-blue)

---

## Project Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   ├── logo.svg                # App logo SVG
│   └── book.svg
├── src/
│   ├── api/
│   │   ├── axios.js            # Axios instance with interceptors (auto token refresh)
│   │   ├── auth.js             # Auth API calls
│   │   ├── books.js            # Books API calls
│   │   ├── data.js             # Import/export API calls
│   │   ├── users.js            # User profile API calls
│   │   └── wishlist.js         # Wishlist API calls
│   │
│   ├── components/
│   │   ├── books/
│   │   │   ├── BookCard.jsx    # Book grid card with actions
│   │   │   ├── BookFilters.jsx # Slide-in filter panel
│   │   │   ├── BookForm.jsx    # Add/Edit book form with cover upload
│   │   │   ├── FavoriteButton.jsx
│   │   │   └── StarRating.jsx  # Half-star interactive rating
│   │   ├── common/
│   │   │   ├── AppLogo.jsx     # Inline SVG logo component
│   │   │   ├── Button.jsx      # Animated button with variants
│   │   │   ├── Card.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── Dropdown.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Hero.jsx        # Page hero with animated background
│   │   │   ├── Input.jsx       # Form input with error state
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx       # Animated modal with scroll lock
│   │   │   ├── Navbar.jsx      # Sticky navbar with dropdowns
│   │   │   ├── PageHeader.jsx  # Page title with breadcrumbs
│   │   │   ├── Pagination.jsx  # Full-featured pagination
│   │   │   ├── SearchBar.jsx
│   │   │   ├── Skeleton.jsx    # Loading skeleton cards
│   │   │   ├── StatsCard.jsx   # Animated counter stats card
│   │   │   ├── ThemeToggle.jsx
│   │   │   └── Toast.jsx       # Custom toast notifications
│   │   └── data/
│   │       ├── ExportBooks.jsx # Selective export UI
│   │       └── ImportBooks.jsx # File upload & import results UI
│   │
│   ├── context/
│   │   ├── AuthContext.jsx     # User auth state + login/logout/signup
│   │   └── ThemeContext.jsx    # Light/dark theme with localStorage
│   │
│   ├── hooks/
│   │   ├── useAuth.js          # Auth context hook
│   │   ├── useBooks.js         # Books state + CRUD operations
│   │   └── useTheme.js         # Theme context hook
│   │
│   ├── layouts/
│   │   ├── AuthLayout.jsx      # Redirect to home if logged in
│   │   └── RootLayout.jsx      # Navbar + Footer wrapper
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   └── VerifyEmail.jsx
│   │   ├── About.jsx
│   │   ├── AddBook.jsx
│   │   ├── EditBook.jsx
│   │   ├── Error.jsx           # 404, 500, 401, 413 error pages
│   │   ├── Favorites.jsx
│   │   ├── Home.jsx            # Library grid + stats
│   │   ├── Settings.jsx        # Profile, preferences, security, data
│   │   ├── ViewBook.jsx        # Book detail page
│   │   └── Wishlist.jsx        # Wishlist with add/edit modal
│   │
│   ├── router/
│   │   └── index.jsx           # React Router config with protected routes
│   │
│   ├── utils/
│   │   ├── constants.js        # Genres, formats, languages, priorities, etc.
│   │   ├── formatters.js       # Date, rating, file size formatters
│   │   └── validators.js       # Email, password, ISBN validators
│   │
│   ├── index.css               # Tailwind base + custom components & animations
│   └── main.jsx                # App entry point
│
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── postcss.config.js
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see `/backend/README.md`)

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=My Reading Journey
```

### Development

```bash
npm run dev
```

The app runs at **http://localhost:3000**.

### Build for Production

```bash
npm run build
npm run preview    # Preview the production build locally
```

---

## Design System

### Colors

The design uses a warm amber/orange primary palette defined in `tailwind.config.js`:

| Token | Hex | Usage |
|---|---|---|
| `primary-500` | `#eb9d44` | Primary actions, links, accents |
| `primary-600` | `#dc7f34` | Hover states, gradients |
| `dark-900` | `#171717` | Text in dark mode |
| `dark-50` | `#fafafa` | Background in light mode |

### Typography

- **Headings / Serif** — `Playfair Display` (book-inspired elegance)
- **Body / UI** — `Noto Sans` (clean readability)

### Custom CSS Classes

Defined in `src/index.css`:

```css
.card           /* White rounded card with border shadow */
.card-hover     /* Card with lift-on-hover animation */
.glass          /* Glassmorphism with backdrop blur */
.glass-strong   /* Stronger glassmorphism */
.gradient-primary  /* Amber gradient background */
.input-field    /* Styled input with focus ring */
.btn-primary    /* Gradient primary button */
.btn-secondary  /* Muted secondary button */
.text-gradient  /* Amber gradient text */
.spinner        /* Spinning loader */
.shimmer        /* Loading shimmer animation */
```

---

## Authentication

Authentication uses **JWT tokens**:

- `access_token` — stored in `localStorage`, attached to every request via Axios interceptor
- `refresh_token` — stored in an **httpOnly cookie**, automatically used to get new access tokens

The Axios interceptor in `src/api/axios.js` handles token expiry transparently:

1. Request fails with `401`
2. Interceptor calls `POST /auth/refresh` using the cookie
3. New access token is stored and the original request is retried
4. If refresh also fails → user is redirected to `/login`

---

## Routing

Routes are defined in `src/router/index.jsx`:

| Path | Component | Protected |
|---|---|---|
| `/` | `Home` | ✅ |
| `/add-book` | `AddBook` | ✅ |
| `/books/:id` | `ViewBook` | ✅ |
| `/books/:id/edit` | `EditBook` | ✅ |
| `/favorites` | `Favorites` | ✅ |
| `/wishlist` | `Wishlist` | ✅ |
| `/import` | `ImportBooks` | ✅ |
| `/export` | `ExportBooks` | ✅ |
| `/settings` | `Settings` | ✅ |
| `/about` | `About` | ❌ |
| `/login` | `Login` | Public only |
| `/signup` | `Signup` | Public only |
| `/forgot-password` | `ForgotPassword` | Public only |
| `/reset-password/:token` | `ResetPassword` | Public only |
| `/verify-email` | `VerifyEmail` | ❌ |
| `*` | `Error` (404) | ❌ |

**`ProtectedRoute`** — redirects to `/login` if no user session  
**`PublicRoute`** — redirects to `/` if already logged in

---

## Key Dependencies

```json
"axios": "^1.6.7",            // HTTP client with interceptors
"date-fns": "^3.3.1",         // Date formatting
"framer-motion": "^11.0.5",   // Animations
"lucide-react": "^0.575.0",   // Icons
"react": "^18.3.1",
"react-dom": "^18.3.1",
"react-dropzone": "^14.2.3",  // File drag-and-drop
"react-hot-toast": "^2.4.1",  // Toast notifications
"react-router-dom": "^6.22.0"
```

---

## Key Component Patterns

### `useBooks` hook

Centralizes all book state and API calls:

```jsx
const { books, stats, loading, fetchBooks, createBook, deleteBook, toggleFavorite } = useBooks();
```

### Toast notifications

```jsx
import { toast } from '../components/common/Toast';

toast.success('Book added!');
toast.error('Something went wrong');
toast.warning('Check your inputs');
toast.info('Import completed');
```

### StarRating

Supports half-star precision, hover preview, readonly mode, and multiple sizes:

```jsx
<StarRating rating={4.5} onChange={setRating} size="lg" showValue />
<StarRating rating={book.rating} readonly size="sm" />
```

### Pagination

```jsx
<Pagination
  currentPage={page}
  totalPages={totalPages}
  totalItems={total}
  itemsPerPage={limit}
  onPageChange={setPage}
  onItemsPerPageChange={setLimit}
  itemLabel="books"
/>
```

---

## Dark Mode

Dark mode is managed via `ThemeContext` and `localStorage`. Tailwind's `class` strategy is used — toggling the `dark` class on `<html>`.

```jsx
const { theme, toggleTheme, isDark } = useTheme();
```

---

## Build Output

```bash
npm run build
# Output: frontend/dist/
```

The build is optimized with manual chunk splitting:
- `react-vendor` — React, ReactDOM, React Router
- `ui-vendor` — Framer Motion, Lucide React

---

## Linting

```bash
npm run lint
```

Uses ESLint with React and React Hooks plugins.
