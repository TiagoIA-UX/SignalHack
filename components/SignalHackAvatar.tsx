export function SignalHackAvatar(props: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden={props.title ? undefined : true}
      role={props.title ? "img" : "presentation"}
      className={props.className}
    >
      {props.title ? <title>{props.title}</title> : null}
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 16h16c5 0 8 2.5 8 6s-3 6-8 6h-6c-2 0-3 1-3 3s1 3 3 3h14" />
        <path d="M10 34h10" opacity="0.65" />
        <path d="M28 12v6" opacity="0.35" />
        <path d="M36 20h6" opacity="0.35" />
        <path d="M24 36v6" opacity="0.35" />
        <circle cx="28" cy="16" r="1.5" />
        <circle cx="34" cy="22" r="1.5" />
        <circle cx="24" cy="34" r="1.5" />
      </g>
    </svg>
  );
}
