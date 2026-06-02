import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import SeekerDashboard from "./SeekerDashboard";
import EmployerDashboard from "./EmployerDashboard";
import PublicLayout from "../../components/templates/PublicLayout";
import Spinner from "../../components/atoms/Spinner";

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if checked and not authenticated
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Spinner size="lg" />
          <span className="text-slate-400 text-sm font-semibold">Loading dashboard session...</span>
        </div>
      </PublicLayout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <PublicLayout>
      {user?.role === "employer" ? <EmployerDashboard /> : <SeekerDashboard />}
    </PublicLayout>
  );
};

export default Dashboard;
export { Dashboard };
