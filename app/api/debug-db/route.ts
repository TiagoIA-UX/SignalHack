import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const val = process.env.DATABASE_URL;
  if (!val) return NextResponse.json({ db: null });
  try {
    // try to parse and return host and protocol
    const parsed = new URL(val);
    const host = parsed.host;
    const protocol = parsed.protocol;
    const h = crypto.createHash("sha256").update(val).digest("hex").slice(0, 8);
    return NextResponse.json({ protocol, host, ok: true, hash: h });
  } catch {
    // return truncated/masked value if not a valid URL
    const h = crypto.createHash("sha256").update(val).digest("hex").slice(0, 8);
    return NextResponse.json({ dbSnippet: val.slice(0, 60), ok: false, hash: h });
  }
}
