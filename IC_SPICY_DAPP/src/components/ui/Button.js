import React from "react";

export default function Button({ children, onClick, variant = "primary", className = "", ...props }) {
  const base = "px-4 py-2 rounded font-semibold focus:outline-none transition-colors";
  const variants = {
    primary: "bg-spicy-red text-white hover:bg-spicy-green",
    secondary: "bg-spicy-green text-white hover:bg-spicy-red",
    outline: "border border-spicy-red text-spicy-red bg-white hover:bg-spicy-red hover:text-white",
  };
  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
} 