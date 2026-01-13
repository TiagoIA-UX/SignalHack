import Link from "next/link";
import { AFFILIATE_HOSTINGER, AFFILIATE_COPY } from "@/lib/support";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-white/5 pt-6">
      <div className="mx-auto max-w-6xl px-4 text-xs text-zinc-400">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-zinc-500">© {new Date().getFullYear()} ZAIRIX</div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-zinc-400">Infraestrutura recomendada</div>
            <Link
              href={AFFILIATE_HOSTINGER}
              className="text-xs text-emerald-200 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hostinger
            </Link>
          </div>
        </div>
        <div className="mt-3 text-xs text-zinc-500">{AFFILIATE_COPY.split("\n").join(" ")}</div>
      </div>
    </footer>
  );
}
