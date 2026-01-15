import { sendMail, isSmtpConfigured, verifyTransporter } from "@/lib/mailer";

type SendPasswordResetEmailArgs = {
	to: string;
	url: string;
};

type SendMagicLinkEmailArgs = {
	to: string;
	url: string;
};

export async function sendPasswordResetEmail(args: SendPasswordResetEmailArgs) {
	if (!isSmtpConfigured()) {
		console.warn('email_non_blocking: SMTP not configured; skipping password reset email');
		return;
	}
	// Best-effort, non-blocking email
	verifyTransporter().catch((err) => console.warn('email_verify_failed_non_blocking', err));
	sendMail({
		to: args.to,
		subject: "Redefinição de senha",
		text: `Abra este link para redefinir sua senha: ${args.url}`,
		html: `<p>Abra este link para redefinir sua senha:</p><p><a href="${args.url}">${args.url}</a></p>`,
	}).catch((err) => console.warn('email_failed_non_blocking', err));
}

export async function sendMagicLinkEmail(args: SendMagicLinkEmailArgs) {
	if (!isSmtpConfigured()) {
		console.warn('email_non_blocking: SMTP not configured; skipping magic link email');
		return;
	}
	// Best-effort, non-blocking email
	verifyTransporter().catch((err) => console.warn('email_verify_failed_non_blocking', err));
	sendMail({
		to: args.to,
		subject: "Link de acesso (expira em minutos)",
		text: `Abra este link para acessar sua conta: ${args.url}`,
		html: `<p>Abra este link para acessar sua conta:</p><p><a href="${args.url}">${args.url}</a></p><p style="color:#a1a1aa;font-size:12px">Se você não solicitou, ignore este email.</p>`,
	}).catch((err) => console.warn('email_failed_non_blocking', err));
}
