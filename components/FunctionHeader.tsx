"use client";

import Link from "next/link";

export default function AppHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-sm border-b border-white/5">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-emerald-200 font-semibold">SignalHack</div>
          <nav className="hidden md:flex gap-3 items-center text-sm text-zinc-300">
            <a href="#visao-geral" className="hover:underline">Visão Geral</a>
            <a href="#como-funciona" className="hover:underline">Como Funciona</a>
            <a href="#nichos" className="hover:underline">Nichos</a>
            <a href="#agentes" className="hover:underline">Agentes</a>
            <a href="#funcionalidades" className="hover:underline">Funcionalidades</a>
            <a href="#comecar" className="hover:underline">Começar Agora</a>
            <a href="#ajuda" className="hover:underline">Ajuda</a>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/app" className="text-sm">
            <button className="rounded-md bg-emerald-600/20 px-3 py-1 text-emerald-200">Abrir app</button>
          </Link>
        </div>
      </div>
    </header>
  );
}
