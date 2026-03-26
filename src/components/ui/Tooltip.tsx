"use client";

import React, { useState } from "react";

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export default function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-3",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-3",
    left: "right-full top-1/2 -translate-y-1/2 mr-3",
    right: "left-full top-1/2 -translate-y-1/2 ml-3",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-card border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-card border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-card border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-card border-y-transparent border-l-transparent",
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div className={`absolute z-50 whitespace-nowrap animate-in fade-in zoom-in duration-200 ${positionClasses[position]}`}>
          {/* Tooltip Card */}
          <div className="bg-card text-foreground border border-border px-3 py-2 rounded-lg shadow-xl shadow-primary/5">
            <p className="text-[11px] font-black uppercase tracking-widest leading-none">
              {content}
            </p>
          </div>
          
          {/* Custom Arrow */}
          <div className={`absolute w-0 h-0 border-[6px] ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
}
