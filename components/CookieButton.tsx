import React, { useState, MouseEvent, PointerEvent, useMemo } from 'react';
import { soundService } from '../services/soundService';
import { formatNumber } from '../utils';

interface Props {
  onClick: () => void;
  cursorCount?: number;
  clickPower: number;
}

interface ClickFeedback {
  id: number;
  text: string;
  x: number;       // Click X relative to wrapper
  y: number;       // Click Y relative to wrapper
}

const CookieButton: React.FC<Props> = ({ onClick, cursorCount = 0, clickPower }) => {
  const [feedbacks, setFeedbacks] = useState<ClickFeedback[]>([]);
  
  // Use pointer down for immediate feedback and sound unlocking
  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    // 1. Play sound immediately
    soundService.playClick();
    
    // 2. Add Visual Feedback (Floating Number Only)
    // We calculate position relative to the wrapper (parent) so that feedback
    // isn't affected by button transform (scale) animations.
    const wrapper = e.currentTarget.parentElement;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const newFeedback: ClickFeedback = {
      id: Date.now(),
      text: `+${formatNumber(clickPower)}`,
      x: clickX,
      y: clickY
    };
    
    setFeedbacks(prev => [...prev, newFeedback]);
    
    // Clean up after animation duration (1000ms)
    setTimeout(() => {
      setFeedbacks(prev => prev.filter(f => f.id !== newFeedback.id));
    }, 1000);
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    // 3. Game Logic (state update)
    // We keep this on onClick to preserve standard button behavior logic
    onClick();
  };

  // Logic to generate cursors ring
  const cursors = useMemo(() => {
    if (!cursorCount || cursorCount <= 0) return [];

    // Cap visible cursors to avoid performance issues and crowding
    const visibleCount = Math.min(cursorCount, 36); 
    
    // Adjust radius based on screen width to keep cursors close to the cookie edge
    // Mobile cookie is w-64 (256px -> 128px radius), Desktop is w-80 (320px -> 160px radius)
    // We want them close (almost touching)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const radius = isMobile ? 145 : 170;
    
    return Array.from({ length: visibleCount }).map((_, index) => {
      const angleRad = (2 * Math.PI * index) / visibleCount;
      const angleDeg = (angleRad * 180) / Math.PI;

      // Position relative to the center of the container
      const x = Math.cos(angleRad) * radius;
      const y = Math.sin(angleRad) * radius;

      // Rotation: Point towards the center.
      // O SVG do cursor aponta naturalmente para o topo-esquerda (aprox -60 a -70 graus do topo).
      // Para apontar para o centro (para dentro), precisamos ajustar a rotação.
      // A fórmula abaixo alinha a ponta do cursor com o centro do biscoito.
      const rotation = angleDeg - 65;

      // Animation delay to create the wave effect
      // 0.08s entre cada cursor para um efeito de onda rápido
      const delay = index * 0.08;

      return {
        id: index,
        style: {
          left: `calc(50% + ${x}px)`,
          top: `calc(50% + ${y}px)`,
          '--cursor-rotation': `${rotation}deg`,
          animationDelay: `${delay}s`,
        } as React.CSSProperties
      };
    });
  }, [cursorCount]);

  return (
    <div className="relative select-none flex flex-col items-center justify-center py-8 cookie-wrapper">
      {/* Cursor Ring Container */}
      <div className="cursor-ring" id="cursor-ring">
        {cursors.map((cursor) => (
          <div key={cursor.id} className="cursor-helper" style={cursor.style}>
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 50 50" style={{ display: 'block' }}>
              <path d="M 29.699219 47 C 29.578125 47 29.457031 46.976563 29.339844 46.933594 C 29.089844 46.835938 28.890625 46.644531 28.78125 46.398438 L 22.945313 32.90625 L 15.683594 39.730469 C 15.394531 40.003906 14.96875 40.074219 14.601563 39.917969 C 14.238281 39.761719 14 39.398438 14 39 L 14 6 C 14 5.601563 14.234375 5.242188 14.601563 5.082031 C 14.964844 4.925781 15.390625 4.996094 15.683594 5.269531 L 39.683594 27.667969 C 39.972656 27.9375 40.074219 28.355469 39.945313 28.726563 C 39.816406 29.101563 39.480469 29.363281 39.085938 29.398438 L 28.902344 30.273438 L 35.007813 43.585938 C 35.117188 43.824219 35.128906 44.101563 35.035156 44.351563 C 34.941406 44.601563 34.757813 44.800781 34.515625 44.910156 L 30.113281 46.910156 C 29.980469 46.96875 29.84375 47 29.699219 47 Z"></path>
            </svg>
          </div>
        ))}
      </div>

      <button
        id="cookie-button"
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        className="group relative transition-transform active:scale-95 focus:outline-none touch-manipulation cursor-pointer z-10"
        aria-label="Assar Biscoito"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-amber-400 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
        
        {/* The Cookie Image */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 bg-amber-600 rounded-full shadow-[inset_-10px_-10px_30px_rgba(0,0,0,0.3),5px_10px_20px_rgba(0,0,0,0.2)] flex items-center justify-center border-4 border-amber-700 hover:brightness-105 transition-all">
          {/* Chocolate Chips */}
          <div className="absolute top-[20%] left-[30%] w-8 h-8 bg-amber-900 rounded-full opacity-80 shadow-sm" />
          <div className="absolute top-[50%] left-[20%] w-10 h-10 bg-amber-900 rounded-full opacity-80 shadow-sm" />
          <div className="absolute top-[60%] right-[30%] w-9 h-9 bg-amber-900 rounded-full opacity-80 shadow-sm" />
          <div className="absolute top-[25%] right-[25%] w-7 h-7 bg-amber-900 rounded-full opacity-80 shadow-sm" />
          <div className="absolute bottom-[20%] left-[45%] w-8 h-8 bg-amber-900 rounded-full opacity-80 shadow-sm" />
          
          {/* Subtle texture */}
          <div className="absolute inset-0 rounded-full opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz4KPC9zdmc+')] mix-blend-overlay" />
        </div>
      </button>

      {/* 
        Render Feedback Effects (Outside button, inside wrapper) 
        This prevents button scaling from affecting the feedback elements 
      */}
      {feedbacks.map(fb => (
        <div 
          key={fb.id}
          className="click-feedback click-floating-number"
          style={{ 
            left: `${fb.x}px`,
            top: `${fb.y - 10}px`, // Slight offset upwards
          } as React.CSSProperties}
        >
          {fb.text}
        </div>
      ))}
      
      <p className="mt-6 text-amber-800 opacity-60 text-sm animate-pulse z-10">
        Clique para assar!
      </p>
    </div>
  );
};

export default CookieButton;