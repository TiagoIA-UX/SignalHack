import Link from "next/link";
import { Container, Button } from "@/components/ui";

export function AppHeader() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-emerald-500/15 bg-premium-bg">
      <Container>
        <div className="flex h-20 items-center justify-between">
          <Link
            href="/"
            className="h1 font-mono text-emerald-200 transition-colors hover:text-emerald-100 motion-reduce:transition-none"
            style={{ fontWeight: 700 }}
          >
            SIGNALHACK
          </Link>
          <nav className="flex items-center gap-4">
            <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/#visao-geral">
              Visão Geral
            </Link>
            <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/#como-funciona">
              Como Funciona
            </Link>
            <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/#nichos">
              Nichos de Uso
            </Link>
            <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/#agentes">
              Agentes
            </Link>
            <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/#funcionalidades">
              Funcionalidades
            </Link>
            <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/#comecar">
              Começar Agora
            </Link>
            <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/#ajuda">
              Ajuda
            </Link>
            <Button href="/app" variant="ghost">
              Abrir painel
            </Button>
          </nav>
        </div>
      </Container>
    </header>
  );
}
