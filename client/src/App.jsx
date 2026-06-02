import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

// Page Imports
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import PostJob from "./pages/PostJob";
import SavedJobs from "./pages/SavedJobs";
import OauthCallback from "./pages/OauthCallback";
import AITools from "./pages/AITools";
import Spinner from "./components/atoms/Spinner";

// Private Route wrapper for protection
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-2">
        <Spinner size="lg" />
        <span className="text-slate-400 text-xs font-semibold">Validating session permissions...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    // Restore session on app boot
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth-callback" element={<OauthCallback />} />

        {/* Protected Shared Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Seeker Routes */}
        <Route
          path="/saved-jobs"
          element={
            <ProtectedRoute allowedRoles={["jobseeker"]}>
              <SavedJobs />
            </ProtectedRoute>
          }
        />

        {/* Protected Employer Routes */}
        <Route
          path="/post-job"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <PostJob />
            </ProtectedRoute>
          }
        />

        {/* AI Playground - Shared but protected */}
        <Route
          path="/ai-tools"
          element={
            <ProtectedRoute>
              <AITools />
            </ProtectedRoute>
          }
        />

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
export { App };
