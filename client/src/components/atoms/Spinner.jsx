import React from "react";
import { cn } from "@/lib/utils";

const Spinner = ({ size = "md", className }) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-3",
    xl: "w-16 h-16 border-4"
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-t-transparent border-primary/90",
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      style={{ borderColor: "currentColor", borderTopColor: "transparent" }}
    />
  );
};

export default Spinner;
