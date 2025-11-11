import React from 'react';

interface LogoProps {
  className?: string;
  title?: string;
}

const Logo: React.FC<LogoProps> = ({ className = 'w-8 h-8', title = 'VolunFlow' }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 160 160"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
      role="img"
    >
      <defs>
        <linearGradient id="vfGradient" x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="140" height="140" rx="24" fill="url(#vfGradient)" />
      <path
        d="M45 95l18-45h14l-22 60h-12L45 95zm62-12c0 17.121-10.879 28-27 28-10.109 0-18.311-4.438-23.129-11.887l9.766-6.395C70.004 98.859 74.77 102 80 102c9.207 0 15-6.016 15-16s-5.793-16-15-16c-5.23 0-9.996 3.141-13.363 9.281l-9.766-6.395C71.689 65.438 79.891 61 90 61c16.121 0 27 10.879 27 22z"
        fill="#fff"
      />
    </svg>
  );
};

export default Logo;

