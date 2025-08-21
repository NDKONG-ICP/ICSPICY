import React from "react";

export default function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 mb-4 border border-gray-100 ${className}`}>
      {title && <h2 className="text-xl font-semibold text-spicy-red mb-2">{title}</h2>}
      {children}
    </div>
  );
} 