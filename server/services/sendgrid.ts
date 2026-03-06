/**
 * SendGrid Email Service
 * Uses the SendGrid v3 REST API directly via fetch (no npm dependency needed).
 * When API key is not configured, emails are logged but not sent.
 */

interface SendGridConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

function getSendGridConfig(): SendGridConfig | null {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || "noreply@floridasolarsalesacademy.com";
  const fromName = process.env.SENDGRID_FROM_NAME || "Florida Solar Sales Academy";

  if (!apiKey) {
    return null;
  }

  return { apiKey, fromEmail, fromName };
}

/**
 * Check if SendGrid is configured with a valid API key.
 */
export function isSendGridConfigured(): boolean {
  return getSendGridConfig() !== null;
}

/**
 * Send an email via SendGrid v3 REST API.
 * If SendGrid is not configured, the email is logged and a success response is returned.
 */
export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  html?: string
): Promise<{ success: boolean; error?: string }> {
  const config = getSendGridConfig();

  if (!config) {
    console.log(`[SendGrid] Email logged (no API key configured): To: ${to}, Subject: ${subject}`);
    return { success: true };
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
          },
        ],
        from: {
          email: config.fromEmail,
          name: config.fromName,
        },
        subject,
        content: [
          {
            type: "text/plain",
            value: body,
          },
          {
            type: "text/html",
            value: html || body.replace(/\n/g, "<br>"),
          },
        ],
      }),
    });

    // SendGrid returns 202 for accepted
    if (response.status === 202 || response.ok) {
      console.log(`[SendGrid] Email sent successfully to ${to}`);
      return { success: true };
    }

    const errorData = await response.json().catch(() => ({}));
    const errorMessage = (errorData as any)?.errors?.[0]?.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  } catch (error: any) {
    console.error(`[SendGrid] Failed to send email:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send a bulk email to multiple recipients.
 */
export async function sendBulkEmail(
  recipients: { to: string; subject: string; body: string; html?: string }[]
): Promise<{ results: { to: string; success: boolean; error?: string }[] }> {
  const results = await Promise.all(
    recipients.map(async ({ to, subject, body, html }) => {
      const result = await sendEmail(to, subject, body, html);
      return { to, ...result };
    })
  );
  return { results };
}
