import React from 'react';

interface CartoonLogoProps {
  className?: string;
  size?: number;
}

export const CartoonLogo: React.FC<CartoonLogoProps> = ({ className = '', size = 44 }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none transition-transform hover:scale-110 hover:-rotate-3 duration-200 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_8px_rgba(245,158,11,0.35)]"
      >
        {/* Cartoon antenna with glowing spark */}
        <line x1="50" y1="20" x2="50" y2="6" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="5" r="5" fill="#facc15" stroke="#78350f" strokeWidth="2" />
        <path d="M42 4 L45 0 L47 3" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />

        {/* Cute Bunny / TV Ears */}
        <ellipse cx="32" cy="16" rx="8" ry="14" fill="#fbbf24" stroke="#78350f" strokeWidth="3" transform="rotate(-15 32 16)" />
        <ellipse cx="32" cy="16" rx="4" ry="9" fill="#f472b6" transform="rotate(-15 32 16)" />

        <ellipse cx="68" cy="16" rx="8" ry="14" fill="#fbbf24" stroke="#78350f" strokeWidth="3" transform="rotate(15 68 16)" />
        <ellipse cx="68" cy="16" rx="4" ry="9" fill="#f472b6" transform="rotate(15 68 16)" />

        {/* Main Cute TV Head Body with thick cartoon outline */}
        <rect
          x="14"
          y="22"
          width="72"
          height="62"
          rx="18"
          fill="#10b981"
          stroke="#064e3b"
          strokeWidth="4"
        />

        {/* Screen Face (Light cream/teal) */}
        <rect
          x="22"
          y="30"
          width="56"
          height="46"
          rx="12"
          fill="#ecfdf5"
          stroke="#047857"
          strokeWidth="3"
        />

        {/* Left Big Cartoon Eye with reflection sparkles */}
        <ellipse cx="38" cy="48" rx="6" ry="8" fill="#0f172a" />
        <circle cx="36" cy="45" r="2.5" fill="#ffffff" />
        <circle cx="40" cy="52" r="1.2" fill="#ffffff" />

        {/* Right Big Cartoon Eye with reflection sparkles */}
        <ellipse cx="62" cy="48" rx="6" ry="8" fill="#0f172a" />
        <circle cx="60" cy="45" r="2.5" fill="#ffffff" />
        <circle cx="64" cy="52" r="1.2" fill="#ffffff" />

        {/* Cute rosy blush cheeks */}
        <ellipse cx="28" cy="56" rx="4" ry="2.5" fill="#f43f5e" opacity="0.65" />
        <ellipse cx="72" cy="56" rx="4" ry="2.5" fill="#f43f5e" opacity="0.65" />

        {/* Cheerful smiling mouth */}
        <path
          d="M44 56 Q50 63 56 56"
          stroke="#0f172a"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Tiny cute tongue */}
        <path
          d="M47 59 Q50 64 53 59 Z"
          fill="#fb7185"
        />

        {/* Little download arrow belly badge */}
        <g transform="translate(42, 85)">
          <path
            d="M8 0 L8 8 M4 5 L8 9 L12 5"
            stroke="#fef08a"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
};
