import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import RootLayout from '../layouts/RootLayout';

// Landing page
import Landing from '../pages/Landing';

// Auth Pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import VerifyEmail from '../pages/auth/VerifyEmail';

// Main Pages
import Home from '../pages/Home';
import AddBook from '../pages/AddBook';
import ViewBook from '../pages/ViewBook';
import EditBook from '../pages/EditBook';
import Favorites from '../pages/Favorites';
import Wishlist from '../pages/Wishlist';
import Settings from '../pages/Settings';
import About from '../pages/About';
import ImportBooks from '../components/data/ImportBooks';
import ExportBooks from '../components/data/ExportBooks';

// Error Page
import Error from '../pages/Error';

// ── Route guards ────────────────────────────────────────────────────────────

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-950">
    <div className="spinner w-12 h-12" />
  </div>
);

/** Shows Home for logged-in users, Landing for guests. */
const SmartHome = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <Home /> : <Landing />;
};

/** Redirect to '/' if not logged in. */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

/** Redirect to '/' if already logged in. */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/" replace />;
  return children;
};

// ── Router ──────────────────────────────────────────────────────────────────

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Root: Landing for guests, library for logged-in users
      {
        index: true,
        element: <SmartHome />,
      },

      // Protected app routes
      {
        path: 'add-book',
        element: (
          <ProtectedRoute>
            <AddBook />
          </ProtectedRoute>
        ),
      },
      {
        path: 'books/:id',
        element: (
          <ProtectedRoute>
            <ViewBook />
          </ProtectedRoute>
        ),
      },
      {
        path: 'books/:id/edit',
        element: (
          <ProtectedRoute>
            <EditBook />
          </ProtectedRoute>
        ),
      },
      {
        path: 'favorites',
        element: (
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        ),
      },
      {
        path: 'wishlist',
        element: (
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        ),
      },
      {
        path: 'import',
        element: (
          <ProtectedRoute>
            <ImportBooks />
          </ProtectedRoute>
        ),
      },
      {
        path: 'export',
        element: (
          <ProtectedRoute>
            <ExportBooks />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },

      // Public app pages (accessible to all)
      {
        path: 'about',
        element: <About />,
      },
    ],
  },

  // Auth routes (public only — redirect logged-in users to '/')
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/signup',
    element: (
      <PublicRoute>
        <Signup />
      </PublicRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <ForgotPassword />
      </PublicRoute>
    ),
  },
  {
    path: '/reset-password/:token',
    element: (
      <PublicRoute>
        <ResetPassword />
      </PublicRoute>
    ),
  },

  // Email verification — accessible to all
  {
    path: '/verify-email',
    element: <VerifyEmail />,
  },

  // Error pages
  {
    path: '/error/:type',
    element: <Error />,
  },
  {
    path: '*',
    element: <Error type="404" />,
  },
]);

export default router;
