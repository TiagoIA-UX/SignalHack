import React from "react";

export function Drawer(props: { open: boolean; onClose: () => void; children: React.ReactNode; className?: string }) {
  if (!props.open) return null;
  return (
    <div className="fixed inset-0 z-drawer flex">
      <div className="absolute inset-0 bg-black/60" onClick={props.onClose} />
      <aside className={`ml-auto w-full max-w-md bg-[#0b0b0b] p-6 overflow-auto ${props.className ?? ""}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold text-zinc-100">Detalhes</div>
          <button className="text-zinc-400" onClick={props.onClose}>
            Fechar
          </button>
        </div>
        {props.children}
      </aside>
    </div>
  );
}

export default Drawer;
