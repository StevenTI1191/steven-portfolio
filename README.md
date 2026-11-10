# Steven Lim — Portfolio

React + Vite portfolio with a 3D robot assistant (Robo) that answers questions about Steven using Cloudflare Workers AI. Hosting and AI both run on Cloudflare's free plan.

## What's inside

```
src/
  data/profile.js        ← ALL content lives here (projects, skills, badges, Robo's answers)
  components/            ← one file per section (Hero, Projects, Skills, Badges, ...)
  components/Robo.jsx    ← Robo's speech bubble + chat
  components/robotScene.js ← the 3D robot (Three.js)
  styles.css
functions/api/chat.js    ← Cloudflare Pages Function: POST /api/chat → Workers AI
public/badges/           ← put your badge images here
wrangler.toml            ← Cloudflare config (AI binding)
```

## 1. Run it on your laptop

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the address it prints (usually http://localhost:5173). In this mode `/api/chat` doesn't exist yet, so Robo answers from the offline replies in `profile.js`. That's expected.

To test the real AI locally (needs a free Cloudflare account):

```bash
npx wrangler login
npm run cf:dev
```

## 2. Fill in your content

Open `src/data/profile.js` and replace everything in `[square brackets]`.

- **Badges:** copy the image into `public/badges/` (e.g. `aws.png`), then set `image: '/badges/aws.png'` on that badge.
- **Project screenshots:** create `public/projects/`, add images, then set `screenshot: '/projects/inventory.png'`.
- **Robo's knowledge** is built automatically from this file, so the AI always matches what's on the page.

## 3. Deploy to Cloudflare Pages

**Option A — connect GitHub (recommended, auto-deploys on every push)**

1. Push this folder to a new GitHub repository.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → pick the repo.
3. Build settings: Framework preset **Vite**, build command `npm run build`, output directory `dist`.
4. After the first deploy: project **Settings** → **Bindings** → **Add** → **Workers AI**, variable name `AI`. Then redeploy.

**Option B — deploy from your laptop**

```bash
npx wrangler login
npm run deploy
```

The `[ai]` binding in `wrangler.toml` is picked up automatically.

## 4. Connect your domain

Pages project → **Custom domains** → **Set up a custom domain** → enter your domain and follow the DNS steps. If the domain's DNS is already on Cloudflare this is one click; otherwise add the CNAME record it shows at your domain registrar.

## Notes

- **Cost:** Workers AI has a free daily allowance. If it runs out, `/api/chat` returns an error and Robo falls back to the offline answers, so the site never breaks. Check current limits on Cloudflare's Workers AI pricing page.
- **Model:** change `MODEL` in `functions/api/chat.js` to try another Workers AI model.
- **Voice:** Robo uses the browser's built-in text-to-speech; visitors can mute it in the chat.
