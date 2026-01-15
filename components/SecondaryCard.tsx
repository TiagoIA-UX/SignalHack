import React from "react";

export function SecondaryCard(props: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-emerald-500/12 bg-black/30 p-3 ${props.className ?? ""}`.trim()}>
      {props.children}
    </div>
  );
}

export default SecondaryCard;
