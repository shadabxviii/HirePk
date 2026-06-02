import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Spinner from "../components/atoms/Spinner";

const OauthCallback = () => {
  const [searchParams] = useSearchParams();
  const { setToken, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const processOauth = async () => {
      const token = searchParams.get("token");
      if (token) {
        // Set token globally in Zustand store
        setToken(token);
        // Refresh profile details using token
        await checkAuth();
        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        console.error("No token returned in Google OAuth callback URL.");
        navigate("/login");
      }
    };
    processOauth();
  }, [searchParams, setToken, checkAuth, navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-3 bg-slate-50">
      <Spinner size="lg" />
      <span className="text-slate-400 text-xs font-semibold animate-pulse">
        Completing Google Sign In authorization...
      </span>
    </div>
  );
};

export default OauthCallback;
export { OauthCallback };
