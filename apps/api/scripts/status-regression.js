const baseUrl = process.env.API_BASE_URL || "http://localhost:3001/api/v1";
const tenantId = process.env.TENANT_ID || "00000000-0000-0000-0000-000000000001";
const email = process.env.AUTH_EMAIL || "admin@acme.test";
const password = process.env.AUTH_PASSWORD || "Admin#123";

async function request(path, opts = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...opts,
    headers: {
      "content-type": "application/json",
      "x-tenant-id": tenantId,
      ...(opts.headers || {})
    }
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { ok: res.ok, status: res.status, data };
}

async function login() {
  const res = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    throw new Error(`Login failed: ${res.status} ${JSON.stringify(res.data)}`);
  }
  return res.data.accessToken;
}

async function run() {
  const token = await login();
  const authHeaders = { Authorization: `Bearer ${token}` };

  // Lead: invalid transition NEW -> CONVERTED should fail
  const leadCreate = await request("/leads", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ name: `Lead-${Date.now()}` })
  });
  if (!leadCreate.ok) throw new Error(`Create lead failed: ${JSON.stringify(leadCreate.data)}`);
  const leadId = leadCreate.data.id;

  const leadBad = await request(`/leads/${leadId}`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({ status: "CONVERTED" })
  });
  if (leadBad.ok) throw new Error("Expected lead status transition to fail, but it succeeded");

  // Ticket: RESOLVED without subject should fail
  const ticketCreate = await request("/tickets", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({})
  });
  if (!ticketCreate.ok) throw new Error(`Create ticket failed: ${JSON.stringify(ticketCreate.data)}`);
  const ticketId = ticketCreate.data.id;

  const ticketBad = await request(`/tickets/${ticketId}`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({ status: "RESOLVED" })
  });
  if (ticketBad.ok) throw new Error("Expected ticket status validation to fail, but it succeeded");

  // Bulk ticket close should fail if subject missing
  const bulkBad = await request(`/tickets/bulk/status`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ ids: [ticketId], status: "CLOSED" })
  });
  if (bulkBad.ok) throw new Error("Expected bulk ticket status validation to fail, but it succeeded");

  console.log("Status guard checks passed (expected failures observed)." );
}

run().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
