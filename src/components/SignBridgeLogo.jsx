export default function SignBridgeLogo({ size = 36 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <defs>
        <linearGradient id="sbGradientComp" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="bridgeGradComp" x1="8" y1="28" x2="40" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>

      {/* Soft rounded container */}
      <rect x="2" y="2" width="44" height="44" rx="12" fill="#eff6ff" stroke="#dbeafe" strokeWidth="1.5" />

      {/* Suspension Bridge Arch */}
      <path d="M 8 32 C 18 19, 30 19, 40 32" stroke="url(#bridgeGradComp)" strokeWidth="3" strokeLinecap="round" fill="none" />
      <line x1="16" y1="25" x2="16" y2="33" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="22" x2="24" y2="33" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32" y1="25" x2="32" y2="33" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />

      {/* Roadway Deck */}
      <path d="M 6 34 L 42 34" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />

      {/* Hand Gesture Meeting Arch */}
      <path d="M 17 20 C 15 16, 15 12, 17 11 C 19 10, 21 13, 22 16" stroke="url(#sbGradientComp)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M 22 15 C 23 11, 26 11, 27 15" stroke="url(#sbGradientComp)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M 27 15 C 29 12, 32 12, 33 15 C 34 18, 31 22, 28 24 L 24 27 L 20 24" stroke="url(#sbGradientComp)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
