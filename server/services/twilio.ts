/**
 * Twilio SMS Service
 * Uses the Twilio REST API directly via fetch (no npm dependency needed).
 * When API keys are not configured, messages are logged but not sent.
 */

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

function getTwilioConfig(): TwilioConfig | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return null;
  }

  return { accountSid, authToken, fromNumber };
}

/**
 * Check if Twilio is configured with valid API keys.
 */
export function isTwilioConfigured(): boolean {
  return getTwilioConfig() !== null;
}

/**
 * Send an SMS message via Twilio REST API.
 * If Twilio is not configured, the message is logged and a success response is returned.
 */
export async function sendSMS(
  to: string,
  body: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const config = getTwilioConfig();

  if (!config) {
    console.log(`[Twilio] SMS logged (no API key configured): To: ${to}, Message: ${body.substring(0, 80)}...`);
    return { success: true, sid: `logged-${Date.now()}` };
  }

  try {
    // Use Twilio REST API directly via fetch
    const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
    const credentials = Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");

    const params = new URLSearchParams();
    params.append("To", to);
    params.append("From", config.fromNumber);
    params.append("Body", body);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = (errorData as any)?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`[Twilio] SMS sent successfully. SID: ${(data as any).sid}`);
    return { success: true, sid: (data as any).sid };
  } catch (error: any) {
    console.error(`[Twilio] Failed to send SMS:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send a bulk SMS to multiple recipients.
 */
export async function sendBulkSMS(
  recipients: { to: string; body: string }[]
): Promise<{ results: { to: string; success: boolean; sid?: string; error?: string }[] }> {
  const results = await Promise.all(
    recipients.map(async ({ to, body }) => {
      const result = await sendSMS(to, body);
      return { to, ...result };
    })
  );
  return { results };
}
