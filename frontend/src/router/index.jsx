import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import RootLayout from '../layouts/RootLayout';

// Auth Pages
import Login from "../pages/auth/Login"; 
import Signup from "../pages/auth/Signup";
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

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Wrapper (redirects to home if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
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
      {
        path: 'about',
        element: <About />,
      },
    ],
  },
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
  {
    path: '/verify-email',
    element: <VerifyEmail />,
  },
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