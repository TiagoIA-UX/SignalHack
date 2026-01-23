import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui";

export default function FeatureItem({ name, desc, href }: { name: string; desc: string; href?: string }) {
  return (
    <Card className="p-4 flex items-center justify-between">
      <div>
        <div className="font-semibold text-zinc-100">{name}</div>
        <div className="text-sm text-zinc-400">{desc}</div>
      </div>
      <div>
        <Link href={href ?? "/app"} className="text-sm text-emerald-300 hover:underline">Abrir ferramentas</Link>
      </div>
    </Card>
  );
}
