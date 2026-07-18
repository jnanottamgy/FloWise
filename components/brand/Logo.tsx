interface LogoProps {
  size?: number;
  className?: string;
}

/** FloWise sunburst mark. Colour follows `currentColor` (use text-olive). */
export function Logo({ size = 32, className }: LogoProps) {
  const rays = Array.from({ length: 12 });
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      {rays.map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const inner = 16;
        const outer = 46;
        return (
          <line
            key={i}
            x1={50 + Math.cos(a) * inner}
            y1={50 + Math.sin(a) * inner}
            x2={50 + Math.cos(a) * outer}
            y2={50 + Math.sin(a) * outer}
            stroke="currentColor"
            strokeWidth={8}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
