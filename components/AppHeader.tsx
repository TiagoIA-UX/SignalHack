import Link from "next/link";
import { Container, Button } from "@/components/ui";
import { SignalHackAvatar } from "@/components/SignalHackAvatar";

export function AppHeader(props: { authed?: boolean }) {
  return (
    <header className="border-b border-emerald-500/15">
      <Container>
        <div className="flex h-14 items-center justify-between">
          <Link
            href={props.authed ? "/dashboard" : "/"}
            className="text-sm font-semibold tracking-tight text-emerald-200 font-mono transition-colors hover:text-emerald-100 motion-reduce:transition-none"
          >
            SIGNAL HACKER
          </Link>
          <nav className="flex items-center gap-2">
            {props.authed ? (
              <>
                <div className="mr-1 hidden items-center gap-2 sm:flex">
                  <SignalHackAvatar className="h-5 w-5 text-white/70" title="Signal Hacker" />
                  <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">agents</span>
                </div>
                <Link className="text-sm text-zinc-300 hover:text-white" href="/plans">
                  Planos
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
                <Button href="/login" variant="ghost">
                  Entrar
                </Button>
                <Button href="/register">Solicitar credencial</Button>
              </>
            )}
          </nav>
        </div>
      </Container>
    </header>
  );
}
