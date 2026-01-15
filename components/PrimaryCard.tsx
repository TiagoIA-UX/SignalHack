import React from "react";

export function PrimaryCard(props: { title?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`bg-[theme(colors.premium-card)] rounded-card p-6 max-h-card overflow-hidden shadow-md border border-emerald-500/10 ${
        props.className ?? ""
      }`}
    >
      {props.title ? <div className="mb-3 text-lg font-semibold text-zinc-100">{props.title}</div> : null}
      <div className="text-sm text-zinc-200">{props.children}</div>
    </section>
  );
}

export default PrimaryCard;
