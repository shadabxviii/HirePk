import React from "react";
import { cn } from "@/lib/utils";

const Badge = ({ children, variant = "default", icon, className, ...props }) => {
  const baseStyle = "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg select-none transition-colors";
  
  const variants = {
    default: "bg-indigo-50 text-indigo-700 border border-indigo-100",
    secondary: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    outline: "bg-white border border-slate-200 text-slate-600",
    warning: "bg-amber-50 text-amber-700 border border-amber-100",
    danger: "bg-rose-50 text-rose-700 border border-rose-100",
    info: "bg-cyan-50 text-cyan-700 border border-cyan-100"
  };

  return (
    <span className={cn(baseStyle, variants[variant], className)} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
export { Badge };
