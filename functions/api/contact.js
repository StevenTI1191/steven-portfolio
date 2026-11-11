// "Hire me" form endpoint: POST /api/contact → an email in Steven's inbox.
//
// Uses Cloudflare Email Routing's send_email binding (free). One-time setup in the dashboard:
//   Email → Email Routing → enable it for sldev.my.id, and verify the destination address
//   (the same address as destination_address in wrangler.toml).
// Until that's done, sending fails and the form shows the email address to use instead.
//
// Spam protection: same-site only, a hidden honeypot field, a minimum fill time,
// per-visitor rate limit, and strict length checks.

import { profile } from '../../src/data/profile.js';

const FROM = 'portfolio@sldev.my.id'; // any address on the domain with Email Routing on
const LIMITS = { name: 80, email: 120, company: 100, message: 3000 };
const FALLBACK_PER_MIN = 3;

const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra },
  });

function isAllowedOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  try {
    const o = new URL(origin);
    const self = new URL(request.url);
    return o.host === self.host || o.hostname === 'localhost' || o.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

const hits = new Map();
async function isRateLimited(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (env.CONTACT_LIMITER?.limit) {
    try {
      const { success } = await env.CONTACT_LIMITER.limit({ key: `contact:${ip}` });
      return !success;
    } catch {
      /* fall through */
    }
  }
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > FALLBACK_PER_MIN;
}

// Validates and cleans the submitted fields. Returns { data } or { errors }.
export function validate(body) {
  const s = (v, max) => (typeof v === 'string' ? v.replace(/\r/g, '').trim().slice(0, max) : '');
  const data = {
    name: s(body?.name, LIMITS.name).replace(/\n/g, ' '),
    email: s(body?.email, LIMITS.email).replace(/\s/g, ''),
    company: s(body?.company, LIMITS.company).replace(/\n/g, ' '),
    message: s(body?.message, LIMITS.message),
  };
  const errors = {};
  if (data.name.length < 2) errors.name = 'Enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) errors.email = 'Enter a valid email so Steven can reply.';
  if (data.message.length < 10) errors.message = 'Add a few words about the role or project.';
  return Object.keys(errors).length ? { errors } : { data };
}

const b64 = (str) => {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
};
const wrap76 = (s) => s.replace(/.{1,76}/g, '$&\r\n');

// Builds a plain-text MIME email (UTF-8, base64 body and subject)
export function buildEmail({ data, to, from, now = new Date(), id = crypto.randomUUID() }) {
  const subject = `Hiring inquiry from ${data.name}${data.company ? ` (${data.company})` : ''}`;
  const body = [
    `New message from your portfolio's hire form.`,
    '',
    `Name:     ${data.name}`,
    `Email:    ${data.email}`,
    `Company:  ${data.company || '-'}`,
    '',
    'Message:',
    data.message,
    '',
    '—',
    'Reply to this email to answer them directly.',
  ].join('\r\n');
  return [
    `From: Portfolio <${from}>`,
    `To: ${to}`,
    `Reply-To: ${data.email}`,
    `Subject: =?UTF-8?B?${b64(subject)}?=`,
    `Date: ${now.toUTCString()}`,
    `Message-ID: <${id}@sldev.my.id>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrap76(b64(body)),
  ].join('\r\n');
}

export async function onRequestPost({ request, env }, deps = {}) {
  if (!isAllowedOrigin(request)) return json({ error: 'Forbidden' }, 403);
  if (Number(request.headers.get('Content-Length') || 0) > 20_000) return json({ error: 'Too large' }, 413);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  // Bots fill the hidden field or submit instantly: pretend it worked and drop it
  const tooFast = typeof body?.elapsed === 'number' && body.elapsed < 2500;
  if (body?.website || tooFast) return json({ ok: true });

  if (await isRateLimited(request, env)) {
    return json({ error: 'Too many messages. Try again in a minute.' }, 429, { 'Retry-After': '60' });
  }

  const { data, errors } = validate(body);
  if (errors) return json({ error: 'Check the highlighted fields.', fields: errors }, 400);

  if (!env.SEND_EMAIL) return json({ error: 'Email sending is not set up yet.', fallback: profile.email }, 503);

  try {
    const EmailMessage = deps.EmailMessage || (await import('cloudflare:email')).EmailMessage;
    const raw = buildEmail({ data, to: profile.email, from: FROM });
    await env.SEND_EMAIL.send(new EmailMessage(FROM, profile.email, raw));
    return json({ ok: true });
  } catch (err) {
    return json({ error: "Couldn't send right now.", fallback: profile.email, detail: String(err?.message || err) }, 502);
  }
}
