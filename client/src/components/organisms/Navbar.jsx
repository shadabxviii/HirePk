import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Briefcase, Bot, User, LogOut, FileText, Bookmark, PlusCircle } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import Button from "../atoms/Button";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    navigate("/");
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 w-full border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 select-none group">
              <div className="bg-indigo-600 text-white p-2 rounded-xl group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                HirePK
              </span>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/jobs" className="text-slate-600 hover:text-indigo-600 text-sm font-medium transition-colors">
              Find Jobs
            </Link>
            <Link to="/ai-tools" className="text-slate-600 hover:text-indigo-600 text-sm font-medium transition-colors flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-emerald-500" />
              AI Tools
            </Link>
            
            {isAuthenticated && user?.role === "employer" && (
              <>
                <Link to="/post-job" className="text-slate-600 hover:text-indigo-600 text-sm font-medium transition-colors flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-indigo-500" />
                  Post a Job
                </Link>
              </>
            )}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 focus:outline-none cursor-pointer border border-slate-200 bg-white/80 p-1.5 pr-3 rounded-xl hover:bg-slate-50 transition-all"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center font-bold text-indigo-600">
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                  <span className="text-slate-700 text-sm font-semibold truncate max-w-[120px]">
                    {user?.name}
                  </span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 animate-fade-in z-50">
                    <div className="px-4 py-2 border-b border-slate-50">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Role</p>
                      <p className="text-xs font-semibold text-slate-600 capitalize mt-0.5">{user?.role}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Dashboard
                    </Link>

                    {user?.role === "jobseeker" && (
                      <>
                        <Link
                          to="/saved-jobs"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <Bookmark className="w-4 h-4" />
                          Saved Jobs
                        </Link>
                      </>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left border-t border-slate-50 mt-1 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-indigo-600 p-2 rounded-xl focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-slate-100/60 p-4 absolute top-16 left-0 w-full shadow-lg animate-fade-in">
          <div className="flex flex-col gap-4">
            <Link
              to="/jobs"
              onClick={() => setIsOpen(false)}
              className="text-slate-600 hover:text-indigo-600 text-sm font-semibold py-1.5 transition-colors"
            >
              Find Jobs
            </Link>
            <Link
              to="/ai-tools"
              onClick={() => setIsOpen(false)}
              className="text-slate-600 hover:text-indigo-600 text-sm font-semibold py-1.5 transition-colors flex items-center gap-1.5"
            >
              <Bot className="w-4 h-4 text-emerald-500" />
              AI Tools
            </Link>

            {isAuthenticated ? (
              <div className="border-t border-slate-100 pt-4 mt-2 flex flex-col gap-3">
                <div className="flex items-center gap-3 px-1 py-1">
                  <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center font-bold text-indigo-700">
                    {user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-600 hover:text-indigo-600 text-sm font-medium py-1.5 transition-colors"
                >
                  Dashboard
                </Link>

                {user?.role === "jobseeker" && (
                  <Link
                    to="/saved-jobs"
                    onClick={() => setIsOpen(false)}
                    className="text-slate-600 hover:text-indigo-600 text-sm font-medium py-1.5 transition-colors"
                  >
                    Saved Jobs
                  </Link>
                )}

                {user?.role === "employer" && (
                  <Link
                    to="/post-job"
                    onClick={() => setIsOpen(false)}
                    className="text-slate-600 hover:text-indigo-600 text-sm font-medium py-1.5 transition-colors"
                  >
                    Post a Job
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-rose-600 text-sm font-semibold py-2 mt-2 border-t border-slate-100 text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="border-t border-slate-100 pt-4 mt-2 flex flex-col gap-3">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  <Button variant="default" className="w-full">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
export { Navbar };
