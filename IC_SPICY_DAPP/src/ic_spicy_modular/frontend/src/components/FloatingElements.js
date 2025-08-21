import React, { useEffect, useRef } from 'react';

const FloatingElements = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Create floating elements
    const elements = [
      { emoji: '🌶️', delay: 0, duration: 6 },
      { emoji: '⚡', delay: 1, duration: 8 },
      { emoji: '💎', delay: 2, duration: 7 },
      { emoji: '🚀', delay: 3, duration: 9 },
      { emoji: '🔥', delay: 4, duration: 5 },
      { emoji: '✨', delay: 5, duration: 6 },
    ];

    elements.forEach((element, index) => {
      const div = document.createElement('div');
      div.innerHTML = element.emoji;
      div.className = 'fixed text-4xl pointer-events-none z-10 opacity-20 hover:opacity-60 transition-opacity duration-300';
      div.style.left = `${20 + (index * 15)}%`;
      div.style.top = `${30 + (index * 10)}%`;
      div.style.animationDelay = `${element.delay}s`;
      div.style.animationDuration = `${element.duration}s`;
      div.style.animation = 'float ease-in-out infinite';
      
      // Add mouse interaction
      div.addEventListener('mouseenter', () => {
        div.style.transform = 'scale(1.5) rotate(15deg)';
        div.style.filter = 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.8))';
      });
      
      div.addEventListener('mouseleave', () => {
        div.style.transform = 'scale(1) rotate(0deg)';
        div.style.filter = 'none';
      });

      container.appendChild(div);
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-10" />
  );
};

export default FloatingElements; 