import Link from "next/link";
import { AFFILIATE_COPY } from "@/lib/support";
import { getAffiliateHostingUrl } from "@/lib/env";

export function Footer() {
  const affiliateUrl = getAffiliateHostingUrl();

  return (
    <footer className="mt-12 border-t border-white/5 pt-6">
      <div className="mx-auto max-w-6xl px-4 text-xs text-zinc-400">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-zinc-500">© {new Date().getFullYear()} ZAIRIX</div>
          <div className="flex items-center gap-4">
            {affiliateUrl ? (
              <>
                <div className="text-xs text-zinc-400">Infraestrutura recomendada</div>
                <Link href={affiliateUrl} className="text-xs text-emerald-200 hover:underline" target="_blank" rel="noopener noreferrer">
                  Visitar provedores
                </Link>
              </>
            ) : null}

            <Link href="/support" className="text-xs text-emerald-200 hover:underline">
              Apoio
            </Link>
          </div>
        </div>
        {affiliateUrl ? <div className="mt-3 text-xs text-zinc-500">{AFFILIATE_COPY.split("\n").join(" ")}</div> : null}
      </div>
    </footer>
  );
}
