export function ZairixAvatar(props: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden={props.title ? undefined : true}
      role={props.title ? "img" : "presentation"}
      className={props.className}
    >
      {props.title ? <title>{props.title}</title> : null}
      <defs>
        <linearGradient id="sf-matrix" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#sf-matrix)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 10v6" opacity="0.35" />
        <path d="M18 8v10" opacity="0.25" />
        <path d="M30 8v8" opacity="0.25" />
        <path d="M36 10v6" opacity="0.35" />
        <path d="M8 24c4.5-6 10-9 16-9s11.5 3 16 9c-4.5 6-10 9-16 9s-11.5-3-16-9Z" />
        <circle cx="24" cy="24" r="4.5" />
        <circle cx="25.5" cy="22.5" r="1" opacity="0.9" />
        <path d="M10 34h10" opacity="0.35" />
        <path d="M28 34h10" opacity="0.35" />
      </g>
    </svg>
  );
}
