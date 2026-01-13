import Link from "next/link";

export function Container(props: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-6">{props.children}</div>;
}

export function Card(props: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`sh-surface rounded-2xl border border-emerald-500/15 bg-black/40 transition-colors hover:border-emerald-500/25 ${
        props.className ?? ""
      }`.trim()}
      style={{ "--sh-accent": "rgba(16, 185, 129, 0.18)" } as React.CSSProperties}
    >
      {props.children}
    </div>
  );
}

export function Button(props: {
  children: React.ReactNode;
  href?: string;
  type?: "button" | "submit";
  variant?: "primary" | "ghost";
  disabled?: boolean;
  onClick?: () => void;
}) {
  const base =
    "inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-50 disabled:pointer-events-none motion-reduce:transition-none";
  const styles =
    props.variant === "ghost"
      ? "border border-emerald-500/20 bg-transparent text-zinc-200 hover:bg-emerald-500/10 hover:border-emerald-500/35"
      : "bg-emerald-400 text-black hover:bg-emerald-300 shadow-[0_0_0_0_rgba(16,185,129,0)] hover:shadow-[0_0_0_6px_rgba(16,185,129,0.06)]";

  if (props.href) {
    return (
      <Link className={`${base} ${styles}`} href={props.href}>
        {props.children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      disabled={props.disabled}
      onClick={props.onClick}
      className={`${base} ${styles}`}
    >
      {props.children}
    </button>
  );
}

export function Badge(props: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-100 ${
        props.className ?? ""
      }`.trim()}
    >
      {props.children}
    </span>
  );
}
