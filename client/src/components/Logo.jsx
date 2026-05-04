import React from 'react';

/**
 * Logo component that recreates the user's provided design with 
 * pure CSS, adding glassy effects and smooth hover animations.
 */
export default function Logo({ size = "md", className = "" }) {
  const sizeMap = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  const crossSizeMap = {
    xs: "w-[1px] h-[1px]",
    sm: "w-[1.5px] h-[1.5px]",
    md: "w-[2px] h-[2px]",
    lg: "w-[3px] h-[3px]",
    xl: "w-[4px] h-[4px]"
  };

  const selectedSize = sizeMap[size] || sizeMap.md;
  const crossThickness = crossSizeMap[size] || crossSizeMap.md;

  return (
    <div className={`relative ${selectedSize} group cursor-pointer ${className}`}>
      {/* Outer Glow & Glassy Container */}
      <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-90 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] overflow-hidden">
        
        {/* Four Quadrants */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          <div className="bg-[#7ee0b3] opacity-90 group-hover:opacity-100 transition-opacity" /> {/* Top Left: Mint */}
          <div className="bg-[#22d3ee] opacity-90 group-hover:opacity-100 transition-opacity" /> {/* Top Right: Cyan */}
          <div className="bg-[#f87171] opacity-90 group-hover:opacity-100 transition-opacity" /> {/* Bottom Left: Coral */}
          <div className="bg-[#fbbf24] opacity-90 group-hover:opacity-100 transition-opacity" /> {/* Bottom Right: Amber */}
        </div>

        {/* Separator Cross (Glassy White) */}
        <div className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 bg-white/80 z-10 ${crossThickness.split(' ')[0]}`} />
        <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 bg-white/80 z-10 ${crossThickness.split(' ')[1]}`} />
        
        {/* Shine Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
