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
            <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/">
              Home
            </Link>
            <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/#como-funciona">
              Método
            </Link>
            <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/#o-que-recebe">
              O que você recebe
            </Link>
            <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/#para-quem-e">
              Para quem é
            </Link>
            <Button href="/app" variant="ghost">
              Entrar
            </Button>
          </nav>
        </div>
      </Container>
    </header>
  );
}
