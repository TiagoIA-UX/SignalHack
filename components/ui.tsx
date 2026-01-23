import Link from "next/link";

export function Container(props: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-6">{props.children}</div>;
}

export function Card(props: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <div
      id={props.id}
      className={`card border border-emerald-500/15 transition-colors hover:border-emerald-500/25 ${props.className ?? ""}`.trim()}
      style={{ "--sh-accent": "rgba(16, 185, 129, 0.18)" } as React.CSSProperties}
    >
      {props.children}
    </div>
  );
}

export { PrimaryCard } from "./PrimaryCard";
export { SecondaryCard } from "./SecondaryCard";
export { CompactRow } from "./CompactRow";
export { Drawer } from "./Drawer";

export function Button(props: {
  children: React.ReactNode;
  href?: string;
  type?: "button" | "submit";
  variant?: "primary" | "ghost";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const base =
    "cta inline-flex items-center justify-center font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-50 disabled:pointer-events-none motion-reduce:transition-none";
  const styles =
    props.variant === "ghost"
      ? "border border-emerald-500/20 bg-transparent text-emerald-200 hover:bg-emerald-500/10 hover:border-emerald-500/35"
      : "bg-emerald-400 text-black hover:bg-emerald-300 shadow-lg";

  const combined = `${base} ${styles} ${props.className ?? ""}`.trim();

  if (props.href) {
    return (
      <Link className={combined} href={props.href}>
        {props.children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      disabled={props.disabled}
      onClick={props.onClick}
      className={combined}
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
