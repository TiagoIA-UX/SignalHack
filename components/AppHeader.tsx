import Link from "next/link";
import { Container, Button } from "@/components/ui";
import { ZairixAvatar } from "@/components/ZairixAvatar";

export function AppHeader(props: { authed?: boolean }) {
  return (
    <header className="border-b border-emerald-500/15">
      <Container>
        <div className="flex h-14 items-center justify-between">
          <Link
            href={props.authed ? "/dashboard" : "/"}
            className="text-sm font-semibold tracking-tight text-emerald-200 font-mono transition-colors hover:text-emerald-100 motion-reduce:transition-none"
          >
            ZAIRIX
          </Link>
          <nav className="flex items-center gap-2">
            {props.authed ? (
              <>
                <div className="mr-1 hidden items-center gap-2 sm:flex">
                  <ZairixAvatar className="h-5 w-5 text-white/70" title="Zairix" />
                  <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">módulos</span>
                </div>
                <Link className="text-sm text-zinc-300 hover:text-white" href="/dashboard">
                  Operar
                </Link>
                <Link className="text-sm text-zinc-300 hover:text-white" href="/radar">
                  Radar
                </Link>
                <Link className="text-sm text-zinc-300 hover:text-white" href="/plans">
                  Planos
                </Link>
                <Link className="text-sm text-zinc-300 hover:text-white" href="/support">
                  Apoio
                </Link>
                <Link className="text-sm text-zinc-300 hover:text-white" href="/profile">
                  Perfil
                </Link>
              </>
            ) : (
              <>
                <Link className="text-sm text-zinc-300 hover:text-white" href="/plans">
                  Planos
                </Link>
                <Link className="text-sm text-zinc-300 hover:text-white" href="/support">
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
