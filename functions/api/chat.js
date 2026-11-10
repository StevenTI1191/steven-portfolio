// Cloudflare Pages Function: POST /api/chat
// Uses the Workers AI binding "AI" (set in wrangler.toml or the Pages dashboard).
// No API key needed: Workers AI runs inside your Cloudflare account.

import { buildKnowledge, profile } from '../../src/data/profile.js';

const MODEL = '@cf/meta/llama-3.1-8b-instruct';
const MAX_TURNS = 8;
const MAX_CHARS = 600;

const SYSTEM_PROMPT = `You are Robo, a friendly robot assistant on ${profile.name}'s portfolio website.
Answer questions about ${profile.name} using ONLY the facts below. Keep answers short: 1 to 3 sentences, plain text, no markdown.
If something is not in the facts, or a fact is still a placeholder in [square brackets], say you don't know that yet and suggest contacting ${profile.name} through the contact section.
Never invent projects, numbers, employers, or certificates. Politely decline questions unrelated to ${profile.name}.
Reply in the same language the visitor uses.

FACTS:
${buildKnowledge()}`;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export async function onRequestPost({ request, env }) {
  if (!env.AI) return json({ error: 'Workers AI binding "AI" is not configured' }, 500);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const clean = messages
    .filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  if (!clean.length || clean[clean.length - 1].role !== 'user') {
    return json({ error: 'Send at least one user message' }, 400);
  }

  try {
    const result = await env.AI.run(MODEL, {
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...clean],
      max_tokens: 220,
      temperature: 0.4,
    });
    const reply = (result?.response || '').trim();
    return json({ reply });
  } catch (err) {
    // Includes running out of the free daily allocation
    return json({ error: 'AI unavailable', detail: String(err?.message || err) }, 503);
  }
}

export function onRequestGet() {
  return json({ ok: true, hint: 'POST { messages: [{ role: "user", content: "..." }] }' });
}
