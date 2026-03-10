import { getResend } from "@/lib/resend";

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
  replyTo?: string;
}

interface SendEmailResult {
  success: boolean;
  resendId?: string;
  error?: string;
}

export async function sendTransactionalEmail(
  params: SendEmailParams
): Promise<SendEmailResult> {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: "CertiRecicla <hola@certirecicla.cl>",
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
      attachments: params.attachments,
      replyTo: params.replyTo,
    });

    if (error) {
      console.error("Error sending transactional email:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, resendId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("Error sending transactional email:", message);
    return { success: false, error: message };
  }
}
