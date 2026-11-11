// Cloudflare Worker entry: serves the built site from /dist plus two small APIs.
// Static files are served automatically; requests that don't match a file come here.

import { EmailMessage } from 'cloudflare:email';
import * as chat from '../functions/api/chat.js';
import * as contact from '../functions/api/contact.js';

// Runtime-only modules the API handlers need (passed in so the handlers stay testable)
const DEPS = { EmailMessage };

const ROUTES = {
  '/api/chat': chat,
  '/api/contact': contact,
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const route = ROUTES[url.pathname];

    if (route) {
      try {
        if (request.method === 'POST' && route.onRequestPost) return await route.onRequestPost({ request, env }, DEPS);
        if (request.method === 'GET' && route.onRequestGet) return route.onRequestGet();
        return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
      } catch (err) {
        // Any unexpected failure still returns JSON the page knows how to handle
        console.error(url.pathname, 'failed:', err?.stack || err);
        return new Response(JSON.stringify({ error: 'Server error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
