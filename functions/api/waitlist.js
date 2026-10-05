// Waitlist lead capture — runs as a Cloudflare Pages Function at /api/waitlist.
// Stores { email, lang, ts } in the WAITLIST KV binding. No IP, no UA, no cookies.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export async function onRequestPost({ request, env }) {
  let payload;
  try { payload = await request.json(); } catch { return json({ ok: false, error: 'bad_json' }, 400); }

  // Honeypot: real users never fill this hidden field
  if (payload.company) return json({ ok: true });

  const email = String(payload.email ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) return json({ ok: false, error: 'invalid_email' }, 400);

  const existing = await env.WAITLIST.get(email);
  if (!existing) {
    await env.WAITLIST.put(email, JSON.stringify({
      email,
      lang: payload.lang === 'en' ? 'en' : 'vi',
      ts: new Date().toISOString(),
    }));
  }
  return json({ ok: true, dup: Boolean(existing) });
}

export async function onRequestGet() {
  return json({ ok: true, endpoint: 'waitlist' });
}
