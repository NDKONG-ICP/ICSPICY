import React from "react";

export default function Badge({ children, color = "spicy-red", className = "" }) {
  return (
    <span className={`inline-block px-2 py-1 text-xs rounded bg-${color} text-white font-semibold ${className}`}>
      {children}
    </span>
  );
} 