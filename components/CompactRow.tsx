import React from "react";

export function CompactRow(props: { title: string; subtitle?: string; right?: React.ReactNode; onClick?: () => void }) {
  return (
    <div
      role="button"
      onClick={props.onClick}
      className="flex items-center justify-between gap-4 py-3 px-2 rounded-md hover:bg-white/2 transition-colors cursor-pointer"
    >
      <div className="flex flex-col">
        <div className="text-sm font-semibold text-zinc-100">{props.title}</div>
        {props.subtitle ? <div className="text-xs text-zinc-400 mt-1">{props.subtitle}</div> : null}
      </div>
      <div className="flex items-center gap-2">{props.right}</div>
    </div>
  );
}

export default CompactRow;
