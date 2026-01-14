import Link from "next/link";
import { Container, Button } from "@/components/ui";
import { ZairixAvatar } from "@/components/ZairixAvatar";

export function AppHeader(props: { authed?: boolean }) {
  return (
    <header className="border-b border-emerald-500/15 bg-premium-bg">
      <Container>
        <div className="flex h-20 items-center justify-between">
          <Link
            href={props.authed ? "/dashboard" : "/"}
            className="h1 font-mono text-emerald-200 transition-colors hover:text-emerald-100 motion-reduce:transition-none"
            style={{ fontWeight: 700 }}
          >
            ZAIRIX
          </Link>
          <nav className="flex items-center gap-4">
            {props.authed ? (
              <>
                <div className="mr-2 hidden items-center gap-2 sm:flex">
                  <ZairixAvatar className="h-6 w-6 text-white/70" title="Zairix" />
                  <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">módulos</span>
                </div>
                <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/dashboard">
                  Operar
                </Link>
                <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/radar">
                  Radar
                </Link>
                <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/plans">
                  Planos
                </Link>
                <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/support">
                  Apoio
                </Link>
                <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/profile">
                  Perfil
                </Link>
              </>
            ) : (
              <>
                <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/plans">
                  Planos
                </Link>
                <Link className="h2 text-zinc-300 hover:text-white font-semibold" href="/support">
                  Apoio
                </Link>
                <Button href="/login" variant="ghost">
                  Entrar
                </Button>
                <Button href="/register">Criar conta</Button>
              </>
            )}
          </nav>
        </div>
      </Container>
    </header>
  );
}
