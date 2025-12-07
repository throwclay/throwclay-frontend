interface MudlyLogoProps {
    className?: string;
    size?: number;
  }
  
  export function MudlyLogo({ className = "", size = 32 }: MudlyLogoProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Main blob body - organic mud shape */}
        <path
          d="M50 10C30 10 15 25 15 45C15 55 18 62 22 68C26 74 32 78 38 82C42 85 46 88 50 90C54 88 58 85 62 82C68 78 74 74 78 68C82 62 85 55 85 45C85 25 70 10 50 10Z"
          fill="#8B6F47"
          className="drop-shadow-md"
        />
        
        {/* Darker mud shading for depth */}
        <path
          d="M50 15C35 15 23 27 20 42C19 48 20 54 23 60C25 64 28 67 32 70C28 65 25 58 25 50C25 32 37 18 50 18C63 18 75 32 75 50C75 58 72 65 68 70C72 67 75 64 77 60C80 54 81 48 80 42C77 27 65 15 50 15Z"
          fill="#6B5538"
          opacity="0.3"
        />
        
        {/* Highlight for glossy/wet mud look */}
        <ellipse
          cx="35"
          cy="30"
          rx="12"
          ry="8"
          fill="white"
          opacity="0.25"
        />
        
        {/* Left eye white */}
        <ellipse
          cx="38"
          cy="45"
          rx="10"
          ry="12"
          fill="white"
          className="drop-shadow-sm"
        />
        
        {/* Right eye white */}
        <ellipse
          cx="62"
          cy="45"
          rx="10"
          ry="12"
          fill="white"
          className="drop-shadow-sm"
        />
        
        {/* Left pupil - googly effect */}
        <circle
          cx="40"
          cy="47"
          r="5"
          fill="#2D1810"
        >
          <animate
            attributeName="cx"
            values="38;40;38"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            values="45;47;45"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
        
        {/* Right pupil - googly effect */}
        <circle
          cx="60"
          cy="47"
          r="5"
          fill="#2D1810"
        >
          <animate
            attributeName="cx"
            values="62;60;62"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            values="45;47;45"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
        
        {/* Eye shine/sparkle left */}
        <circle
          cx="41"
          cy="44"
          r="2"
          fill="white"
        />
        
        {/* Eye shine/sparkle right */}
        <circle
          cx="63"
          cy="44"
          r="2"
          fill="white"
        />
        
        {/* Cute smile */}
        <path
          d="M35 60C35 60 42 68 50 68C58 68 65 60 65 60"
          stroke="#2D1810"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Little mud drip on left side */}
        <path
          d="M25 50C25 50 22 55 23 58C24 61 27 62 29 60C31 58 30 53 28 51C27 50 26 49 25 50Z"
          fill="#7A5E3D"
          opacity="0.7"
        />
        
        {/* Little mud drip on right side */}
        <path
          d="M75 50C75 50 78 55 77 58C76 61 73 62 71 60C69 58 70 53 72 51C73 50 74 49 75 50Z"
          fill="#7A5E3D"
          opacity="0.7"
        />
        
        {/* Bottom mud puddle effect */}
        <ellipse
          cx="50"
          cy="85"
          rx="25"
          ry="5"
          fill="#6B5538"
          opacity="0.3"
        />
      </svg>
    );
  }
  