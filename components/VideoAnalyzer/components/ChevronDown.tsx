import React from 'react';

interface ChevronDownProps {
  isOpen: boolean;
  size?: number;
}

export const ChevronDown: React.FC<ChevronDownProps> = ({ isOpen, size = 20 }) => {
  const svgSize = Math.max(8, size * 0.6); // SVG 크기를 컨테이너 크기에 비례하게
  
  return (
    <div 
      style={{
        cursor: 'pointer', 
        width: `${size}px`, 
        height: `${size}px`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        transform: `translateY(2px) ${isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}`, 
        transition: 'transform 0.2s'
      }}>
      <svg width={svgSize} height={svgSize * 0.67} viewBox="0 0 12 8" fill="none">
        <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
};