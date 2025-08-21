import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import InteractiveButton from './InteractiveButton';

const ModuleCard = ({ module }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => { setIsHovered(false); setIsPressed(false); };
  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);

  return (
    <div
      className="group relative card shadow-soft border border-slate-700"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Main Card */}
      <div className={`
        relative rounded-2xl p-6 transition-all duration-500 cursor-pointer overflow-hidden
        ${isHovered ? 'scale-105' : ''}
        ${isPressed ? 'scale-95' : ''}
      `}>
        {/* Icon Container */}
        <div className="relative mb-6">
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-soft
            transition-all duration-500 group-hover:scale-110 group-hover:rotate-6
            bg-slate-800
          `}>
            {module.icon}
          </div>
        </div>
        {/* Content */}
        <div className="relative z-10 space-y-4">
          <h3 className="text-xl font-bold" style={{color: '#ffe066'}}>
            {module.title}
          </h3>
          <p className="text-accent-soft text-sm leading-relaxed" style={{color: '#bfc9d1'}}>
            {module.description}
          </p>
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent-teal rounded-full animate-pulse" />
              <span className="text-xs text-accent-teal font-medium">Active</span>
            </div>
            <InteractiveButton
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={e => { e.preventDefault(); e.stopPropagation(); }}
            >
              Explore →
            </InteractiveButton>
          </div>
        </div>
      </div>
      <Link to={module.path} className="absolute inset-0 z-20" />
    </div>
  );
};

export default ModuleCard; 