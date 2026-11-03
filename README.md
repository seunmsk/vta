# VTA Global Services website

Static website for VTA Global Services (Citizenship by Investment and property). No framework and no build step on the server: Cloudflare Pages serves the `public/` folder as-is.

## Structure

```
functions/         Cloudflare Pages Functions (API for the staff dashboard, enquiries and uploads)
lib/               Shared server helpers
public/admin/      The dashboard
public/            The live site (what Cloudflare serves)
  *.html           8 pages
  assets/css/      style.css
  assets/js/       app.js (passport wall, ranking, gallery, WhatsApp forms)
  assets/img/      passports, Metave photos, logos
  _headers         Cloudflare cache and security headers
src/
  build.py         Wraps each page in the shared header and footer
  pages/*.html     Page content (edit these, not public/*.html)
```

## Editing

1. Change content in `src/pages/<page>.html`, or the header and footer in `src/build.py`.
2. Rebuild: `python3 src/build.py public`
3. Commit and push. Cloudflare redeploys automatically.

Styling lives in `public/assets/css/style.css` and behaviour in `public/assets/js/app.js`. Edit those directly.

## Forms

Every form opens WhatsApp with the visitor's details filled in, and also saves a copy to the dashboard inbox. The WhatsApp number is set in the dashboard under Settings.

## Staff dashboard (`/admin`)

Sign in at `https://<site>/admin` with the admin password.

- **Enquiries**: every form submission, with status (new, contacted, closed), notes, search and CSV export.
- **Properties**: add, edit, reorder or remove listings, including photos, key facts, cost breakdown and features.
- **Passports**: ranks, visa-free counts, prices, processing times and programme details for the five Caribbean passports.
- **FAQs**: questions, answers, topics, and which appear on the homepage.
- **Settings**: WhatsApp number, content backup download, restore the previous published version.

Edits stay as a draft until you click **Publish changes**. The site picks them up within a minute.

Content defaults live in `public/assets/js/content.js`. Once anything is published from the dashboard, the published copy (stored in Cloudflare KV) is used instead.

### One-time setup

1. **Storage.** Cloudflare dashboard → Storage & Databases → KV → Create a namespace called `vta-data`. Copy its ID into `wrangler.toml` (the `[[kv_namespaces]]` block, binding `DATA`) and push.
2. **Password.** Pages project `vtaglobal` → Settings → Variables and Secrets → Add → Type **Secret**, name `ADMIN_PASSWORD`, value of your choice (use something long). Then redeploy.

Server code lives in `functions/` (Cloudflare Pages Functions) and `lib/`.

## Deploying on Cloudflare Pages

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → choose `seunmsk/vta`.
2. Framework preset: None. Build command: leave empty. Build output directory: `public`.
3. Save and deploy. Every push to `main` redeploys.
4. Custom domain: in the Pages project → Custom domains → add `vtaglobalservices.com` and `www.vtaglobalservices.com`, then follow the DNS prompts.
