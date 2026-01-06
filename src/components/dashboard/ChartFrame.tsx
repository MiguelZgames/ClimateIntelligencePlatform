import React, { useRef, useEffect, useState } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

interface ChartFrameProps {
  title: string;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function ChartFrame({ title, subtitle, children, className = '' }: ChartFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    ro.observe(containerRef.current);

    return () => ro.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-300 ease-in-out ${className}`}
      style={{
        transform: 'translateZ(0)', // Hardware acceleration for smoother resizing
        willChange: 'transform, width, height'
      }}
    >
      <div className="mb-6 border-b border-gray-50 pb-4">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between gap-2">
          {title}
        </h3>
        {subtitle && (
          <div className="text-xs text-gray-400 mt-1 font-medium">{subtitle}</div>
        )}
      </div>
      
      <div className="w-full h-[400px] relative">
        {children}
      </div>
      
      {/* Debug/Info overlay (optional, but shows the dynamic nature) */}
      {/* <div className="absolute top-2 right-2 text-[10px] text-gray-300">
        {Math.round(dimensions.width)}x{Math.round(dimensions.height)}
      </div> */}
    </div>
  );
}
