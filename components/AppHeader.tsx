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
            <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/#promessa">
              Promessa
            </Link>
            <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/#metodo">
              Método
            </Link>
            <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/#entrega">
              Entrega
            </Link>
            <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/#para-quem">
              Para quem
            </Link>
            <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/#nao-e">
              Não é
            </Link>
            <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/#comecar">
              Começar
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
