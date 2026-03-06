import nodemailer from "nodemailer";

interface SendEmailInput {
  to: string;
  name: string;
  subject: string;
  body: string;
}

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP_HOST, SMTP_USER, SMTP_PASS must be set in .env");
  }

  return nodemailer.createTransport({ host, port, auth: { user, pass } });
}

export async function sendEmail(input: SendEmailInput): Promise<string> {
  try {
    const transport = createTransport();
    const from = process.env.EMAIL_FROM ?? "agent@shop.dev";

    const info = await transport.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.body,
    });

    const preview = (info as unknown as { testMessageUrl?: string }).testMessageUrl ?? null;
    return JSON.stringify({ success: true, messageId: info.messageId, preview });
  } catch (err) {
    return JSON.stringify({ success: false, error: String(err) });
  }
}
