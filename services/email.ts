import nodemailer from "nodemailer";

type SendPasswordResetEmailArgs = {
	to: string;
	url: string;
};

type SendMagicLinkEmailArgs = {
	to: string;
	url: string;
};

function getSmtpConfigFromEnv() {
	const host = process.env.SMTP_HOST;
	const portRaw = process.env.SMTP_PORT;
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;
	const from = process.env.SMTP_FROM;

	if (!host || !portRaw || !user || !pass || !from) return null;

	const port = Number(portRaw);
	if (!Number.isFinite(port) || port <= 0) return null;

	return { host, port, user, pass, from };
}

export async function sendPasswordResetEmail(args: SendPasswordResetEmailArgs) {
	const cfg = getSmtpConfigFromEnv();
	if (!cfg) return;

	const transporter = nodemailer.createTransport({
		host: cfg.host,
		port: cfg.port,
		secure: cfg.port === 465,
		auth: { user: cfg.user, pass: cfg.pass },
	});

	await transporter.sendMail({
		from: cfg.from,
		to: args.to,
		subject: "Redefinição de senha",
		text: `Abra este link para redefinir sua senha: ${args.url}`,
		html: `<p>Abra este link para redefinir sua senha:</p><p><a href="${args.url}">${args.url}</a></p>`,
	});
}

export async function sendMagicLinkEmail(args: SendMagicLinkEmailArgs) {
	const cfg = getSmtpConfigFromEnv();
	if (!cfg) return;

	const transporter = nodemailer.createTransport({
		host: cfg.host,
		port: cfg.port,
		secure: cfg.port === 465,
		auth: { user: cfg.user, pass: cfg.pass },
	});

	await transporter.sendMail({
		from: cfg.from,
		to: args.to,
		subject: "Link de acesso (expira em minutos)",
		text: `Abra este link para acessar sua conta: ${args.url}`,
		html: `<p>Abra este link para acessar sua conta:</p><p><a href="${args.url}">${args.url}</a></p><p style="color:#a1a1aa;font-size:12px">Se você não solicitou, ignore este email.</p>`,
	});
}
