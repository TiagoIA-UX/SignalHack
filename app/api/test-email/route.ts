import { NextResponse } from "next/server";
import { isSmtpConfigured, sendMail, verifyTransporter } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const email = json?.email;
  if (!email) return NextResponse.json({ error: "missing_email" }, { status: 400 });

  if (!isSmtpConfigured()) {
    return NextResponse.json({ error: "smtp_not_configured" }, { status: 503 });
  }

  try {
    // Verify transporter (throws if not ok)
    await verifyTransporter();
  } catch (err) {
    return NextResponse.json({ error: "smtp_verify_failed", message: (err as any).message }, { status: 503 });
  }

  try {
    const info = await sendMail({
      to: email,
      subject: "SignalHack - Test Email",
      text: "This is a test email from SignalHack. If you received it, SMTP is working.",
      html: "<p>This is a test email from SignalHack. If you received it, SMTP is working.</p>",
    });
    return NextResponse.json({ ok: true, info: info?.messageId ?? null });
  } catch (err) {
    return NextResponse.json({ error: "send_failed", message: (err as any).message }, { status: 500 });
  }
}
