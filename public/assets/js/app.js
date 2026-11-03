/* VTA Global Services site script */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var k = function (n) { return '$' + Math.round(Number(n) / 1000) + 'k'; };
  var suf = function (r) { var t = r % 100; if (t >= 11 && t <= 13) return 'th'; return ['th', 'st', 'nd', 'rd'][r % 10] || 'th'; };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };

  /* ---------- content ---------- */
  var DEF = window.VTA_DEFAULTS;
  var C = clone(DEF);
  function merge(saved) {
    var out = clone(DEF);
    if (!saved || typeof saved !== 'object') return out;
    if (saved.settings) out.settings = Object.assign(out.settings, saved.settings);
    if (Array.isArray(saved.passports)) {
      out.passports = out.passports.map(function (p) {
        var s = saved.passports.filter(function (x) { return x && x.id === p.id; })[0];
        return s ? Object.assign({}, p, s, { id: p.id, img: s.img || p.img, rankName: p.rankName }) : p;
      });
    }
    if (Array.isArray(saved.properties)) out.properties = saved.properties;
    if (Array.isArray(saved.faqs)) out.faqs = saved.faqs;
    return out;
  }
  var renders = [];
  function onContent(fn) { renders.push(fn); fn(); }
  function waNumber() { return String((C.settings && C.settings.whatsapp) || '2348073959876').replace(/\D/g, ''); }

  /* ---------- nav ---------- */
  var burger = $('.burger'), drawer = $('#drawer');
  if (burger && drawer) burger.addEventListener('click', function () {
    var open = drawer.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- pick groups (chips / option buttons), delegated so rendered chips work ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-pick] [data-v]'); if (!b) return;
    var group = b.closest('[data-pick]');
    if (group.hasAttribute('data-multi')) b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    else $$('[data-v]', group).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    group.dispatchEvent(new CustomEvent('pick', { bubbles: true }));
  });

  /* ---------- home ---------- */
  function initHome() {
    var wall = $('#ppWall'); if (!wall) return;
    var pickMap = { cost: 'cheapest', power: 'strongest', speed: 'fastest', e2: 'gre' };
    var priority = null, flipped = null, sort = 'rank';
    var FLIP = '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/></svg>';
    var HINT = '<span class="pp-hint">' + FLIP + '<span class="t-touch">Tap for details</span><span class="t-hover">Details</span></span>';
    function bestId() {
      var P = C.passports; if (!priority) return null;
      if (priority === 'e2') return 'gre';
      var by = priority === 'cost' ? function (a, b) { return a.price - b.price; } : priority === 'speed' ? function (a, b) { return a.speedN - b.speedN; } : function (a, b) { return a.rank - b.rank || b.dest - a.dest; };
      return P.slice().sort(by)[0].id;
    }
    function renderWall() {
      var pick = bestId();
      wall.innerHTML = C.passports.map(function (p) {
        return '<div class="pp-item">' +
          '<button type="button" class="pp' + (flipped === p.id ? ' on' : '') + '" data-id="' + p.id + '" aria-pressed="' + (flipped === p.id) + '" aria-label="' + esc(p.name) + ' passport: show ranking and features">' +
          '<div class="pp-inner"><div class="pp-face front"><img src="' + esc(p.img) + '" alt="" loading="lazy"><span class="pp-foot"><span class="pp-badge">#' + esc(p.rank) + ' globally</span>' + HINT + '</span>' +
          (pick === p.id ? '<span class="pp-pick">BEST MATCH</span>' : '') + '</div>' +
          '<div class="pp-face back"><div style="display:flex;justify-content:space-between;gap:8px"><div><div class="pp-k">Global rank</div><div class="pp-v">#' + esc(p.rank) + '</div></div>' +
          '<div style="text-align:right"><div class="pp-k">Visa-free</div><div class="pp-v" style="font-size:30px;line-height:1.1">' + esc(p.dest) + '</div></div></div>' +
          '<div class="pp-bar"><i style="width:' + Math.min(100, Math.round(p.dest / 199 * 100)) + '%"></i></div>' +
          '<div class="pp-mini"><div><span style="color:#5B6B78">From</span><div>' + k(p.price) + '</div></div><div><span style="color:#5B6B78">Processing</span><div>' + esc(p.speed) + '</div></div></div>' +
          '<ul class="pp-feat">' + (p.features || []).map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul><span class="pp-close">' + FLIP + 'Tap to close</span></div></div></button>' +
          '<div class="pp-meta"><b>' + esc(p.name) + '</b><span>Since ' + esc(p.est) + '</span></div>' +
          '<a href="passports.html#' + p.id + '" style="font-size:13px;font-weight:600;text-decoration:none">View programme →</a></div>';
      }).join('');
    }
    function renderCmp() {
      var pick = bestId();
      var rows = C.passports.slice().sort(function (a, b) { return sort === 'price' ? a.price - b.price : sort === 'speed' ? a.speedN - b.speedN : a.rank - b.rank; });
      $('#cmpBody').innerHTML = rows.map(function (r) {
        return '<tr' + (pick === r.id ? ' class="hl"' : '') + '><td><span class="cname"><img src="' + esc(r.img) + '" alt="">' + esc(r.name) + '</span></td><td>#' + esc(r.rank) + '</td><td>' + esc(r.dest) + '</td><td style="font-weight:600">' + k(r.price) + '</td><td>' + k(r.re) + '</td><td>' + esc(r.speed) + '</td></tr>';
      }).join('');
    }
    function renderProps() {
      var box = $('#homeProps'); if (!box) return;
      var cta = box.querySelector('.prop-cta');
      $$('.prop-t:not(.prop-cta)', box).forEach(function (n) { n.remove(); });
      C.properties.slice(0, 2).forEach(function (p) {
        var a = document.createElement('a');
        a.href = 'properties.html#listings'; a.className = 'prop-t';
        var ph = p.photos && p.photos[0];
        a.innerHTML = (ph ? '<div class="ph"><img src="' + esc(ph.src) + '" alt="' + esc(p.name) + '" loading="lazy"></div>' : '<div class="ph" style="background:linear-gradient(160deg,#2B2440,#15102A)">' + esc(p.status) + '</div>') +
          '<div class="body"><div><div class="t">' + esc(p.name) + '</div><div class="s">' + esc(p.summary || p.location) + '</div></div><span class="circle" aria-hidden="true">→</span></div>';
        box.insertBefore(a, cta);
      });
    }
    function renderFaq() {
      var box = $('#homeFaq'); if (!box) return;
      var list = C.faqs.filter(function (f) { return f.home; }); if (!list.length) list = C.faqs.slice(0, 5);
      box.innerHTML = list.map(function (f, i) { return '<details class="acc"' + (i === 0 ? ' open' : '') + '><summary>' + esc(f.q) + '</summary><div class="ans">' + esc(f.a) + '</div></details>'; }).join('');
    }
    wall.addEventListener('click', function (e) {
      var b = e.target.closest('.pp'); if (!b) return;
      flipped = flipped === b.dataset.id ? null : b.dataset.id;
      $$('.pp', wall).forEach(function (x) { x.classList.toggle('on', x.dataset.id === flipped); x.setAttribute('aria-pressed', x.dataset.id === flipped ? 'true' : 'false'); });
    });
    // Show the flip once, when the wall first comes into view.
    if ('IntersectionObserver' in window) {
      var seen = false; try { seen = sessionStorage.getItem('vta-peek') === '1'; } catch (err) {}
      if (!seen) {
        var io = new IntersectionObserver(function (en) {
          if (!en[0].isIntersecting) return;
          io.disconnect();
          var first = $('.pp-inner', wall); if (!first) return;
          setTimeout(function () { first.classList.add('peek'); }, 400);
          first.addEventListener('animationend', function () { first.classList.remove('peek'); }, { once: true });
          try { sessionStorage.setItem('vta-peek', '1'); } catch (err) {}
        }, { threshold: 0.45 });
        io.observe(wall);
      }
    }
    $$('#priorities .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        priority = priority === c.dataset.p ? null : c.dataset.p;
        $$('#priorities .chip').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.p === priority ? 'true' : 'false'); });
        renderWall(); renderCmp();
      });
    });
    $$('#sorts .chip').forEach(function (c) {
      c.addEventListener('click', function () { sort = c.dataset.s; $$('#sorts .chip').forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); }); renderCmp(); });
    });
    onContent(function () { renderWall(); renderCmp(); renderProps(); renderFaq(); });
  }

  /* ---------- passports ---------- */
  function initPassports() {
    var tabs = $('#ppTabs'); if (!tabs) return;
    var current = location.hash.slice(1) || 'ant';
    function show(id, push) {
      var P = C.passports;
      var c = P.filter(function (x) { return x.id === id; })[0] || P[1] || P[0];
      current = c.id;
      $$('#ppTabs .tab').forEach(function (t) { t.setAttribute('aria-selected', t.dataset.id === c.id ? 'true' : 'false'); });
      $$('#cBars .barrow').forEach(function (t) { t.classList.toggle('on', t.dataset.id === c.id); });
      $('#cEyebrow').textContent = 'Citizenship by Investment · Since ' + c.est;
      $('#cName').textContent = c.name;
      $('#cTag').textContent = c.tagline;
      $('#cRank').textContent = '#' + c.rank;
      $('#cDest').textContent = c.dest;
      $('#cFrom').textContent = k(c.price);
      $('#cSpeed').textContent = String(c.speed).replace(' months', ' mo');
      $('#cCta').textContent = 'Talk to us about ' + c.short;
      var cov = $('#cCover'); cov.src = c.img; cov.alt = c.name + ' passport cover';
      cov.classList.remove('fade'); void cov.offsetWidth; cov.classList.add('fade');
      var ht = $('#ppHeroText'); ht.classList.remove('fade'); void ht.offsetWidth; ht.classList.add('fade');
      $('#cRoutesH').textContent = 'Ways to qualify for ' + c.short;
      $('#cAbout').textContent = c.about;
      $('#cRoutes').innerHTML = (c.routes || []).map(function (r) { return '<div class="card-l route"><div class="lbl">' + esc(r.label) + '</div><div class="amt">' + esc(r.amount) + '</div><p>' + esc(r.note) + '</p></div>'; }).join('');
      $('#cBenefits').innerHTML = (c.benefits || []).map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('');
      $('#cFamily').innerHTML = (c.family || []).map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('');
      $('#cStay').textContent = c.stay;
      $('#cQuoteH').textContent = 'Get your ' + c.short + ' cost breakdown';
      $('#cQuoteBtn').textContent = 'Send my ' + c.short + ' quote request';
      $('#cHidden').value = c.name;
      document.title = c.name + ' Citizenship by Investment | VTA Global Services';
      if (push && history.replaceState) history.replaceState(null, '', '#' + c.id);
    }
    function build() {
      tabs.innerHTML = C.passports.map(function (p) { return '<button type="button" class="tab" role="tab" data-id="' + p.id + '" aria-selected="false"><img src="' + esc(p.img) + '" alt="">' + esc(p.name) + '</button>'; }).join('');
      $('#cBars').innerHTML = C.passports.map(function (p) {
        return '<button type="button" class="barrow" data-id="' + p.id + '" aria-label="' + esc(p.name) + ': ' + esc(p.dest) + ' destinations. Show this passport."><span class="n">' + esc(p.name) + '</span><span class="t"><i style="width:' + Math.min(100, Math.round(p.dest / 160 * 100)) + '%"></i></span><span class="v">' + esc(p.dest) + '</span></button>';
      }).join('');
      show(current);
    }
    tabs.addEventListener('click', function (e) { var t = e.target.closest('.tab'); if (t) show(t.dataset.id, true); });
    $('#cBars').addEventListener('click', function (e) { var t = e.target.closest('.barrow'); if (t) { show(t.dataset.id, true); window.scrollTo({ top: 0, behavior: 'smooth' }); } });
    window.addEventListener('hashchange', function () { show(location.hash.slice(1)); window.scrollTo({ top: 0 }); });
    onContent(build);
  }

  /* ---------- ranking ---------- */
  var RAW = '1|Singapore|192;2|Japan|188;2|South Korea|188;3|Denmark|186;3|Luxembourg|186;3|Spain|186;3|Sweden|186;3|Switzerland|186;4|Austria|185;4|Belgium|185;4|Finland|185;4|France|185;4|Germany|185;4|Greece|185;4|Ireland|185;4|Italy|185;4|Netherlands|185;4|Norway|185;5|Hungary|184;5|Portugal|184;5|Slovakia|184;5|Slovenia|184;5|United Arab Emirates|184;6|Croatia|183;6|Czechia|183;6|Estonia|183;6|Malta|183;6|New Zealand|183;6|Poland|183;7|Australia|182;7|Latvia|182;7|Liechtenstein|182;7|United Kingdom|182;8|Canada|181;8|Iceland|181;8|Lithuania|181;9|Malaysia|180;10|United States|179;11|Bulgaria|178;11|Romania|178;12|Monaco|177;13|Chile|175;14|Cyprus|174;15|Andorra|171;15|Hong Kong (SAR China)|171;16|Argentina|169;16|Brazil|169;17|San Marino|168;18|Israel|165;19|Barbados|162;19|Brunei|162;20|The Bahamas|158;21|Mexico|157;22|St. Vincent and the Grenadines|156;22|Uruguay|156;23|St. Kitts and Nevis|155;24|Antigua and Barbuda|154;24|Seychelles|154;25|Vatican City|152;26|Costa Rica|148;26|Panama|148;27|Grenada|147;27|Mauritius|147;28|Trinidad and Tobago|146;29|Dominica|145;29|Paraguay|145;29|St. Lucia|145;30|Ukraine|143;31|Peru|142;32|Macao (SAR China)|141;33|Taiwan (Chinese Taipei)|139;34|Serbia|136;35|El Salvador|132;35|Guatemala|132;36|Solomon Islands|131;37|Colombia|130;37|Honduras|130;38|Marshall Islands|128;38|Montenegro|128;38|North Macedonia|128;38|Samoa|128;39|Tonga|127;40|Nicaragua|125;41|Tuvalu|124;42|Bosnia and Herzegovina|122;42|Georgia|122;42|Kiribati|122;43|Albania|121;43|Micronesia|121;43|Palau Islands|121;44|Moldova|120;45|Venezuela|118;46|Russian Federation|113;46|Türkiye|113;47|Qatar|111;48|South Africa|101;49|Belize|99;50|Kuwait|96;51|Ecuador|94;51|Timor-Leste|94;52|Maldives|92;53|Vanuatu|89;54|Fiji|88;54|Guyana|88;54|Saudi Arabia|88;55|Bahrain|87;56|Jamaica|86;57|Nauru|85;57|Oman|85;58|Papua New Guinea|83;59|Botswana|81;59|China|81;59|Kosovo|81;60|Belarus|79;60|Thailand|79;61|Bolivia|78;61|Kazakhstan|78;61|Suriname|78;62|Namibia|76;63|Lesotho|74;64|Indonesia|73;65|Dominican Republic|72;65|Morocco|72;65|eSwatini|72;66|Malawi|71;67|Azerbaijan|70;68|Kenya|69;68|The Gambia|69;69|Ghana|68;69|Tanzania|68;70|Benin|67;70|Rwanda|67;70|Tunisia|67;71|Armenia|66;71|Uganda|66;72|Cape Verde Islands|65;72|Zambia|65;73|Mongolia|64;73|Philippines|64;74|Sierra Leone|62;74|Zimbabwe|62;75|Kyrgyzstan|61;75|Uzbekistan|61;76|Mozambique|60;76|São Tomé and Príncipe|60;77|Cuba|58;77|Togo|58;78|Burkina Faso|57;78|Côte d\'Ivoire|57;78|Gabon|57;78|Madagascar|57;78|Senegal|57;79|Mauritania|56;80|Algeria|55;80|India|55;80|Niger|55;81|Equatorial Guinea|54;81|Guinea|54;81|Tajikistan|54;82|Mali|53;83|Chad|52;83|Guinea-Bissau|52;84|Comoro Islands|51;84|Jordan|51;85|Bhutan|50;85|Cambodia|50;85|Egypt|50;85|Haiti|50;86|Angola|49;86|Burundi|49;86|Central African Republic|49;86|Liberia|49;86|Vietnam|49;87|Cameroon|47;87|Congo (Rep.)|47;87|Laos|47;87|Turkmenistan|47;88|Djibouti|46;89|Myanmar|44;89|Nigeria|44;90|Congo (Dem. Rep.)|43;90|Ethiopia|43;90|Lebanon|43;91|South Sudan|41;91|Sudan|41;92|Iran|40;93|Libya|39;93|Sri Lanka|39;94|Eritrea|38;94|North Korea|38;94|Palestinian Territory|38;95|Bangladesh|37;96|Nepal|35;97|Somalia|33;98|Pakistan|31;98|Yemen|31;99|Iraq|29;100|Syria|26;101|Afghanistan|24';
  function initRanking() {
    var list = $('#rkList'); if (!list) return;
    var IMGS = { 'Nigeria': 'assets/img/pp-nigeria.webp', 'South Korea': 'assets/img/pp-southkorea.webp', 'Singapore': 'assets/img/pp-singapore.webp', 'Japan': 'assets/img/pp-japan.webp' };
    var BLUE = ['United States', 'Canada', 'Australia', 'Brazil', 'Argentina', 'Uruguay', 'Paraguay', 'United Kingdom', 'Barbados', 'The Bahamas', 'St. Vincent and the Grenadines', 'Trinidad and Tobago', 'Jamaica', 'Belize', 'Guyana', 'Suriname'];
    var GREEN = ['Saudi Arabia', 'Pakistan', 'Bangladesh', 'Algeria', 'Niger', 'Senegal'];
    var col = function (n) { return BLUE.indexOf(n) >= 0 ? ['#1B3F78', '#0C2448'] : GREEN.indexOf(n) >= 0 ? ['#1F5A3A', '#0E3020'] : n === 'Switzerland' ? ['#B3262E', '#7A141B'] : n === 'New Zealand' ? ['#2A2A2E', '#111114'] : ['#7A1F2B', '#4A0F18']; };
    var D = [];
    function buildData() {
      var map = {}; C.passports.forEach(function (c) { map[c.rankName] = c; });
      D = RAW.split(';').map(function (l) {
        var p = l.split('|'), cb = map[p[1]] || null;
        return { rank: cb ? Number(cb.rank) : +p[0], n: p[1], s: cb ? Number(cb.dest) : +p[2], img: cb ? cb.img : (IMGS[p[1]] || ''), cbi: cb, c: col(p[1]) };
      }).sort(function (a, b) { return b.s - a.s || a.rank - b.rank; });
    }
    var find = function (n) { return D.filter(function (x) { return x.n === n; })[0] || D[0]; };
    var state = { a: 'Nigeria', b: 'St. Kitts and Nevis', q: '', f: 'all', limit: 25, open: null };
    var cover = function (x, cls, w, h) {
      return x.img ? '<img class="' + cls + '" src="' + esc(x.img) + '" alt="" loading="lazy"' + (w ? ' style="width:' + w + 'px;height:' + h + 'px"' : '') + '>'
        : '<span class="' + cls + '" aria-hidden="true" style="background:linear-gradient(160deg,' + x.c[0] + ',' + x.c[1] + ');border:1px solid rgba(216,180,106,.45)' + (w ? ';width:' + w + 'px;height:' + h + 'px' : '') + '"></span>';
    };
    function card(x) {
      return cover(x, 'cv', 84, 120) + '<div><div style="font-size:13px;color:var(--muted2)">Ranked ' + x.rank + suf(x.rank) + '</div><div style="font-weight:700;font-size:19px">' + esc(x.n) + '</div><div class="num">' + x.s + '</div><div style="font-size:13px;color:var(--muted2)">destinations</div></div>';
    }
    function renderVs() {
      var A = find(state.a), B = find(state.b), d = B.s - A.s;
      $('#vsA').innerHTML = card(A); $('#vsB').innerHTML = card(B);
      $('#vsLbl').textContent = B.n + ' opens';
      $('#vsNum').textContent = (d >= 0 ? '+' : '−') + Math.abs(d);
      $('#vsSub').textContent = d >= 0 ? 'more destinations · ' + (B.s / A.s).toFixed(1) + '× the access' : 'fewer destinations';
      var cb = $('#vsCbi');
      if (B.cbi) { cb.hidden = false; cb.innerHTML = '<span style="font-size:16px"><strong>' + esc(B.n) + '</strong> <span style="color:#C7D1D9">is available through Citizenship by Investment, from ' + k(B.cbi.price) + '.</span></span><a href="passports.html#' + B.cbi.id + '" class="link-arrow">See the programme →</a>'; }
      else cb.hidden = true;
    }
    function renderList() {
      var mine = find(state.a), q = state.q.toLowerCase().trim();
      var rows = D.filter(function (x) { return (!q || x.n.toLowerCase().indexOf(q) >= 0) && (state.f !== 'cbi' || x.cbi); });
      var total = rows.length;
      if (!q && state.f !== 'cbi') rows = rows.slice(0, state.limit);
      list.innerHTML = rows.map(function (x) {
        var open = state.open === x.n, d = x.s - mine.s;
        var cls = 'rk-item' + (x.cbi ? ' cbi' : x.n === mine.n ? ' mine' : '');
        var vs = x.n === mine.n ? 'This is your passport: ' + x.s + ' destinations without a visa in advance.' : (d >= 0 ? d + ' more destinations than your ' + mine.n + ' passport (' + (x.s / mine.s).toFixed(1) + '× the access).' : Math.abs(d) + ' fewer destinations than your ' + mine.n + ' passport.');
        return '<div class="' + cls + '"><button type="button" class="rk-row" data-n="' + esc(x.n) + '" aria-expanded="' + open + '">' +
          '<span class="r">' + x.rank + '<sup>' + suf(x.rank) + '</sup></span>' +
          '<span class="p">' + cover(x, 'mini') + '<span style="min-width:0"><b>' + esc(x.n) + '</b>' + (x.cbi ? '<small>AVAILABLE THROUGH CBI</small>' : '') + '</span></span>' +
          '<span class="bar hide-sm"><i style="width:' + Math.round(x.s / 193 * 100) + '%"></i></span><span class="a">' + x.s + '</span></button>' +
          (open ? '<div class="rk-more"><span>' + esc(vs) + '</span>' + (x.cbi ? '<a href="passports.html#' + x.cbi.id + '" style="color:var(--gold-d);font-weight:700;text-decoration:none">Get this passport from ' + k(x.cbi.price) + ' →</a>' : '') + '<button type="button" data-cmp="' + esc(x.n) + '">Compare above</button></div>' : '') + '</div>';
      }).join('');
      $('#rkEmpty').style.display = rows.length ? 'none' : 'block';
      var more = $('#rkMore');
      if (!q && state.f !== 'cbi' && state.limit < total) { more.hidden = false; more.textContent = 'Show all ' + total + ' passports'; } else more.hidden = true;
    }
    function fillSelects() {
      var names = D.map(function (x) { return x.n; }).sort(function (a, b) { return a.localeCompare(b); });
      ['#selA', '#selB'].forEach(function (s, i) {
        var cur = i ? state.b : state.a;
        $(s).innerHTML = names.map(function (n) { return '<option' + (n === cur ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join('');
      });
    }
    ['#selA', '#selB'].forEach(function (s, i) { $(s).addEventListener('change', function (e) { state[i ? 'b' : 'a'] = e.target.value; renderVs(); renderList(); }); });
    list.addEventListener('click', function (e) {
      var c = e.target.closest('[data-cmp]');
      if (c) { state.b = c.dataset.cmp; $('#selB').value = state.b; renderVs(); $('#selB').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      var r = e.target.closest('.rk-row'); if (!r) return;
      state.open = state.open === r.dataset.n ? null : r.dataset.n; renderList();
    });
    $('#rkSearch').addEventListener('input', function (e) { state.q = e.target.value; state.open = null; renderList(); });
    $('#rkMore').addEventListener('click', function () { state.limit = 999; renderList(); });
    $$('#rkChips .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        $$('#rkChips .chip').forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        if (c.dataset.f === 'mine') { state.f = 'all'; state.q = state.a; state.open = state.a; } else { state.f = c.dataset.f; state.q = ''; state.open = null; }
        $('#rkSearch').value = state.q; renderList();
      });
    });
    onContent(function () { buildData(); fillSelects(); renderVs(); renderList(); });
  }

  /* ---------- how it works ---------- */
  function initHow() {
    var boxes = $$('.chk input'); if (!boxes.length) return;
    function upd() {
      var done = boxes.filter(function (b) { return b.checked; }).length, pct = Math.round(done / boxes.length * 100);
      $('#chkLabel').textContent = done + ' of ' + boxes.length + ' documents ready';
      $('#chkPct').textContent = pct + '%'; $('#chkBar').style.width = pct + '%';
    }
    boxes.forEach(function (b) { b.addEventListener('change', upd); }); upd();
  }

  /* ---------- faq ---------- */
  function initFaq() {
    var listBox = $('#faqList'); if (!listBox) return;
    var cur = 'All', q = '', box = $('#faqCats');
    function cats() { var s = ['All']; C.faqs.forEach(function (f) { if (s.indexOf(f.cat) < 0) s.push(f.cat); }); return s; }
    function match(f) { return !q || (f.q + ' ' + f.a + ' ' + f.cat).toLowerCase().indexOf(q) >= 0; }
    function render() {
      var list = C.faqs.filter(function (f) { return (cur === 'All' || f.cat === cur) && match(f); });
      box.innerHTML = cats().map(function (c) {
        var n = C.faqs.filter(function (f) { return (c === 'All' || f.cat === c) && match(f); }).length;
        return '<button type="button" data-c="' + esc(c) + '" aria-pressed="' + (c === cur) + '">' + esc(c) + '<span>' + n + '</span></button>';
      }).join('');
      listBox.innerHTML = list.map(function (f, i) { return '<details class="acc"' + (i === 0 && !q ? ' open' : '') + '><summary><span><span class="cat">' + esc(f.cat) + '</span>' + esc(f.q) + '</span></summary><div class="ans">' + esc(f.a) + '</div></details>'; }).join('');
      $('#faqEmpty').style.display = list.length ? 'none' : 'block';
    }
    box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { cur = b.dataset.c; render(); } });
    $('#faqSearch').addEventListener('input', function (e) { q = e.target.value.toLowerCase().trim(); render(); });
    onContent(render);
  }

  /* ---------- consultation ---------- */
  function initConsult() {
    var days = $('#days'); if (!days) return;
    var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var d = new Date(), html = '', n = 0;
    while (n < 6) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      var v = DOW[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()];
      html += '<button type="button" class="opt day" aria-pressed="' + (n === 0) + '" data-v="' + v + '"><small>' + DOW[d.getDay()] + '</small><b>' + d.getDate() + '</b><small>' + MON[d.getMonth()] + '</small></button>';
      n++;
    }
    days.innerHTML = html;
    var form = $('#bookForm');
    function sum() {
      var g = function (name) { var b = $('[data-pick="' + name + '"] [aria-pressed="true"]', form); return b ? b.dataset.v : ''; };
      $('#bookSummary').textContent = g('Meeting type') + ' · ' + g('Preferred day') + ' at ' + g('Preferred time');
    }
    form.addEventListener('pick', sum); sum();
  }

  /* ---------- properties ---------- */
  function initProperties() {
    var listEl = $('#propList'); if (!listEl) return;
    var lb = $('#lightbox'), strip = $('#lbStrip'), photos = [], idx = 0, lastFocus = null;
    function card(p, i) {
      var ph = p.photos || [], n = ph.length, badge = '<span class="badge' + (p.available ? '' : ' let') + '">' + esc(p.status) + '</span>';
      var media = n ? '<div><button type="button" class="cover-btn" data-p="' + i + '" data-open="0" aria-label="Open ' + esc(p.name) + ' photo gallery"><img src="' + esc(ph[0].src) + '" alt="' + esc(p.name + ': ' + (ph[0].caption || '')) + '">' + badge +
          '<span class="count"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/></svg>' + n + ' photo' + (n > 1 ? 's' : '') + '</span></button>' +
          (n > 1 ? '<div class="thumbs">' + ph.slice(1, 5).map(function (x, j) { return '<button type="button" data-p="' + i + '" data-open="' + (j + 1) + '" aria-label="View photo: ' + esc(x.caption) + '"><img src="' + esc(x.thumb || x.src) + '" alt="" loading="lazy"></button>'; }).join('') +
            (n > 5 ? '<button type="button" class="more" data-p="' + i + '" data-open="5">+' + (n - 5) + '</button>' : '') + '</div>' : '') + '</div>'
        : '<div class="noph">' + esc(p.name) + badge + '</div>';
      var stats = (p.stats || []).length ? '<div class="pstats">' + p.stats.map(function (s) { return '<div><small>' + esc(s.label) + '</small><b>' + esc(s.value) + '</b></div>'; }).join('') + '</div>' : '';
      var costs = (p.costs || []).length ? '<details class="costs"><summary><span>Total to move in: <em>' + esc(p.total) + '</em></span><small></small></summary><div class="cost-list">' +
        p.costs.map(function (c) { return '<div><span>' + esc(c.label) + '</span><b>' + esc(c.value) + '</b></div>'; }).join('') + (p.costNote ? '<p>' + esc(p.costNote) + '</p>' : '') + '</div></details>' : '';
      var feats = (p.features || []).length ? '<ul class="feats">' + p.features.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' : '';
      var want = p.available ? 'A private viewing' : 'To join the waiting list';
      var actions = '<div class="pactions"><a href="#enquire" class="btn btn-gold" data-prop="' + esc(p.name) + '" data-want="' + want + '">' + esc(p.cta || (p.available ? 'Book a viewing' : 'Join the waiting list')) + '</a>' +
        (p.available ? '<a href="#enquire" class="btn btn-ghost" data-prop="' + esc(p.name) + '" data-want="A video tour">Request video tour</a>' : '') + '</div>';
      return '<article class="pcard">' + media + '<div class="pbody"><div><div class="loc">' + esc(p.location) + '</div><h3>' + esc(p.name) + '</h3></div><p>' + esc(p.blurb) + '</p>' + stats + costs + feats + actions + '</div></article>';
    }
    function render() {
      listEl.innerHTML = C.properties.map(card).join('');
      var first = C.properties.filter(function (p) { return p.available; })[0] || C.properties[0];
      $('#enqProp').innerHTML = C.properties.map(function (p) { return '<button type="button" class="chip" aria-pressed="' + (first && p.name === first.name) + '" data-v="' + esc(p.name) + '">' + esc(p.name) + '</button>'; }).join('');
    }
    function go(i) {
      idx = (i + photos.length) % photos.length;
      $('#lbImg').src = photos[idx].src; $('#lbImg').alt = photos[idx].caption || '';
      $('#lbCap').textContent = (photos[idx].caption ? photos[idx].caption + ' · ' : '') + (idx + 1) + ' of ' + photos.length;
      $$('button', strip).forEach(function (b, j) { b.setAttribute('aria-current', j === idx ? 'true' : 'false'); });
      var cur = strip.children[idx]; if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
    function open(pi, i) {
      var p = C.properties[pi]; if (!p || !(p.photos || []).length) return;
      photos = p.photos; $('#lbTitle').textContent = p.name;
      strip.innerHTML = photos.map(function (x, j) { return '<button type="button" data-i="' + j + '" aria-label="Photo ' + (j + 1) + ': ' + esc(x.caption) + '"><img src="' + esc(x.thumb || x.src) + '" alt="" loading="lazy"></button>'; }).join('');
      lastFocus = document.activeElement; lb.classList.add('open'); document.body.style.overflow = 'hidden'; go(i); $('#lbClose').focus();
    }
    function close() { lb.classList.remove('open'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
    listEl.addEventListener('click', function (e) {
      var o = e.target.closest('[data-open]'); if (o) { open(+o.dataset.p, +o.dataset.open); return; }
      var a = e.target.closest('[data-prop]');
      if (a) { $$('#enqProp .chip').forEach(function (c) { c.setAttribute('aria-pressed', c.dataset.v === a.dataset.prop ? 'true' : 'false'); }); $('#enqWant').value = a.dataset.want; }
    });
    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', function () { go(idx - 1); });
    $('#lbNext').addEventListener('click', function () { go(idx + 1); });
    strip.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) go(+b.dataset.i); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') go(idx - 1); else if (e.key === 'ArrowRight') go(idx + 1);
    });
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1)); sx = null; });

    var form = $('#rqForm'), budget = $('#budget');
    var RENT = ['Under ₦10m a year', '₦10m to ₦30m a year', '₦30m to ₦70m a year', '₦70m+ a year'];
    var BUY = ['Under ₦200m', '₦200m to ₦500m', '₦500m to ₦1bn', '₦1bn+'];
    var lastMode = null;
    function upd() {
      var g = function (name) { return $$('[data-pick="' + name + '"] [aria-pressed="true"]', form).map(function (b) { return b.dataset.v; }); };
      var mode = g('Looking to')[0] || 'Rent', type = g('Property type')[0] || 'Apartment', beds = g('Bedrooms')[0] || '3', locs = g('Locations');
      if (mode !== lastMode) {
        budget.innerHTML = (mode === 'Rent' ? RENT : BUY).map(function (b) { return '<option>' + b + '</option>'; }).join('');
        $('#budgetLbl').textContent = mode === 'Rent' ? 'Annual budget' : 'Budget';
        lastMode = mode;
      }
      var what = (type === 'Land' || type === 'Commercial') ? type.toLowerCase() : beds + '-bed ' + type.toLowerCase();
      $('#rqSummary').textContent = 'Looking to ' + mode.toLowerCase() + ': ' + what + ' in ' + (locs.length ? locs.join(', ') : 'any location');
    }
    form.addEventListener('pick', upd); upd();
    onContent(render);
  }

  /* ---------- forms: save to inbox, then open WhatsApp ---------- */
  $$('form.wa-form').forEach(function (form) {
    var hp = document.createElement('input');
    hp.type = 'text'; hp.name = 'website'; hp.tabIndex = -1; hp.autocomplete = 'off'; hp.setAttribute('aria-hidden', 'true');
    hp.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
    form.appendChild(hp);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var fields = [];
      $$('[data-pick]', form).forEach(function (g) {
        var v = $$('[aria-pressed="true"]', g).map(function (b) { return b.dataset.v; });
        if (v.length) fields.push([g.dataset.pick, v.join(', ')]);
      });
      $$('input[name], select[name], textarea[name]', form).forEach(function (el) {
        if (el.name === 'website') return;
        var v = (el.value || '').trim(); if (v) fields.push([el.name, v]);
      });
      var title = form.dataset.title || 'Website enquiry';
      var text = ['*' + title + '*', ''].concat(fields.map(function (f) { return f[0] + ': ' + f[1]; })).concat(['', 'Sent from ' + location.hostname + location.pathname]).join('\n');
      var url = 'https://wa.me/' + waNumber() + '?text=' + encodeURIComponent(text);
      var w = window.open(url, '_blank', 'noopener');
      try {
        fetch('/api/enquiry', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ title: title, page: location.pathname, fields: fields, website: hp.value }) }).catch(function () {});
      } catch (err) {}
      if (!w) location.href = url;
    });
  });

  initHome(); initPassports(); initRanking(); initHow(); initFaq(); initConsult(); initProperties();

  /* ---------- load edited content ---------- */
  if (location.protocol.indexOf('http') === 0) {
    fetch('/api/content', { headers: { accept: 'application/json' } })
      .then(function (r) { return r.status === 200 ? r.json() : null; })
      .then(function (saved) { if (!saved) return; C = merge(saved); renders.forEach(function (fn) { fn(); }); })
      .catch(function () {});
  }
  window.VTA_SITE = { get content() { return C; } };
})();
