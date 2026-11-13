// Xiao Hei's voice: GET /api/tts?lang=en&text=Hello
// Turns a short line into natural speech with MeloTTS on Cloudflare Workers AI and returns an MP3.
// Very cheap (about 19 Neurons per minute of audio), and repeated lines (greeting, scroll tour)
// are served from Cloudflare's cache, so they cost nothing after the first time.

const MODEL = '@cf/myshell-ai/melotts';
// Languages MeloTTS speaks; anything else is read by the browser's own voice instead
export const TTS_LANGS = ['en', 'es', 'fr', 'zh', 'ja', 'ko'];
const MAX_CHARS = 400;
const CACHE_SECONDS = 60 * 60 * 24 * 30; // a line always sounds the same, so keep it a month

// Fallback per-visitor limit when the rate-limit binding isn't configured (local dev)
const hits = new Map();
function overLimit(ip, limit = 30, windowMs = 60_000) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > limit;
}

const fail = (status, error) =>
  new Response(JSON.stringify({ error }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

// Only the site itself may use the voice. Browsers mark their own requests with
// Sec-Fetch-Site / Origin; a request with neither comes from a script.
function fromSite(request) {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');
  if (origin) return new URL(origin).host === url.host || /^localhost(:\d+)?$/.test(new URL(origin).host);
  return request.headers.get('Sec-Fetch-Site') === 'same-origin';
}

// Workers AI returns the MP3 either as base64 inside JSON or as raw bytes
export async function audioBytes(result) {
  if (!result) return null;
  if (typeof result.audio === 'string') {
    const bin = atob(result.audio);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  if (result instanceof Uint8Array) return result;
  if (result instanceof ArrayBuffer) return new Uint8Array(result);
  if (typeof result.getReader === 'function') return new Uint8Array(await new Response(result).arrayBuffer());
  return null;
}

export async function onRequestGet({ request, env, ctx }) {
  if (!fromSite(request)) return fail(403, 'Forbidden');
  const url = new URL(request.url);
  const lang = (url.searchParams.get('lang') || 'en').toLowerCase();
  const text = (url.searchParams.get('text') || '').replace(/\s+/g, ' ').trim();
  if (!TTS_LANGS.includes(lang)) return fail(400, 'Language not supported');
  if (!text || text.length > MAX_CHARS) return fail(400, 'Text must be 1-400 characters');

  // Same line, same audio: answer from Cloudflare's cache when we can
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const key = new Request(`${url.origin}/api/tts?lang=${lang}&text=${encodeURIComponent(text)}`);
  const cached = cache && (await cache.match(key));
  if (cached) return cached;

  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  if (env.TTS_LIMITER) {
    const { success } = await env.TTS_LIMITER.limit({ key: ip });
    if (!success) return fail(429, 'Too many requests');
  } else if (overLimit(ip)) {
    return fail(429, 'Too many requests');
  }
  if (!env.AI) return fail(503, 'Voice unavailable');

  let bytes;
  try {
    bytes = await audioBytes(await env.AI.run(MODEL, { prompt: text, lang }));
  } catch (err) {
    console.error('tts failed:', err?.message || err); // visible in Cloudflare logs
    return fail(503, 'Voice unavailable');
  }
  if (!bytes || bytes.length < 100) return fail(503, 'Voice unavailable');

  const res = new Response(bytes, {
    headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': `public, max-age=${CACHE_SECONDS}` },
  });
  if (cache) {
    const put = cache.put(key, res.clone());
    if (ctx?.waitUntil) ctx.waitUntil(put);
    else await put;
  }
  return res;
}

export function onRequestPost() {
  return fail(405, 'Use GET');
}
