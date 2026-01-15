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
	if (!isSmtpConfigured()) throw new Error("SMTP not configured");
	await verifyTransporter();
	await sendMail({
		to: args.to,
		subject: "Redefinição de senha",
		text: `Abra este link para redefinir sua senha: ${args.url}`,
		html: `<p>Abra este link para redefinir sua senha:</p><p><a href="${args.url}">${args.url}</a></p>`,
	});
}

export async function sendMagicLinkEmail(args: SendMagicLinkEmailArgs) {
	if (!isSmtpConfigured()) throw new Error("SMTP not configured");
	await verifyTransporter();
	await sendMail({
		to: args.to,
		subject: "Link de acesso (expira em minutos)",
		text: `Abra este link para acessar sua conta: ${args.url}`,
		html: `<p>Abra este link para acessar sua conta:</p><p><a href="${args.url}">${args.url}</a></p><p style="color:#a1a1aa;font-size:12px">Se você não solicitou, ignore este email.</p>`,
	});
}
