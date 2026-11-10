// Cloudflare Worker entry: serves the built site from /dist and the Robo chat API.
// Static files are served automatically; requests that don't match a file come here.

import { onRequestGet, onRequestPost } from '../functions/api/chat.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/chat') {
      if (request.method === 'POST') return onRequestPost({ request, env });
      if (request.method === 'GET') return onRequestGet();
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, POST' } });
    }

    return env.ASSETS.fetch(request);
  },
};
