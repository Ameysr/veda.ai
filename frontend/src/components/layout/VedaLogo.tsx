import React from "react";

interface Props {
  className?: string;
}

export function VedaLogo({ className = "h-8 w-8" }: Props) {
  return (
    <div className={`relative select-none flex-shrink-0 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Rich Gradient matching Figma orange-to-deep-red */}
          <linearGradient id="logoBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FA7E36" />
            <stop offset="40%" stopColor="#C9351C" />
            <stop offset="100%" stopColor="#7E1415" />
          </linearGradient>

          {/* Premium White Gradient for Left Wing */}
          <linearGradient id="leftWing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E6E6EE" />
          </linearGradient>

          {/* Metallic Silver Gradient for Right Wing */}
          <linearGradient id="rightWing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#B3B3C2" />
          </linearGradient>

          {/* Dynamic drop shadow under the logo */}
          <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="150%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#C9351C" floodOpacity="0.28" />
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* Squircle Background Container */}
        <rect
          width="100"
          height="100"
          rx="26"
          fill="url(#logoBg)"
          filter="url(#logoShadow)"
        />

        {/* The stylized "V" with 3D folded ribbon effect */}
        {/* Right Wing (positioned behind the left fold) */}
        <path
          d="M 43.5 73.5 
             L 54 49 
             L 63.5 27 
             H 75 
             L 53.5 73.5 
             H 43.5 Z"
          fill="url(#rightWing)"
        />

        {/* Left Wing (curving smoothly at the bottom to form the main V fold) */}
        <path
          d="M 25 27 
             H 41.5 
             L 47 40 
             L 50.5 48 
             C 52.5 52.5, 49.5 56.5, 45 56.5 
             C 42 56.5, 39 53, 38 49.5 
             L 30.5 32 
             L 28.5 27 
             H 25"
          fill="none"
        />
        
        {/* Real filled Left Wing fold */}
        <path
          d="M 25 27 
             H 41.5 
             L 35 48.5 
             C 32.5 56.5, 36.5 62, 42.5 62 
             C 45.5 62, 48.5 59.5, 50 56 
             L 57.5 27 
             H 73 
             L 60 70 
             C 54.5 77, 43 77, 35 73.5 
             C 27.5 69.5, 23.5 61, 27.5 52.5 
             Z"
          fill="url(#leftWing)"
        />
      </svg>
    </div>
  );
}
