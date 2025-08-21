import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'spicy' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    spicy: 'border-amber-500',
    primary: 'border-blue-500',
    secondary: 'border-gray-500',
    success: 'border-green-500',
    warning: 'border-yellow-500',
    error: 'border-red-500'
  };

  return (
    <div className="flex items-center justify-center">
      <div 
        className={`
          ${sizeClasses[size]} 
          border-2 border-gray-300/30 
          ${colorClasses[color]}
          border-t-transparent 
          rounded-full 
          animate-spin
        `}
      />
    </div>
  );
};

export default LoadingSpinner;
