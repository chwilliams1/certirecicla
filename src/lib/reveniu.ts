const REVENIU_API = "https://integration.reveniu.com/api/v1";
const REVENIU_SECRET = process.env.REVENIU_SECRET_KEY;

export const REVENIU_PLAN_MAP: Record<string, number> = {
  starter: Number(process.env.REVENIU_PLAN_STARTER),
  profesional: Number(process.env.REVENIU_PLAN_PROFESIONAL),
  business: Number(process.env.REVENIU_PLAN_BUSINESS),
};

export function getReveniuPlanKey(planId: number): string | null {
  for (const [key, id] of Object.entries(REVENIU_PLAN_MAP)) {
    if (id === planId) return key;
  }
  return null;
}

async function reveniuFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${REVENIU_API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Reveniu-Secret-Key": REVENIU_SECRET!,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reveniu API error ${res.status}: ${text}`);
  }

  return res.json();
}

export async function createSubscription(
  planKey: string,
  email: string,
  name: string,
  companyId: string
) {
  const planId = REVENIU_PLAN_MAP[planKey];
  if (!planId) throw new Error(`Plan desconocido: ${planKey}`);

  return reveniuFetch("/subscriptions/", {
    method: "POST",
    body: JSON.stringify({
      plan_id: planId,
      external_id: companyId,
      field_values: {
        email,
        name,
      },
    }),
  });
}

export async function getSubscription(subscriptionId: number) {
  return reveniuFetch(`/subscriptions/${subscriptionId}`);
}

export async function cancelSubscription(subscriptionId: number) {
  return reveniuFetch(`/subscriptions/${subscriptionId}/disable/`, {
    method: "POST",
  });
}
