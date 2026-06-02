import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, ArrowRight } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import Input from "../components/atoms/Input";
import Button from "../components/atoms/Button";
import PublicLayout from "../components/templates/PublicLayout";

const Login = () => {
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError("Please fill out all fields.");
      return;
    }

    setFormError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setFormError(err.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect browser directly to backend oauth endpoint
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <PublicLayout>
      <div className="max-w-md w-full mx-auto py-12">
        <div className="glass-panel border border-slate-100 p-8 rounded-3xl shadow-xl animate-fade-in">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Welcome Back</h2>
            <p className="text-slate-400 text-xs mt-1.5">Sign in to search local jobs & access AI tools</p>
          </div>

          {formError && (
            <div className="mt-6 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold px-4 py-2.5 rounded-xl text-center">
              {formError}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <Button type="submit" isLoading={isLoading} className="w-full mt-2 font-semibold">
              Sign In <LogIn className="w-4 h-4" />
            </Button>
          </form>

          {/* Social login partition divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-slate-100 w-full"></div>
            <span className="absolute bg-white px-3 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Or continue with
            </span>
          </div>

          {/* Google OAuth Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-slate-200 bg-white/70 hover:bg-slate-50 transition-colors p-3 rounded-xl cursor-pointer text-slate-700 text-sm font-semibold hover:shadow-sm active:scale-[0.98]"
          >
            {/* Minimalist Google Icon */}
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6a5.66 5.66 0 0 1-2.45 3.7v3.08h3.97c2.32-2.14 3.63-5.3 3.63-8.61z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.97-3.08c-1.12.75-2.54 1.2-3.96 1.2-3.05 0-5.63-2.06-6.55-4.83H1.31v3.19A12 12 0 0 0 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.45 14.38a7.24 7.24 0 0 1 0-4.76V6.43H1.31a12 12 0 0 0 0 11.14l4.14-3.19z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.31 6.43l4.14 3.19c.92-2.77 3.5-4.83 6.55-4.83z"
              />
            </svg>
            Google OAuth
          </button>

          <p className="text-slate-500 text-center text-xs mt-8">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-600 font-semibold hover:underline inline-flex items-center gap-0.5">
              Sign up <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Login;
export { Login };
