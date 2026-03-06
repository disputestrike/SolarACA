interface CalendlyConfig {
  apiKey: string;
  eventTypeUri: string;
}

function getCalendlyConfig(): CalendlyConfig | null {
  const apiKey = process.env.CALENDLY_API_KEY;
  const eventTypeUri = process.env.CALENDLY_EVENT_TYPE_URI || "";

  if (!apiKey) {
    console.warn("[Calendly] Missing API key. Scheduling links will use fallback URL.");
    return null;
  }

  return { apiKey, eventTypeUri };
}

/**
 * Get the Calendly scheduling link for candidates.
 * If CALENDLY_SCHEDULING_URL is set, use that directly.
 * Otherwise, construct from API.
 */
export function getSchedulingUrl(): string {
  const schedulingUrl = process.env.CALENDLY_SCHEDULING_URL;
  if (schedulingUrl) return schedulingUrl;
  return ""; // No scheduling URL configured
}

/**
 * Get available time slots from Calendly API.
 * Falls back to empty array if API key not configured.
 */
export async function getAvailableSlots(
  startDate: string,
  endDate: string
): Promise<{ start: string; end: string; status: string }[]> {
  const config = getCalendlyConfig();

  if (!config) {
    console.log("[Calendly] No API key configured. Returning empty slots.");
    return [];
  }

  try {
    const response = await fetch(
      `https://api.calendly.com/event_type_available_times?event_type=${encodeURIComponent(config.eventTypeUri)}&start_time=${startDate}&end_time=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Calendly API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return (data.collection || []).map((slot: any) => ({
      start: slot.start_time,
      end: slot.end_time,
      status: slot.status,
    }));
  } catch (error: any) {
    console.error("[Calendly] Failed to fetch available slots:", error.message);
    return [];
  }
}

/**
 * Create a one-off scheduling link for a specific candidate.
 */
export async function createSchedulingLink(
  candidateName: string,
  candidateEmail: string
): Promise<{ bookingUrl: string } | null> {
  const config = getCalendlyConfig();

  if (!config) {
    // Return the generic scheduling URL as fallback
    const fallbackUrl = getSchedulingUrl();
    if (fallbackUrl) {
      return { bookingUrl: `${fallbackUrl}?name=${encodeURIComponent(candidateName)}&email=${encodeURIComponent(candidateEmail)}` };
    }
    return null;
  }

  try {
    const response = await fetch("https://api.calendly.com/scheduling_links", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        max_event_count: 1,
        owner: config.eventTypeUri,
        owner_type: "EventType",
      }),
    });

    if (!response.ok) {
      throw new Error(`Calendly API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      bookingUrl: data.resource?.booking_url || "",
    };
  } catch (error: any) {
    console.error("[Calendly] Failed to create scheduling link:", error.message);
    return null;
  }
}

/**
 * List scheduled events from Calendly.
 */
export async function getScheduledEvents(
  minStartTime?: string,
  maxStartTime?: string
): Promise<any[]> {
  const config = getCalendlyConfig();

  if (!config) {
    return [];
  }

  try {
    const userResponse = await fetch("https://api.calendly.com/users/me", {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Calendly API error: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    const userUri = userData.resource?.uri;

    let url = `https://api.calendly.com/scheduled_events?user=${encodeURIComponent(userUri)}&status=active`;
    if (minStartTime) url += `&min_start_time=${minStartTime}`;
    if (maxStartTime) url += `&max_start_time=${maxStartTime}`;

    const eventsResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
    });

    if (!eventsResponse.ok) {
      throw new Error(`Calendly API error: ${eventsResponse.status}`);
    }

    const eventsData = await eventsResponse.json();
    return eventsData.collection || [];
  } catch (error: any) {
    console.error("[Calendly] Failed to fetch scheduled events:", error.message);
    return [];
  }
}
