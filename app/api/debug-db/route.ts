import { NextResponse } from "next/server";

export async function GET() {
  const val = process.env.DATABASE_URL;
  if (!val) return NextResponse.json({ db: null });
  try {
    // try to parse and return host and protocol
    const parsed = new URL(val);
    const host = parsed.host;
    const protocol = parsed.protocol;
    return NextResponse.json({ protocol, host, ok: true });
  } catch (err) {
    // return truncated/masked value if not a valid URL
    return NextResponse.json({ dbSnippet: val.slice(0, 60), ok: false });
  }
}
