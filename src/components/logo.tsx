export function Logo({
  width = "160px",
  color,
  className,
}: {
  width?: string;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 44"
      width={width}
      className={className}
      aria-label="screenKit"
      fill="currentColor"
    >
      <g fill={color ?? "currentColor"}>
        {/* Layered Screen Icon Mark */}
        <rect x="4" y="6" width="22" height="32" rx="5" opacity="0.3" />
        <rect x="14" y="10" width="22" height="28" rx="4.5" />
        <rect x="19" y="16" width="12" height="2.5" rx="1.25" fill="#ffffff" opacity="0.9" />
        <rect x="19" y="21" width="9" height="2.5" rx="1.25" fill="#ffffff" opacity="0.9" />
        <rect x="19" y="26" width="6" height="2.5" rx="1.25" fill="#ffffff" opacity="0.9" />

        {/* Brand Text: screenKit */}
        <text
          x="48"
          y="31"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Inter', 'Geist Sans', sans-serif"
          fontWeight="800"
          fontSize="27"
          letterSpacing="-0.5px"
        >
          screen<tspan fill="#4F46E5">Kit</tspan>
        </text>
      </g>
    </svg>
  );
}
