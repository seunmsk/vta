import os, sys, hashlib
OUT = sys.argv[1]
# Full web address of the live site. Link previews (WhatsApp, Facebook, X) need absolute URLs.
SITE = 'https://vtaglobal.pages.dev'
HERE = os.path.dirname(os.path.abspath(__file__))

NAV = [('index.html','Home'),('passports.html','Passports'),('ranking.html','Passport Ranking'),
       ('how-it-works.html','How CBI works'),('properties.html','Properties'),('about.html','About'),('faq.html','FAQ')]
DD = [('skn','St Kitts &amp; Nevis','23'),('ant','Antigua &amp; Barbuda','24'),('gre','Grenada','27'),('slu','Saint Lucia','29'),('dom','Dominica','29')]
CHEV = '<svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3.5l3 3 3-3"/></svg>'

def header(active):
    links = []
    for href, label in NAV:
        cls = 'nl active' if href == active else 'nl'
        if href == 'passports.html':
            items = ''.join(f'<a href="passports.html#{c}">{n} <span>#{r}</span></a>' for c, n, r in DD)
            links.append(f'<div class="nav-dd"><a href="passports.html" class="{cls}">Passports {CHEV}</a><div class="dd-menu">{items}</div></div>')
        else:
            links.append(f'<a href="{href}" class="{cls}">{label}</a>')
    drawer = ''.join(f'<a href="{h}">{l}</a>' for h, l in NAV)
    return f'''<header class="site-header">
  <div class="wrap bar">
    <a href="index.html" class="logo"><img src="assets/img/logo.png" alt="VTA Global Services" width="185" height="50"></a>
    <nav class="navlinks" aria-label="Main">{''.join(links)}</nav>
    <div class="head-right">
      <a href="consultation.html" class="btn btn-gold">Book a consultation</a>
      <button type="button" class="burger" aria-label="Menu" aria-expanded="false" aria-controls="drawer"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h14M3 10h14M3 14h14"/></svg></button>
    </div>
  </div>
  <nav class="drawer wrap" id="drawer" aria-label="Mobile">{drawer}<a href="consultation.html" style="color:var(--gold);font-weight:700">Book a consultation</a></nav>
</header>'''

FOOTER = '''<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-col"><img src="assets/img/logo.png" alt="VTA Global Services" width="222" height="60"><p>Citizenship by Investment advisors serving clients worldwide.</p><p style="color:#E9D3A0;font-size:13px">Grenada Government CBI Accredited Marketing Agent</p></div>
      <div class="foot-col"><h4>Passports</h4><a href="passports.html#skn">St Kitts &amp; Nevis</a><a href="passports.html#ant">Antigua &amp; Barbuda</a><a href="passports.html#gre">Grenada</a><a href="passports.html#slu">Saint Lucia</a><a href="passports.html#dom">Dominica</a></div>
      <div class="foot-col"><h4>Company</h4><a href="how-it-works.html">How CBI works</a><a href="ranking.html">Passport Ranking</a><a href="properties.html">Properties</a><a href="about.html">About us</a><a href="faq.html">FAQ</a><a href="consultation.html">Book a consultation</a></div>
      <div class="foot-col"><h4>Contact</h4><a href="https://wa.me/2348073959876" target="_blank" rel="noopener">WhatsApp +234 807 395 9876</a><a href="tel:+2348073959876">+234 807 395 9876</a><a href="tel:+447960645586">+44 7960 645586</a><a href="mailto:info@vtaglobalservices.com">info@vtaglobalservices.com</a><a href="https://www.instagram.com/vtaglobalcitizenship/" target="_blank" rel="noopener">Instagram</a></div>
    </div>
    <div class="foot-bottom"><span>© <span data-year>2026</span> VTA Global Services. All rights reserved.</span></div>
  </div>
</footer>'''

def ver(path):
    with open(os.path.join(OUT, path), 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()[:10]

def page(fname, title, desc, page_id, body):
    html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="VTA Global Services">
<meta property="og:url" content="{SITE}/{'' if fname == 'index.html' else fname}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{SITE}/assets/img/og-image.jpg">
<meta property="og:image:secure_url" content="{SITE}/assets/img/og-image.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="VTA Global Services logo">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{SITE}/assets/img/og-image.jpg">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<meta name="theme-color" content="#0B1B2B">
<link rel="icon" href="assets/img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css?v={ver("assets/css/style.css")}">
</head>
<body data-page="{page_id}">
{header(fname)}
<main>
{body}
</main>
{FOOTER}
<script src="assets/js/content.js?v={ver("assets/js/content.js")}"></script>
<script src="assets/js/app.js?v={ver("assets/js/app.js")}"></script>
<script src="assets/js/feedback.js?v={ver("assets/js/feedback.js")}" defer></script>
</body>
</html>
'''
    with open(os.path.join(OUT, fname), 'w', encoding='utf-8') as f:
        f.write(html)

PAGES = [
 ('index.html','VTA Global Services | Citizenship by Investment','Second citizenship through Caribbean Citizenship by Investment. Compare St Kitts, Antigua, Grenada, Saint Lucia and Dominica passports with VTA Global Services.','home'),
 ('passports.html','Caribbean Passports | VTA Global Services','Investment options, family rules, requirements and timelines for all five Caribbean Citizenship by Investment programmes.','passports'),
 ('ranking.html','Global Passport Ranking 2026 | VTA Global Services','See how 199 passports rank by visa-free access, and compare any two side by side.','ranking'),
 ('how-it-works.html','How Citizenship by Investment Works | VTA Global Services','What CBI is, why people choose a second passport, the step-by-step process and a full document checklist.','how'),
 ('properties.html','Properties | VTA Global Services','Premium homes to rent and buy. Current listings on Banana Island, and a property search service anywhere you want to live.','properties'),
 ('about.html','About Us | VTA Global Services','Second citizenship advisors for families who think globally.','about'),
 ('faq.html','FAQ | VTA Global Services','Straight answers to the questions clients ask most about Citizenship by Investment.','faq'),
 ('consultation.html','Book a Consultation | VTA Global Services','Book a free 30-minute consultation by Zoom, WhatsApp or in person.','consult'),
]
for fname, title, desc, pid in PAGES:
    with open(os.path.join(HERE, 'pages', fname), encoding='utf-8') as f:
        page(fname, title, desc, pid, f.read())
print('built', len(PAGES))
