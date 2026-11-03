# VTA Global Services website

Static website for VTA Global Services (Citizenship by Investment and property). No framework and no build step on the server: Cloudflare Pages serves the `public/` folder as-is.

## Structure

```
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

Every form opens WhatsApp with the visitor's details filled in, addressed to +234 807 395 9876. To change the number, edit `WA_NUMBER` at the top of `public/assets/js/app.js`.

## Deploying on Cloudflare Pages

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → choose `seunmsk/vta`.
2. Framework preset: None. Build command: leave empty. Build output directory: `public`.
3. Save and deploy. Every push to `main` redeploys.
4. Custom domain: in the Pages project → Custom domains → add `vtaglobalservices.com` and `www.vtaglobalservices.com`, then follow the DNS prompts.
