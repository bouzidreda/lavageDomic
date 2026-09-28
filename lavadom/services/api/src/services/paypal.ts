import { env } from "../config/env";

type CreateOrderInput = {
  amountMad: number;
  bookingId: string;
};

function paypalAuthHeader() {
  const raw = `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`;
  return `Basic ${Buffer.from(raw, "utf8").toString("base64")}`;
}

async function getAccessToken() {
  const res = await fetch(`${env.PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: paypalAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw Object.assign(new Error(`PAYPAL_AUTH_FAILED:${res.status}:${body}`), { status: 502 });
  }

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw Object.assign(new Error("PAYPAL_AUTH_TOKEN_MISSING"), { status: 502 });
  return data.access_token;
}

export async function createPaypalOrder(input: CreateOrderInput) {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    return {
      providerOrderId: `mock_${input.bookingId}`,
      approveUrl: `https://www.sandbox.paypal.com/checkoutnow?token=mock_${input.bookingId}`,
      mocked: true
    };
  }

  const token = await getAccessToken();
  const res = await fetch(`${env.PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.bookingId,
          amount: {
            currency_code: "MAD",
            value: input.amountMad.toFixed(2)
          }
        }
      ]
    })
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw Object.assign(new Error(`PAYPAL_CREATE_ORDER_FAILED:${res.status}:${body}`), { status: 502 });
  }

  const data = (await res.json()) as { id?: string; links?: Array<{ rel?: string; href?: string }> };
  const approveUrl = data.links?.find((l) => l.rel === "approve")?.href ?? "";
  if (!data.id) throw Object.assign(new Error("PAYPAL_ORDER_ID_MISSING"), { status: 502 });

  return {
    providerOrderId: data.id,
    approveUrl,
    mocked: false
  };
}

export async function capturePaypalOrder(providerOrderId: string) {
  if (providerOrderId.startsWith("mock_")) {
    return {
      captureId: `capture_${providerOrderId}`,
      status: "CAPTURED" as const,
      mocked: true
    };
  }

  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw Object.assign(new Error("PAYPAL_NOT_CONFIGURED"), { status: 500 });
  }

  const token = await getAccessToken();
  const res = await fetch(`${env.PAYPAL_API_BASE}/v2/checkout/orders/${providerOrderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    }
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw Object.assign(new Error(`PAYPAL_CAPTURE_FAILED:${res.status}:${body}`), { status: 502 });
  }

  const data = (await res.json()) as {
    status?: string;
    purchase_units?: Array<{ payments?: { captures?: Array<{ id?: string; status?: string }> } }>;
  };
  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
  const captureId = capture?.id ?? `capture_${providerOrderId}`;
  const isCaptured = capture?.status === "COMPLETED" || data.status === "COMPLETED";

  if (!isCaptured) {
    throw Object.assign(new Error(`PAYPAL_CAPTURE_NOT_COMPLETED:${capture?.status ?? data.status ?? "UNKNOWN"}`), { status: 502 });
  }

  return {
    captureId,
    status: "CAPTURED" as const,
    mocked: false
  };
}
