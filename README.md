# LinkedIn PDF Resume Builder

Upload a LinkedIn profile PDF, turn it into a structured JSON Resume, edit it with a guided form, and export an ATS-friendly PDF resume.

## Stack

- Next.js 16 App Router
- JSON Resume schema validation with Zod
- LinkedIn PDF text extraction with `pdfjs-serverless`
- HTML-to-PDF rendering with Puppeteer locally
- Cloudflare Browser Rendering for production on Workers

## Local development

```bash
npm install
npm run dev
```

The app runs at `http://127.0.0.1:3000`.

## Cloudflare deployment target

This repo is prepared for **Cloudflare Workers**, not Cloudflare Pages.

Why:

- Cloudflare's Next.js guide sends full-stack SSR apps to Workers via `@opennextjs/cloudflare`.
- This app generates PDFs server-side, so it needs a real server runtime.
- Cloudflare Browser Rendering can generate the final PDF on Workers without running a local Chrome binary.

The Worker config is in `wrangler.jsonc` and is already set for the custom domain `resumebuilder.koriel.kr`.

## Required GitHub secrets

Add these repository secrets before enabling the workflow:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

For the token, grant the minimum permissions needed to deploy the Worker and attach the custom domain for `koriel.kr`.

## First production rollout

1. Make sure `koriel.kr` is on the same Cloudflare account you will deploy from.
2. Enable Browser Rendering on that Cloudflare account.
3. Add the GitHub secrets listed above.
4. Push to `main` or run the `Deploy to Cloudflare Workers` workflow manually.
5. Confirm that `resumebuilder.koriel.kr` is attached as a Custom Domain in Workers.

## Useful commands

```bash
npm run test
npm run typecheck
npm run lint
npm run build
npm run preview
npm run deploy
```
