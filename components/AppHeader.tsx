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
          <nav className="flex items-center gap-3">
            <Link className="text-sm text-zinc-300 hover:text-white font-semibold" href="/app">
              Detectar Demanda
            </Link>
            <Link className="text-sm text-zinc-300 hover:text-white font-semibold" href="/app#minhas-validacoes">
              Minhas Validações
            </Link>
            <Link className="text-sm text-zinc-300 hover:text-white font-semibold" href="/app#resultados">
              Resultados
            </Link>
            <Link className="text-sm text-zinc-300 hover:text-white font-semibold" href="/app#plano">
              Plano
            </Link>
            <Button href="/app?wizard=1">Encontrar Negócios em Potencial Agora</Button>
          </nav>
        </div>
      </Container>
    </header>
  );
}
