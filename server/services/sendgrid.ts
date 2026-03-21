/**
 * Transactional email: **Resend** (preferred if `RESEND_API_KEY` is set), else **SendGrid**.
 * Uses fetch only — no extra npm deps for Resend.
 * When no provider is configured, emails are logged but not sent.
 */

import { BRAND_NAME } from "@shared/markets";

interface SendGridConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

function getSendGridConfig(): SendGridConfig | null {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || "noreply@nationalsolarsalesacademy.com";
  const fromName = process.env.SENDGRID_FROM_NAME || BRAND_NAME;

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

/** True if Resend or SendGrid can send mail. */
export function isEmailProviderConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim()) || isSendGridConfigured();
}

function getResendFrom(): string {
  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    process.env.SENDGRID_FROM_EMAIL ||
    "onboarding@resend.dev";
  const fromName =
    process.env.RESEND_FROM_NAME?.trim() ||
    process.env.SENDGRID_FROM_NAME ||
    BRAND_NAME;
  return `${fromName} <${fromEmail}>`;
}

async function sendEmailViaResend(
  to: string,
  subject: string,
  body: string,
  html: string | undefined,
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getResendFrom(),
        to: [to],
        subject,
        text: body,
        html: html ?? body.replace(/\n/g, "<br>"),
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      throw new Error(`Resend ${response.status}: ${errBody || response.statusText}`);
    }

    console.log(`[Resend] Email sent to ${to}`);
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Resend] Failed to send email:`, message);
    return { success: false, error: message };
  }
}

/**
 * Send an email via Resend (if `RESEND_API_KEY`) or SendGrid (if `SENDGRID_API_KEY`).
 * If neither is configured, the email is logged and a success response is returned (dev-style noop).
 */
export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  html?: string
): Promise<{ success: boolean; error?: string }> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    return sendEmailViaResend(to, subject, body, html, resendKey);
  }

  const config = getSendGridConfig();

  if (!config) {
    console.log(`[Email] Logged (no RESEND_API_KEY or SENDGRID_API_KEY): To: ${to}, Subject: ${subject}`);
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
