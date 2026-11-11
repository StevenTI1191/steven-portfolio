// Cloudflare Worker entry: serves the built site from /dist plus two small APIs.
// Static files are served automatically; requests that don't match a file come here.

import * as chat from '../functions/api/chat.js';
import * as contact from '../functions/api/contact.js';

const ROUTES = {
  '/api/chat': chat,
  '/api/contact': contact,
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const route = ROUTES[url.pathname];

    if (route) {
      if (request.method === 'POST' && route.onRequestPost) return route.onRequestPost({ request, env });
      if (request.method === 'GET' && route.onRequestGet) return route.onRequestGet();
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
    }

    return env.ASSETS.fetch(request);
  },
};
