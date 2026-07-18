interface LogoProps {
  size?: number;
  className?: string;
}

// Custom FloWise mark (portrait). Colour follows `currentColor` — use text-olive.
// viewBox is the tight bounding box of the artwork with a little padding.
const RATIO = 327.76 / 436.4; // width / height

export function Logo({ size = 32, className }: LogoProps) {
  const height = size;
  const width = Math.round(size * RATIO);
  return (
    <svg
      width={width}
      height={height}
      viewBox="821.62 295.71 327.76 436.4"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M824.619,298.71l.818,209.251s1.741,12.2,6.287,22.16A60.947,60.947,0,0,0,842.8,546.545L896.538,601.1a45.6,45.6,0,0,0,12.873,8.582c7.458,3.167,16.957,4.086,16.957,4.086l97.765-.364a148.614,148.614,0,0,0,22.342-7.649,82.206,82.206,0,0,0,17.807-10.989l64.711-63.281s2.806-6.238.83-10.353-8.735-6.108-8.735-6.108l-100.058.958a70.846,70.846,0,0,0-21.857,7.2A90.846,90.846,0,0,0,979.9,537.964l-57.361,58.009L922.9,413.74s-3.328-14.1-9.917-25.068a79.355,79.355,0,0,0-16.44-18.793Z" />
      <path d="M953.277,631.357s-10.781-1.19-13.57,5.821,2.149,12.506,2.149,12.506l49.138,49.669s13.852,15.058,28.261,22.5a69.61,69.61,0,0,0,29.376,7.253h97.745l-71.715-74.371a70.893,70.893,0,0,0-22.206-15.836c-13.347-5.843-31.182-7.538-31.182-7.538Z" />
    </svg>
  );
}
