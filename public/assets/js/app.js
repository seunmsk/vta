/* VTA Global Services site script */
(function () {
  'use strict';
  var WA_NUMBER = '2348073959876';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* ---------- data ---------- */
  var IMG = 'assets/img/';
  var CBI = [
    { id: 'skn', name: 'St Kitts & Nevis', short: 'St Kitts', rankName: 'St. Kitts and Nevis', img: 'pp-stkitts.webp', est: 1984, rank: 23, dest: 155, price: 250000, re: 325000, speed: '4–6 months', speedN: 5,
      tagline: 'The original programme, and the strongest Caribbean passport, with the fastest processing.',
      about: 'St Kitts & Nevis launched the world’s first citizenship by investment programme in 1984. Four decades on, it still offers the region’s strongest passport and shortest timeline.',
      features: ['Strongest Caribbean CBI passport', 'World’s oldest programme', 'Family of 4 from $250k donation'],
      routes: [['Government fund', '$250,000', 'Non-refundable contribution for the main applicant.'], ['Approved real estate', '$325,000', 'Invest in a government-approved development. A holding period applies before resale.'], ['Public Benefit Option', '$250,000', 'Fund an approved public-benefit project.']],
      benefits: ['Visa-free or visa-on-arrival access to about 155 destinations, including the Schengen area', 'Citizenship passes to future generations', 'Commonwealth membership', 'No minimum stay, interview or language test', 'Dual citizenship permitted'],
      family: ['Spouse', 'Dependent children', 'Dependent parents and grandparents', 'Dependent siblings (age limits apply)'], stay: 'None' },
    { id: 'ant', name: 'Antigua & Barbuda', short: 'Antigua', rankName: 'Antigua and Barbuda', img: 'pp-antigua.webp', est: 2013, rank: 24, dest: 154, price: 230000, re: 300000, speed: '6–8 months', speedN: 7,
      tagline: 'One of the strongest passports in the region, with the most generous family rules.',
      about: 'Antigua & Barbuda’s programme, running since 2013, is a favourite with larger families: one fund contribution covers up to four people, and siblings can be included.',
      features: ['Best value for large families', 'Siblings can be included', '5-day visit in first 5 years'],
      routes: [['National Development Fund', '$230,000', 'Non-refundable. Covers a family of up to four.'], ['Approved real estate', '$300,000', 'Invest in a government-approved development.'], ['University of the West Indies Fund', '$260,000', 'For families of six or more.']],
      benefits: ['Visa-free or visa-on-arrival access to about 154 destinations, including the Schengen area and the UK', 'Live, work and study across CARICOM', 'No interview or language test', 'Dual citizenship permitted', 'Citizenship passes to future generations'],
      family: ['Spouse', 'Dependent children up to 30', 'Dependent parents over 55', 'Unmarried siblings of the applicant or spouse'], stay: '5 days in first 5 years' },
    { id: 'gre', name: 'Grenada', short: 'Grenada', rankName: 'Grenada', img: 'pp-grenada.webp', est: 2013, rank: 27, dest: 147, price: 235000, re: 270000, speed: '6–8 months', speedN: 7,
      tagline: 'The only Caribbean passport with a route to the US E-2 investor visa.',
      about: 'Grenada, the “Spice Isle”, has run its programme since 2013. Its treaty with the United States lets citizens apply for the E-2 investor visa to run a business in the US.',
      features: ['US E-2 treaty investor visa route', 'No minimum stay requirement', 'Includes access to China'],
      routes: [['National Transformation Fund', '$235,000', 'Non-refundable contribution for the main applicant.'], ['Approved real estate', '$270,000', 'Invest in a government-approved development.']],
      benefits: ['Eligible for the US E-2 treaty investor visa', 'Visa-free or visa-on-arrival access to about 147 destinations', 'No minimum stay, interview or language test', 'Live, work and study across CARICOM', 'Dual citizenship permitted'],
      family: ['Spouse', 'Dependent children', 'Dependent parents over 55', 'Unmarried siblings over 18 with no children'], stay: 'None' },
    { id: 'slu', name: 'Saint Lucia', short: 'Saint Lucia', rankName: 'St. Lucia', img: 'pp-stlucia.webp', est: 2015, rank: 29, dest: 145, price: 240000, re: 300000, speed: '6–9 months', speedN: 8,
      tagline: 'Flexible ways to invest, including government bonds you get back.',
      about: 'Saint Lucia launched its programme in 2015. It stands out for its range of options, including a government bond route where your capital is held rather than donated.',
      features: ['Government bond option', 'No interview or language test', 'No residency requirement'],
      routes: [['National Economic Fund', '$240,000', 'Non-refundable contribution for the main applicant.'], ['Approved real estate', '$300,000', 'Invest in a government-approved development.'], ['Government bonds', '$300,000', 'Non-interest-bearing bonds held for a fixed period.']],
      benefits: ['Visa-free or visa-on-arrival access to about 145 destinations', 'No minimum stay, interview or language test', 'Live, work and study across CARICOM', 'Dual citizenship permitted', 'Citizenship passes to future generations'],
      family: ['Spouse', 'Dependent children', 'Dependent parents over 55', 'Siblings (age limits apply)'], stay: 'None' },
    { id: 'dom', name: 'Dominica', short: 'Dominica', rankName: 'Dominica', img: 'pp-dominica.webp', est: 1993, rank: 29, dest: 145, price: 200000, re: 200000, speed: '6–9 months', speedN: 8,
      tagline: 'The most affordable route to a Caribbean passport.',
      about: 'The Commonwealth of Dominica, the “Nature Isle”, has run its programme since 1993. It has the lowest entry price in the region and a fully remote application.',
      features: ['Lowest entry price in the region', 'Fully remote application', 'Dual citizenship permitted'],
      routes: [['Economic Diversification Fund', '$200,000', 'Non-refundable contribution for the main applicant.'], ['Approved real estate', '$200,000', 'Invest in a government-approved development.']],
      benefits: ['Lowest entry price in the Caribbean', 'Visa-free or visa-on-arrival access to about 145 destinations', 'No minimum stay, interview or language test', 'Live, work and study across CARICOM', 'Dual citizenship permitted'],
      family: ['Spouse', 'Dependent children', 'Dependent parents and grandparents', 'Siblings (age limits apply)'], stay: 'None' }
  ];
  var k = function (n) { return '$' + Math.round(n / 1000) + 'k'; };
  var suf = function (r) { var t = r % 100; if (t >= 11 && t <= 13) return 'th'; return ['th', 'st', 'nd', 'rd'][r % 10] || 'th'; };

  /* ---------- common: nav ---------- */
  var burger = $('.burger'), drawer = $('#drawer');
  if (burger && drawer) burger.addEventListener('click', function () {
    var open = drawer.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- page: home ---------- */
  function initHome() {
    var wall = $('#ppWall'); if (!wall) return;
    var pickMap = { cost: 'dom', power: 'skn', speed: 'skn', e2: 'gre' };
    var priority = null, flipped = null, sort = 'rank';
    function renderWall() {
      var pick = priority ? pickMap[priority] : null;
      wall.innerHTML = CBI.map(function (p) {
        return '<div class="pp-item">' +
          '<button type="button" class="pp' + (flipped === p.id ? ' on' : '') + '" data-id="' + p.id + '" aria-label="' + esc(p.name) + ' passport: show ranking and features">' +
          '<div class="pp-inner"><div class="pp-face front"><img src="' + IMG + p.img + '" alt="" loading="lazy"><span class="pp-badge">#' + p.rank + ' globally</span>' +
          (pick === p.id ? '<span class="pp-pick">BEST MATCH</span>' : '') + '</div>' +
          '<div class="pp-face back"><div style="display:flex;justify-content:space-between;gap:8px"><div><div class="pp-k">Global rank</div><div class="pp-v">#' + p.rank + '</div></div>' +
          '<div style="text-align:right"><div class="pp-k">Visa-free</div><div class="pp-v" style="font-size:30px;line-height:1.1">' + p.dest + '</div></div></div>' +
          '<div class="pp-bar"><i style="width:' + Math.round(p.dest / 199 * 100) + '%"></i></div>' +
          '<div class="pp-mini"><div><span style="color:#5B6B78">From</span><div>' + k(p.price) + '</div></div><div><span style="color:#5B6B78">Processing</span><div>' + p.speed + '</div></div></div>' +
          '<ul class="pp-feat">' + p.features.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul></div></div></button>' +
          '<div class="pp-meta"><b>' + esc(p.name) + '</b><span>Since ' + p.est + '</span></div>' +
          '<a href="passports.html#' + p.id + '" style="font-size:13px;font-weight:600;text-decoration:none">View programme →</a></div>';
      }).join('');
    }
    function renderCmp() {
      var pick = priority ? pickMap[priority] : null;
      var rows = CBI.slice().sort(function (a, b) { return sort === 'price' ? a.price - b.price : sort === 'speed' ? a.speedN - b.speedN : a.rank - b.rank; });
      $('#cmpBody').innerHTML = rows.map(function (r) {
        return '<tr' + (pick === r.id ? ' class="hl"' : '') + '><td><span class="cname"><img src="' + IMG + r.img + '" alt="">' + esc(r.name) + '</span></td><td>#' + r.rank + '</td><td>' + r.dest + '</td><td style="font-weight:600">' + k(r.price) + '</td><td>' + k(r.re) + '</td><td>' + r.speed + '</td></tr>';
      }).join('');
    }
    wall.addEventListener('click', function (e) {
      var b = e.target.closest('.pp'); if (!b) return;
      flipped = flipped === b.dataset.id ? null : b.dataset.id; renderWall();
    });
    $$('#priorities .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        priority = priority === c.dataset.p ? null : c.dataset.p;
        $$('#priorities .chip').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.p === priority ? 'true' : 'false'); });
        renderWall(); renderCmp();
      });
    });
    $$('#sorts .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        sort = c.dataset.s;
        $$('#sorts .chip').forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        renderCmp();
      });
    });
    renderWall(); renderCmp();
  }

  /* ---------- page: passports ---------- */
  function initPassports() {
    var tabs = $('#ppTabs'); if (!tabs) return;
    tabs.innerHTML = CBI.map(function (p) {
      return '<button type="button" class="tab" role="tab" data-id="' + p.id + '" aria-selected="false"><img src="' + IMG + p.img + '" alt="">' + esc(p.name) + '</button>';
    }).join('');
    $('#cBars').innerHTML = CBI.map(function (p) {
      return '<button type="button" class="barrow" data-id="' + p.id + '" aria-label="' + esc(p.name) + ': ' + p.dest + ' destinations. Show this passport."><span class="n">' + esc(p.name) + '</span><span class="t"><i style="width:' + Math.round(p.dest / 160 * 100) + '%"></i></span><span class="v">' + p.dest + '</span></button>';
    }).join('');
    function show(id, push) {
      var c = CBI.filter(function (x) { return x.id === id; })[0] || CBI[1];
      $$('#ppTabs .tab').forEach(function (t) { t.setAttribute('aria-selected', t.dataset.id === c.id ? 'true' : 'false'); });
      $$('#cBars .barrow').forEach(function (t) { t.classList.toggle('on', t.dataset.id === c.id); });
      $('#cEyebrow').textContent = 'Citizenship by Investment · Since ' + c.est;
      $('#cName').textContent = c.name;
      $('#cTag').textContent = c.tagline;
      $('#cRank').textContent = '#' + c.rank;
      $('#cDest').textContent = c.dest;
      $('#cFrom').textContent = k(c.price);
      $('#cSpeed').textContent = c.speed.replace(' months', ' mo');
      $('#cCta').textContent = 'Talk to us about ' + c.short;
      var cov = $('#cCover'); cov.src = IMG + c.img; cov.alt = c.name + ' passport cover';
      cov.classList.remove('fade'); void cov.offsetWidth; cov.classList.add('fade');
      var ht = $('#ppHeroText'); ht.classList.remove('fade'); void ht.offsetWidth; ht.classList.add('fade');
      $('#cRoutesH').textContent = 'Ways to qualify for ' + c.short;
      $('#cAbout').textContent = c.about;
      $('#cRoutes').innerHTML = c.routes.map(function (r) { return '<div class="card-l route"><div class="lbl">' + esc(r[0]) + '</div><div class="amt">' + r[1] + '</div><p>' + esc(r[2]) + '</p></div>'; }).join('');
      $('#cBenefits').innerHTML = c.benefits.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('');
      $('#cFamily').innerHTML = c.family.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('');
      $('#cStay').textContent = c.stay;
      $('#cQuoteH').textContent = 'Get your ' + c.short + ' cost breakdown';
      $('#cQuoteBtn').textContent = 'Send my ' + c.short + ' quote request';
      $('#cHidden').value = c.name;
      document.title = c.name + ' Citizenship by Investment | VTA Global Services';
      if (push && history.replaceState) history.replaceState(null, '', '#' + c.id);
    }
    tabs.addEventListener('click', function (e) { var t = e.target.closest('.tab'); if (t) show(t.dataset.id, true); });
    $('#cBars').addEventListener('click', function (e) { var t = e.target.closest('.barrow'); if (t) { show(t.dataset.id, true); window.scrollTo({ top: 0, behavior: 'smooth' }); } });
    window.addEventListener('hashchange', function () { show(location.hash.slice(1)); window.scrollTo({ top: 0 }); });
    show(location.hash.slice(1) || 'ant');
  }

  /* ---------- page: ranking ---------- */
  var RAW = '1|Singapore|192;2|Japan|188;2|South Korea|188;3|Denmark|186;3|Luxembourg|186;3|Spain|186;3|Sweden|186;3|Switzerland|186;4|Austria|185;4|Belgium|185;4|Finland|185;4|France|185;4|Germany|185;4|Greece|185;4|Ireland|185;4|Italy|185;4|Netherlands|185;4|Norway|185;5|Hungary|184;5|Portugal|184;5|Slovakia|184;5|Slovenia|184;5|United Arab Emirates|184;6|Croatia|183;6|Czechia|183;6|Estonia|183;6|Malta|183;6|New Zealand|183;6|Poland|183;7|Australia|182;7|Latvia|182;7|Liechtenstein|182;7|United Kingdom|182;8|Canada|181;8|Iceland|181;8|Lithuania|181;9|Malaysia|180;10|United States|179;11|Bulgaria|178;11|Romania|178;12|Monaco|177;13|Chile|175;14|Cyprus|174;15|Andorra|171;15|Hong Kong (SAR China)|171;16|Argentina|169;16|Brazil|169;17|San Marino|168;18|Israel|165;19|Barbados|162;19|Brunei|162;20|The Bahamas|158;21|Mexico|157;22|St. Vincent and the Grenadines|156;22|Uruguay|156;23|St. Kitts and Nevis|155;24|Antigua and Barbuda|154;24|Seychelles|154;25|Vatican City|152;26|Costa Rica|148;26|Panama|148;27|Grenada|147;27|Mauritius|147;28|Trinidad and Tobago|146;29|Dominica|145;29|Paraguay|145;29|St. Lucia|145;30|Ukraine|143;31|Peru|142;32|Macao (SAR China)|141;33|Taiwan (Chinese Taipei)|139;34|Serbia|136;35|El Salvador|132;35|Guatemala|132;36|Solomon Islands|131;37|Colombia|130;37|Honduras|130;38|Marshall Islands|128;38|Montenegro|128;38|North Macedonia|128;38|Samoa|128;39|Tonga|127;40|Nicaragua|125;41|Tuvalu|124;42|Bosnia and Herzegovina|122;42|Georgia|122;42|Kiribati|122;43|Albania|121;43|Micronesia|121;43|Palau Islands|121;44|Moldova|120;45|Venezuela|118;46|Russian Federation|113;46|Türkiye|113;47|Qatar|111;48|South Africa|101;49|Belize|99;50|Kuwait|96;51|Ecuador|94;51|Timor-Leste|94;52|Maldives|92;53|Vanuatu|89;54|Fiji|88;54|Guyana|88;54|Saudi Arabia|88;55|Bahrain|87;56|Jamaica|86;57|Nauru|85;57|Oman|85;58|Papua New Guinea|83;59|Botswana|81;59|China|81;59|Kosovo|81;60|Belarus|79;60|Thailand|79;61|Bolivia|78;61|Kazakhstan|78;61|Suriname|78;62|Namibia|76;63|Lesotho|74;64|Indonesia|73;65|Dominican Republic|72;65|Morocco|72;65|eSwatini|72;66|Malawi|71;67|Azerbaijan|70;68|Kenya|69;68|The Gambia|69;69|Ghana|68;69|Tanzania|68;70|Benin|67;70|Rwanda|67;70|Tunisia|67;71|Armenia|66;71|Uganda|66;72|Cape Verde Islands|65;72|Zambia|65;73|Mongolia|64;73|Philippines|64;74|Sierra Leone|62;74|Zimbabwe|62;75|Kyrgyzstan|61;75|Uzbekistan|61;76|Mozambique|60;76|São Tomé and Príncipe|60;77|Cuba|58;77|Togo|58;78|Burkina Faso|57;78|Côte d\'Ivoire|57;78|Gabon|57;78|Madagascar|57;78|Senegal|57;79|Mauritania|56;80|Algeria|55;80|India|55;80|Niger|55;81|Equatorial Guinea|54;81|Guinea|54;81|Tajikistan|54;82|Mali|53;83|Chad|52;83|Guinea-Bissau|52;84|Comoro Islands|51;84|Jordan|51;85|Bhutan|50;85|Cambodia|50;85|Egypt|50;85|Haiti|50;86|Angola|49;86|Burundi|49;86|Central African Republic|49;86|Liberia|49;86|Vietnam|49;87|Cameroon|47;87|Congo (Rep.)|47;87|Laos|47;87|Turkmenistan|47;88|Djibouti|46;89|Myanmar|44;89|Nigeria|44;90|Congo (Dem. Rep.)|43;90|Ethiopia|43;90|Lebanon|43;91|South Sudan|41;91|Sudan|41;92|Iran|40;93|Libya|39;93|Sri Lanka|39;94|Eritrea|38;94|North Korea|38;94|Palestinian Territory|38;95|Bangladesh|37;96|Nepal|35;97|Somalia|33;98|Pakistan|31;98|Yemen|31;99|Iraq|29;100|Syria|26;101|Afghanistan|24';
  function initRanking() {
    var list = $('#rkList'); if (!list) return;
    var IMGS = { 'St. Kitts and Nevis': 'pp-stkitts.webp', 'Antigua and Barbuda': 'pp-antigua.webp', 'Grenada': 'pp-grenada.webp', 'St. Lucia': 'pp-stlucia.webp', 'Dominica': 'pp-dominica.webp', 'Nigeria': 'pp-nigeria.webp', 'South Korea': 'pp-southkorea.webp', 'Singapore': 'pp-singapore.webp', 'Japan': 'pp-japan.webp' };
    var CBIMAP = {}; CBI.forEach(function (c) { CBIMAP[c.rankName] = c; });
    var BLUE = ['United States', 'Canada', 'Australia', 'Brazil', 'Argentina', 'Uruguay', 'Paraguay', 'United Kingdom', 'Barbados', 'The Bahamas', 'St. Vincent and the Grenadines', 'Trinidad and Tobago', 'Jamaica', 'Belize', 'Guyana', 'Suriname'];
    var GREEN = ['Saudi Arabia', 'Pakistan', 'Bangladesh', 'Algeria', 'Niger', 'Senegal'];
    var RED = ['Switzerland'];
    var col = function (n) { return BLUE.indexOf(n) >= 0 ? ['#1B3F78', '#0C2448'] : GREEN.indexOf(n) >= 0 ? ['#1F5A3A', '#0E3020'] : RED.indexOf(n) >= 0 ? ['#B3262E', '#7A141B'] : n === 'New Zealand' ? ['#2A2A2E', '#111114'] : ['#7A1F2B', '#4A0F18']; };
    var D = RAW.split(';').map(function (l) { var p = l.split('|'); return { rank: +p[0], n: p[1], s: +p[2], img: IMGS[p[1]] || '', cbi: CBIMAP[p[1]] || null, c: col(p[1]) }; });
    var find = function (n) { return D.filter(function (x) { return x.n === n; })[0] || D[0]; };
    var state = { a: 'Nigeria', b: 'St. Kitts and Nevis', q: '', f: 'all', limit: 25, open: null };
    var cover = function (x, cls, w, h) {
      return x.img ? '<img class="' + cls + '" src="' + IMG + x.img + '" alt="" loading="lazy"' + (w ? ' style="width:' + w + 'px;height:' + h + 'px"' : '') + '>'
        : '<span class="' + cls + '" aria-hidden="true" style="background:linear-gradient(160deg,' + x.c[0] + ',' + x.c[1] + ');border:1px solid rgba(216,180,106,.45)' + (w ? ';width:' + w + 'px;height:' + h + 'px' : '') + '"></span>';
    };
    var names = D.map(function (x) { return x.n; }).sort(function (a, b) { return a.localeCompare(b); });
    ['#selA', '#selB'].forEach(function (s, i) {
      var el = $(s), cur = i ? state.b : state.a;
      el.innerHTML = names.map(function (n) { return '<option' + (n === cur ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join('');
      el.addEventListener('change', function () { state[i ? 'b' : 'a'] = el.value; renderVs(); renderList(); });
    });
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
        if (c.dataset.f === 'mine') { state.f = 'all'; state.q = state.a; state.open = state.a; }
        else { state.f = c.dataset.f; state.q = ''; state.open = null; }
        $('#rkSearch').value = state.q; renderList();
      });
    });
    renderVs(); renderList();
  }

  /* ---------- page: how it works ---------- */
  function initHow() {
    var boxes = $$('.chk input'); if (!boxes.length) return;
    function upd() {
      var done = boxes.filter(function (b) { return b.checked; }).length, pct = Math.round(done / boxes.length * 100);
      $('#chkLabel').textContent = done + ' of ' + boxes.length + ' documents ready';
      $('#chkPct').textContent = pct + '%'; $('#chkBar').style.width = pct + '%';
    }
    boxes.forEach(function (b) { b.addEventListener('change', upd); }); upd();
  }

  /* ---------- page: faq ---------- */
  function initFaq() {
    var items = $$('#faqList details'); if (!items.length) return;
    var cats = ['All', 'The basics', 'Family', 'Costs', 'Process', 'Living & travel'], cur = 'All', q = '';
    var box = $('#faqCats');
    function match(d) { return !q || d.textContent.toLowerCase().indexOf(q) >= 0; }
    function render() {
      box.innerHTML = cats.map(function (c) {
        var n = items.filter(function (d) { return (c === 'All' || d.dataset.cat === c) && match(d); }).length;
        return '<button type="button" data-c="' + esc(c) + '" aria-pressed="' + (c === cur) + '">' + esc(c) + '<span>' + n + '</span></button>';
      }).join('');
      var shown = 0;
      items.forEach(function (d) { var ok = (cur === 'All' || d.dataset.cat === cur) && match(d); d.hidden = !ok; if (ok) shown++; });
      $('#faqEmpty').style.display = shown ? 'none' : 'block';
    }
    box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { cur = b.dataset.c; render(); } });
    $('#faqSearch').addEventListener('input', function (e) { q = e.target.value.toLowerCase().trim(); render(); });
    render();
  }

  /* ---------- page: consultation ---------- */
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
    form.addEventListener('pick', sum); setTimeout(sum, 0);
  }

  /* ---------- page: properties ---------- */
  function initProperties() {
    var lb = $('#lightbox'); if (!lb) return;
    var caps = ['Building, pool and forecourt', 'Living room', 'Living and dining', 'Fitted kitchen', 'Kitchen', 'Bedroom with bay window', 'Bedroom with en-suite', 'Bedroom with fitted wardrobes', 'En-suite bathroom', 'Bathroom with walk-in shower', 'Bathroom'];
    var photos = caps.map(function (c, i) { var n = ('0' + (i + 1)).slice(-2); return { src: IMG + 'metave-' + n + '.webp', t: IMG + 'metave-' + n + '-t.webp', c: c }; });
    var idx = 0, lastFocus = null;
    var strip = $('#lbStrip');
    strip.innerHTML = photos.map(function (p, i) { return '<button type="button" data-i="' + i + '" aria-label="Photo ' + (i + 1) + ': ' + esc(p.c) + '"><img src="' + p.t + '" alt="" loading="lazy"></button>'; }).join('');
    function go(i) {
      idx = (i + photos.length) % photos.length;
      $('#lbImg').src = photos[idx].src; $('#lbImg').alt = photos[idx].c;
      $('#lbCap').textContent = photos[idx].c + ' · ' + (idx + 1) + ' of ' + photos.length;
      $$('button', strip).forEach(function (b, j) { b.setAttribute('aria-current', j === idx ? 'true' : 'false'); });
      var cur = strip.children[idx]; if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
    function open(i) { lastFocus = document.activeElement; lb.classList.add('open'); document.body.style.overflow = 'hidden'; go(i); $('#lbClose').focus(); }
    function close() { lb.classList.remove('open'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
    $$('[data-open]').forEach(function (b) { b.addEventListener('click', function () { open(+b.dataset.open); }); });
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

    // enquiry prefill
    $$('[data-prop]').forEach(function (a) {
      a.addEventListener('click', function () {
        $$('#enqProp .chip').forEach(function (c) { c.setAttribute('aria-pressed', c.dataset.v === a.dataset.prop ? 'true' : 'false'); });
        $('#enqWant').value = a.dataset.want;
      });
    });

    // requirements
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
  }

  /* ---------- common: pick groups (chips / options) ---------- */
  $$('[data-pick]').forEach(function (group) {
    var multi = group.hasAttribute('data-multi');
    group.addEventListener('click', function (e) {
      var b = e.target.closest('[data-v]'); if (!b || !group.contains(b)) return;
      if (multi) b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      else $$('[data-v]', group).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      group.dispatchEvent(new CustomEvent('pick', { bubbles: true }));
    });
  });

  /* ---------- common: WhatsApp forms ---------- */
  $$('form.wa-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var lines = ['*' + (form.dataset.title || 'Website enquiry') + '*', ''];
      $$('[data-pick]', form).forEach(function (g) {
        var v = $$('[aria-pressed="true"]', g).map(function (b) { return b.dataset.v; });
        if (v.length) lines.push(g.dataset.pick + ': ' + v.join(', '));
      });
      $$('input[name], select[name], textarea[name]', form).forEach(function (el) {
        var v = (el.value || '').trim(); if (v) lines.push(el.name + ': ' + v);
      });
      lines.push('', 'Sent from ' + location.hostname + location.pathname);
      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      var w = window.open(url, '_blank', 'noopener');
      if (!w) location.href = url;
    });
  });

  initHome(); initPassports(); initRanking(); initHow(); initFaq(); initConsult(); initProperties();
})();
