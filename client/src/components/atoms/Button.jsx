import React from "react";
import { cn } from "@/lib/utils";
import Spinner from "./Spinner";

const Button = ({
  children,
  variant = "default",
  size = "md",
  isLoading = false,
  disabled = false,
  className,
  icon,
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50 gap-2 cursor-pointer";
  
  const variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 focus:ring-indigo-500",
    secondary: "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20 focus:ring-emerald-500",
    outline: "border border-slate-200 bg-white/50 text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:ring-indigo-500",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500",
    danger: "bg-rose-500 text-white hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-500/20 focus:ring-rose-500"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base rounded-2xl"
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(baseStyle, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      {!isLoading && icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
export { Button };
