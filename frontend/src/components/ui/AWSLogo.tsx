import React from 'react';

interface AWSLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AWSLogo: React.FC<AWSLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Official AWS SVG Icon */}
      <svg
        className={`${sizeClasses[size]} w-auto drop-shadow-[0_0_12px_rgba(255,153,0,0.35)] transition-transform duration-300 hover:scale-105`}
        viewBox="0 0 120 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* AWS Smile Arrow */}
        <path
          d="M93.3 50.1c-13.6 10-31.5 15.4-48.8 15.4-24.3 0-46.2-9-62.7-24-1.3-1.2-.2-2.8 1.4-1.9 17.5 9.7 38.6 15.5 60.3 15.5 15.3 0 32.1-4.2 46.8-12.7 2.2-1.3 4.2 1.4 3 2.7z"
          fill="url(#aws-smile-grad)"
        />
        <path
          d="M103 41.5c-1.1-1.4-6.8-1.4-9.3-1.1-.8.1-1-.6-.3-1.1 4.5-3.2 11.9-2.3 12.9-.9 1 1.4-.2 8.9-4.4 12.5-.7.6-1.3.2-1-.5.9-2.3 2.8-7.7 2.1-8.9z"
          fill="#FF9900"
        />
        {/* AWS Text Representation */}
        <text
          x="12"
          y="38"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="36"
          letterSpacing="2"
        >
          AWS
        </text>
        <defs>
          <linearGradient id="aws-smile-grad" x1="0" y1="0" x2="120" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF9900" />
            <stop offset="1" stopColor="#EC7211" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col">
        <span className="text-[10px] tracking-widest font-semibold uppercase text-[#ff9900]">
          Student Builder Group
        </span>
      </div>
    </div>
  );
};
