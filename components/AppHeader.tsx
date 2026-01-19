import Link from "next/link";
import { Container, Button } from "@/components/ui";

export function AppHeader() {
  return (
    <header className="border-b border-emerald-500/15 bg-premium-bg">
      <Container>
        <div className="flex h-20 items-center justify-between">
          <Link
            href="/"
            className="h1 font-mono text-emerald-200 transition-colors hover:text-emerald-100 motion-reduce:transition-none"
            style={{ fontWeight: 700 }}
          >
            ZAIRIX
          </Link>
          <nav className="flex items-center gap-4">
            <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/app">
              App
            </Link>
            <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/acquire">
              Adquirir suporte/licença
            </Link>
            <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/support">
              Apoio
            </Link>
            <Button href="/app" variant="ghost">
              Abrir agora
            </Button>
          </nav>
        </div>
      </Container>
    </header>
  );
}
