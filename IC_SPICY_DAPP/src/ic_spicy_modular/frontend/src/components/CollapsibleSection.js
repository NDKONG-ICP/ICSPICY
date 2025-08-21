import React, { useState, useRef, useEffect } from 'react';

const CollapsibleSection = ({ title, icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [height, setHeight] = useState('0px');

  useEffect(() => {
    setHeight(open ? `${contentRef.current.scrollHeight}px` : '0px');
  }, [open]);

  return (
    <div className="mb-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg overflow-hidden transition-all duration-500">
      <button
        className={`w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none transition-colors duration-300 ${open ? 'bg-accent-gold/10' : 'hover:bg-white/20'}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="flex items-center space-x-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <span className="text-xl md:text-2xl font-bold text-white drop-shadow">{title}</span>
        </div>
        <span className={`transform transition-transform duration-300 ${open ? 'rotate-90' : ''} text-accent-gold text-2xl`}>▶</span>
      </button>
      <div
        ref={contentRef}
        style={{ maxHeight: height, opacity: open ? 1 : 0, transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s' }}
        className="px-6 pb-6"
        aria-hidden={!open}
      >
        <div className="pt-2">{children}</div>
      </div>
    </div>
  );
};

export default CollapsibleSection; 