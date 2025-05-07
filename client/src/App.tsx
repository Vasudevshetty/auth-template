import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { getCurrentUser } from "./features/auth/authSlice";
import MainLayout from "./components/layout/MainLayout";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Dashboard from "./components/Dashboard";
import Spinner from "./components/common/Spinner";

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check authentication status on app load by calling getCurrentUser
    // The endpoint will check for valid cookies
    dispatch(getCurrentUser());
  }, [dispatch]);

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <Register />
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* OAuth callback routes - these will be handled by the backend */}
          <Route
            path="/auth/github/callback"
            element={<Navigate to="/" replace />}
          />
          <Route
            path="/auth/google/callback"
            element={<Navigate to="/" replace />}
          />
          <Route
            path="/auth/facebook/callback"
            element={<Navigate to="/" replace />}
          />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            {/* Add more protected routes here */}
          </Route>

          {/* Catch-all route for 404s */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
