import React from "react";

export default function Section({ title, description, children, className = "" }) {
  return (
    <section className={`mb-8 ${className}`}>
      {title && <h2 className="text-2xl font-bold text-spicy-red mb-2">{title}</h2>}
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      {children}
    </section>
  );
} 