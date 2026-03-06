import nodemailer from "nodemailer";

interface SendEmailInput {
  to: string;
  name: string;
  discountCode: string;
  discountPercent: number;
}

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP_HOST, SMTP_USER, SMTP_PASS must be set in .env");
  }

  return nodemailer.createTransport({
    host,
    port,
    auth: { user, pass },
  });
}

export async function sendEmail(input: SendEmailInput): Promise<string> {
  try {
    const transport = createTransport();
    const from = process.env.EMAIL_FROM ?? "agent@shop.dev";

    const info = await transport.sendMail({
      from,
      to: input.to,
      subject: `You've earned ${input.discountPercent}% off — thank you for being a top customer!`,
      text: `Hi ${input.name},\n\nThank you for being one of our top customers last month!\n\nHere's your exclusive discount code: ${input.discountCode}\nDiscount: ${input.discountPercent}% off your next order\n\nBest,\nThe Team`,
      html: `
        <h2>Hi ${input.name},</h2>
        <p>Thank you for being one of our <strong>top customers</strong> last month!</p>
        <p>Here's your exclusive discount code:</p>
        <h1 style="letter-spacing:4px; color:#e44;">${input.discountCode}</h1>
        <p><strong>${input.discountPercent}% off</strong> your next order.</p>
        <p>Best,<br/>The Team</p>
      `,
    });

    // nodemailer v8: testMessageUrl is returned directly on info for Ethereal
    const preview = (info as unknown as { testMessageUrl?: string }).testMessageUrl ?? null;
    return JSON.stringify({ success: true, messageId: info.messageId, preview });
  } catch (err) {
    return JSON.stringify({ success: false, error: String(err) });
  }
}
