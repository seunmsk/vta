/* VTA dashboard */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  var DEF = window.VTA_DEFAULTS;
  var S = { content: null, saved: '', savedAt: null, enquiries: [], comments: [], tab: 'enquiries', enqFilter: 'all', enqQuery: '', cmtFilter: 'open' };

  /* ---------- api ---------- */
  function api(path, opts) {
    opts = opts || {};
    var init = { method: opts.method || 'GET', headers: {} };
    if (opts.body !== undefined) {
      if (opts.body instanceof FormData) init.body = opts.body;
      else { init.body = JSON.stringify(opts.body); init.headers['content-type'] = 'application/json'; }
    }
    return fetch(path, init).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (r.status === 401 && path.indexOf('/api/admin') === 0) { showLogin(); throw new Error('Signed out'); }
        if (!r.ok) throw new Error(d.error || ('Error ' + r.status));
        return d;
      });
    });
  }
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('show'); }, 2600); }
  function fail(e) { toast(e.message || 'Something went wrong'); }

  /* ---------- auth ---------- */
  function showLogin() { $('#app').hidden = true; $('#login').hidden = false; setTimeout(function () { $('#pw').focus(); }, 50); }
  $('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    $('#loginErr').textContent = '';
    api('/api/login', { method: 'POST', body: { password: $('#pw').value } })
      .then(function () { $('#pw').value = ''; start(); })
      .catch(function (err) { $('#loginErr').textContent = err.message; });
  });
  $('#logout').addEventListener('click', function () {
    if (dirty() && !confirm('You have unpublished changes. Sign out anyway?')) return;
    api('/api/logout', { method: 'POST' }).finally(function () { location.reload(); });
  });

  /* ---------- content state ---------- */
  function mergeDefaults(saved) {
    var out = clone(DEF);
    if (!saved) return out;
    if (saved.settings) out.settings = Object.assign(out.settings, saved.settings);
    if (Array.isArray(saved.passports)) out.passports = out.passports.map(function (p) {
      var s = saved.passports.filter(function (x) { return x && x.id === p.id; })[0]; return s ? Object.assign({}, p, s) : p;
    });
    if (Array.isArray(saved.properties)) out.properties = saved.properties;
    if (Array.isArray(saved.faqs)) out.faqs = saved.faqs;
    return out;
  }
  function dirty() { return S.content && JSON.stringify(S.content) !== S.saved; }
  function markDirty() { $('#savebar').hidden = !dirty(); }
  function getPath(path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, S.content); }
  function setPath(path, val) {
    var ks = path.split('.'), o = S.content;
    for (var i = 0; i < ks.length - 1; i++) o = o[ks[i]];
    o[ks[ks.length - 1]] = val;
  }
  window.addEventListener('beforeunload', function (e) { if (dirty()) { e.preventDefault(); e.returnValue = ''; } });

  $('#publish').addEventListener('click', function () {
    var b = this; b.disabled = true; b.textContent = 'Publishing…';
    api('/api/admin/content', { method: 'PUT', body: S.content })
      .then(function (d) { S.saved = JSON.stringify(S.content); S.savedAt = d.savedAt; markDirty(); toast('Published. The site updates within a minute.'); })
      .catch(fail).finally(function () { b.disabled = false; b.textContent = 'Publish changes'; });
  });
  $('#discard').addEventListener('click', function () {
    if (!confirm('Discard all unpublished changes?')) return;
    S.content = JSON.parse(S.saved); markDirty(); render();
  });

  /* ---------- generic field binding ---------- */
  document.addEventListener('input', function (e) {
    var el = e.target, path = el.getAttribute && el.getAttribute('data-k'); if (!path) return;
    var v;
    if (el.type === 'checkbox') v = el.checked;
    else if (el.hasAttribute('data-num')) v = el.value === '' ? '' : Number(el.value);
    else if (el.hasAttribute('data-lines')) v = el.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
    else v = el.value;
    setPath(path, v); markDirty();
    if (el.hasAttribute('data-title')) { var h = el.closest('.card').querySelector('[data-titleout]'); if (h) h.textContent = el.value || 'Untitled'; }
  });
  document.addEventListener('change', function (e) { if (e.target.type === 'checkbox' && e.target.getAttribute('data-k')) e.target.dispatchEvent(new Event('input', { bubbles: true })); });

  function inp(label, path, opt) {
    opt = opt || {}; var v = getPath(path);
    var attrs = 'data-k="' + path + '"' + (opt.num ? ' data-num type="number"' : ' type="text"') + (opt.title ? ' data-title' : '') + (opt.ph ? ' placeholder="' + esc(opt.ph) + '"' : '') + (opt.list ? ' list="' + opt.list + '"' : '');
    return '<label class="field">' + esc(label) + (opt.hint ? ' <small>' + esc(opt.hint) + '</small>' : '') + '<input ' + attrs + ' value="' + esc(v) + '"></label>';
  }
  function area(label, path, opt) {
    opt = opt || {}; var v = getPath(path);
    if (opt.lines) v = (v || []).join('\n');
    return '<label class="field">' + esc(label) + (opt.hint ? ' <small>' + esc(opt.hint) + '</small>' : '') + '<textarea data-k="' + path + '"' + (opt.lines ? ' data-lines' : '') + ' rows="' + (opt.rows || 3) + '">' + esc(v) + '</textarea></label>';
  }
  function check(label, path) { return '<label class="check"><input type="checkbox" data-k="' + path + '"' + (getPath(path) ? ' checked' : '') + '>' + esc(label) + '</label>'; }
  function pairs(path, cols) {
    var arr = getPath(path) || [];
    var rows = arr.map(function (row, i) {
      return '<div class="pair' + (cols.length === 3 ? ' three' : '') + '">' + cols.map(function (c) {
        return '<input type="text" aria-label="' + esc(c.label) + '" placeholder="' + esc(c.label) + '" data-k="' + path + '.' + i + '.' + c.key + '" value="' + esc(row[c.key]) + '">';
      }).join('') + '<button type="button" class="x" data-act="rm" data-path="' + path + '" data-i="' + i + '" aria-label="Remove row">×</button></div>';
    }).join('');
    var blank = {}; cols.forEach(function (c) { blank[c.key] = ''; });
    return '<div class="pairs">' + rows + '</div><button type="button" class="btn sm" style="margin-top:8px" data-act="add" data-path="' + path + '" data-blank=\'' + esc(JSON.stringify(blank)) + '\'>+ Add row</button>';
  }

  /* ---------- structural actions ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.dataset.act, path = b.dataset.path, i = Number(b.dataset.i), arr = path ? getPath(path) : null;
    if (act === 'rm') { if (b.dataset.confirm && !confirm(b.dataset.confirm)) return; arr.splice(i, 1); }
    else if (act === 'add') arr.push(JSON.parse(b.dataset.blank));
    else if (act === 'up' && i > 0) { var t = arr[i - 1]; arr[i - 1] = arr[i]; arr[i] = t; }
    else if (act === 'down' && i < arr.length - 1) { var t2 = arr[i + 1]; arr[i + 1] = arr[i]; arr[i] = t2; }
    else return;
    markDirty(); render(b.dataset.keep);
  });
  function mover(path, i, len, label) {
    return '<span class="move"><button type="button" class="btn sm" data-act="up" data-path="' + path + '" data-i="' + i + '"' + (i === 0 ? ' disabled' : '') + ' aria-label="Move ' + esc(label) + ' up">↑</button>' +
      '<button type="button" class="btn sm" data-act="down" data-path="' + path + '" data-i="' + i + '"' + (i === len - 1 ? ' disabled' : '') + ' aria-label="Move ' + esc(label) + ' down">↓</button></span>';
  }

  /* ---------- views ---------- */
  var VIEWS = {};
  function render(keepOpen) {
    var open = $$('details.collapse[open]').map(function (d) { return d.dataset.key; });
    $$('.tabs button').forEach(function (b) { b.setAttribute('aria-current', b.dataset.tab === S.tab ? 'true' : 'false'); });
    $('#view').innerHTML = VIEWS[S.tab]();
    open.forEach(function (k) { var d = $('details.collapse[data-key="' + k + '"]'); if (d) d.open = true; });
    if (keepOpen) { var d = $('details.collapse[data-key="' + keepOpen + '"]'); if (d) d.open = true; }
    counts();
  }
  function counts() {
    var n = S.enquiries.filter(function (x) { return x.status === 'new'; }).length, c = S.comments.filter(function (x) { return x.status !== 'resolved'; }).length;
    $('#newCount').hidden = !n; $('#newCount').textContent = n;
    $('#openCount').hidden = !c; $('#openCount').textContent = c;
  }
  $$('.tabs button').forEach(function (b) { b.addEventListener('click', function () { location.hash = b.dataset.tab; }); });
  function refreshLive() {
    if (S.tab === 'enquiries') return loadEnquiries().then(function () { if (S.tab === 'enquiries' && !document.activeElement.matches('textarea,select,input')) render(); }).catch(function () {});
    if (S.tab === 'comments') return loadComments().then(function () { if (S.tab === 'comments') render(); }).catch(function () {});
  }
  window.addEventListener('hashchange', function () { var t = location.hash.slice(1); if (VIEWS[t]) { S.tab = t; render(); window.scrollTo(0, 0); refreshLive(); } });
  setInterval(function () { if (!$('#app').hidden && document.visibilityState === 'visible') refreshLive(); }, 30000);
  var fmt = function (iso) { try { return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) { return iso; } };

  /* enquiries */
  VIEWS.enquiries = function () {
    var q = S.enqQuery.toLowerCase();
    var rows = S.enquiries.filter(function (r) {
      return (S.enqFilter === 'all' || r.status === S.enqFilter) && (!q || JSON.stringify(r).toLowerCase().indexOf(q) >= 0);
    });
    var f = function (v, l) { return '<button type="button" class="btn sm' + (S.enqFilter === v ? ' primary' : '') + '" data-enqf="' + v + '">' + l + '</button>'; };
    var head = '<div class="head"><div><h1>Enquiries</h1><p>Every form sent from the website. The visitor is also taken to WhatsApp to message you directly.</p></div>' +
      '<div class="tools">' + f('all', 'All') + f('new', 'New') + f('contacted', 'Contacted') + f('closed', 'Closed') +
      '<input type="search" id="enqQ" placeholder="Search" value="' + esc(S.enqQuery) + '" style="width:180px"><button type="button" class="btn sm" id="enqCsv">Export CSV</button><button type="button" class="btn sm" id="enqRefresh">Refresh</button></div></div>';
    if (!rows.length) return head + '<div class="empty">' + (S.enquiries.length ? 'No enquiries match this filter.' : 'No enquiries yet. They appear here as soon as someone submits a form on the site.') + '</div>';
    return head + '<div class="tbl-wrap"><table class="list"><thead><tr><th>Received</th><th>Enquiry</th><th>Status</th><th>Notes</th><th></th></tr></thead><tbody>' + rows.map(function (r) {
      var wa = String(r.whatsapp || '').replace(/[^\d]/g, '');
      var details = (r.fields || []).filter(function (x) { return ['Name', 'WhatsApp', 'Email'].indexOf(x[0]) < 0; }).map(function (x) { return '<div><b>' + esc(x[0]) + ':</b> ' + esc(x[1]) + '</div>'; }).join('');
      return '<tr class="' + (r.status === 'new' ? 'new' : '') + '"><td style="white-space:nowrap">' + esc(fmt(r.created)) + '<div class="kv">' + esc(r.page || '') + (r.country ? ' · ' + esc(r.country) : '') + '</div></td>' +
        '<td><b>' + esc(r.type) + '</b><div style="margin-top:4px">' + esc(r.name) + (wa ? ' · <a href="https://wa.me/' + wa + '" target="_blank" rel="noopener">WhatsApp ' + esc(r.whatsapp) + '</a>' : '') + (r.email ? ' · <a href="mailto:' + esc(r.email) + '">' + esc(r.email) + '</a>' : '') + '</div><div class="kv">' + details + '</div></td>' +
        '<td><select data-enq="' + esc(r.id) + '" data-field="status" aria-label="Status">' + ['new', 'contacted', 'closed'].map(function (s) { return '<option' + (r.status === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></td>' +
        '<td style="min-width:200px"><textarea rows="2" data-enq="' + esc(r.id) + '" data-field="note" placeholder="Add a note">' + esc(r.note) + '</textarea></td>' +
        '<td><button type="button" class="x" data-enqdel="' + esc(r.id) + '" aria-label="Delete enquiry">×</button></td></tr>';
    }).join('') + '</tbody></table></div>';
  };

  /* comments */
  VIEWS.comments = function () {
    var rows = S.comments.filter(function (c) { return S.cmtFilter === 'all' || (S.cmtFilter === 'open' ? c.status !== 'resolved' : c.status === 'resolved'); });
    var f = function (v, l) { return '<button type="button" class="btn sm' + (S.cmtFilter === v ? ' primary' : '') + '" data-cmtf="' + v + '">' + l + '</button>'; };
    var head = '<div class="head"><div><h1>Comments</h1><p>Notes left on the site itself. Open any page while signed in and use the <b>Comment</b> button at the bottom left.</p></div>' +
      '<div class="tools">' + f('open', 'Open') + f('resolved', 'Resolved') + f('all', 'All') + '<button type="button" class="btn sm gold" id="cmtCopy">Copy open comments for Claude</button><button type="button" class="btn sm" id="cmtRefresh">Refresh</button></div></div>';
    var tip = '<div class="banner info">To hand comments to Claude: click <b>Copy open comments for Claude</b>, paste them into your chat, and ask for the changes. Mark them resolved here once done.</div>';
    if (!rows.length) return head + tip + '<div class="empty">' + (S.comments.length ? 'Nothing in this filter.' : 'No comments yet. Visit the site while signed in and click Comment.') + '</div>';
    var pages = {}; rows.forEach(function (c) { (pages[c.page] = pages[c.page] || []).push(c); });
    return head + tip + Object.keys(pages).map(function (pg) {
      return '<div class="card"><div class="row-head"><h3>' + esc(pg) + '</h3><a class="btn sm" href="' + esc(pg) + '" target="_blank" rel="noopener">Open page ↗</a></div>' + pages[pg].map(function (c) {
        var n = S.comments.filter(function (x) { return x.page === c.page; }).slice().reverse().indexOf(c) + 1;
        return '<div class="cmt' + (c.status === 'resolved' ? ' resolved' : '') + '" style="padding:12px 0;border-top:1px solid #EEF1F3"><span class="num">' + n + '</span><div><div class="text">' + esc(c.comment) + '</div><div class="meta">On “' + esc(c.snippet) + '” · ' + esc(fmt(c.created)) + (c.vw ? ' · ' + (c.vw < 700 ? 'phone' : c.vw < 1100 ? 'tablet' : 'desktop') + ' view' : '') + '</div></div>' +
          '<div class="actions"><a class="btn sm" href="' + esc(c.page) + '?comment=' + encodeURIComponent(c.id) + '" target="_blank" rel="noopener">View on page</a><button type="button" class="btn sm" data-cmttoggle="' + esc(c.id) + '">' + (c.status === 'resolved' ? 'Reopen' : 'Resolve') + '</button><button type="button" class="x" data-cmtdel="' + esc(c.id) + '" aria-label="Delete comment">×</button></div></div>';
      }).join('') + '</div>';
    }).join('');
  };

  /* properties */
  VIEWS.properties = function () {
    var P = S.content.properties;
    var blank = { id: 'p' + Date.now().toString(36), name: 'New property', location: '', available: true, status: 'For rent', cta: 'Book a viewing', summary: '', blurb: '', stats: [{ label: 'Type', value: '' }, { label: 'Price', value: '' }, { label: 'Status', value: '' }], costs: [], total: '', costNote: '', features: [], photos: [] };
    return '<div class="head"><div><h1>Properties</h1><p>Listings on the Properties page. The first two also show on the homepage.</p></div><div class="tools"><button type="button" class="btn primary" data-act="add" data-path="properties" data-blank=\'' + esc(JSON.stringify(blank)) + '\'>+ Add property</button></div></div>' +
      (P.length ? '' : '<div class="empty">No properties. Add one to show it on the site.</div>') +
      P.map(function (p, i) {
        var b = 'properties.' + i;
        return '<details class="card collapse" data-key="prop-' + esc(p.id) + '"><summary><h3 data-titleout>' + esc(p.name || 'Untitled') + '</h3><span class="tools">' + (p.available ? '<span class="status open">' + esc(p.status) + '</span>' : '<span class="status closed">' + esc(p.status) + '</span>') + mover('properties', i, P.length, p.name) + '</span></summary>' +
          '<div class="grid" style="margin-top:16px">' + inp('Name', b + '.name', { title: true }) + inp('Location', b + '.location') + inp('Status badge', b + '.status', { hint: 'e.g. For rent, For sale, Fully let' }) + inp('Main button', b + '.cta', { hint: 'e.g. Book a viewing' }) + '</div>' +
          '<div style="margin:12px 0">' + check('Available (unticked shows it as let, with a waiting-list button)', b + '.available') + '</div>' +
          inp('Homepage line', b + '.summary', { hint: 'shown under the name on the homepage' }) + '<div style="height:12px"></div>' +
          area('Description', b + '.blurb', { rows: 4 }) +
          '<div class="sub">Key facts (3 boxes)</div>' + pairs(b + '.stats', [{ key: 'label', label: 'Label' }, { key: 'value', label: 'Value' }]) +
          '<div class="sub">Cost breakdown <small style="text-transform:none;font-weight:400">(leave empty to hide)</small></div>' + pairs(b + '.costs', [{ key: 'label', label: 'Item' }, { key: 'value', label: 'Amount' }]) +
          '<div class="grid" style="margin-top:10px">' + inp('Total to move in', b + '.total') + inp('Note under breakdown', b + '.costNote') + '</div>' +
          '<div class="sub">Features</div>' + area('One per line', b + '.features', { lines: true, rows: 5 }) +
          '<div class="sub">Photos <small style="text-transform:none;font-weight:400">(first photo is the cover)</small></div>' +
          '<div class="photos">' + (p.photos || []).map(function (ph, j) {
            var pp = b + '.photos';
            return '<div class="photo"><img src="' + esc(ph.thumb || ph.src) + '" alt=""><div class="ctl"><input type="text" placeholder="Caption" aria-label="Caption" data-k="' + pp + '.' + j + '.caption" value="' + esc(ph.caption) + '">' +
              '<div class="btns"><button type="button" data-act="up" data-path="' + pp + '" data-i="' + j + '" data-keep="prop-' + esc(p.id) + '" aria-label="Move left">←</button><button type="button" data-act="down" data-path="' + pp + '" data-i="' + j + '" data-keep="prop-' + esc(p.id) + '" aria-label="Move right">→</button><button type="button" data-act="rm" data-path="' + pp + '" data-i="' + j + '" data-keep="prop-' + esc(p.id) + '" aria-label="Remove photo">✕</button></div></div></div>';
          }).join('') + '<label class="upload">+ Add photos<br><small style="font-weight:400">JPG, PNG or WebP</small><input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden data-upload="' + i + '"></label></div>' +
          '<div style="display:flex;justify-content:flex-end;margin-top:18px"><button type="button" class="btn danger" data-act="rm" data-path="properties" data-i="' + i + '" data-confirm="Delete ' + esc(p.name) + '? This removes it from the site when you publish.">Delete property</button></div></details>';
      }).join('');
  };

  /* passports */
  VIEWS.passports = function () {
    return '<div class="head"><div><h1>Passports</h1><p>The five Caribbean programmes. Changes show on the homepage, Passports page and Passport Ranking.</p></div></div>' +
      S.content.passports.map(function (p, i) {
        var b = 'passports.' + i;
        return '<details class="card collapse" data-key="pp-' + p.id + '"><summary><h3>' + esc(p.name) + '</h3><span class="tools"><span class="status open">#' + esc(p.rank) + ' · ' + esc(p.dest) + ' destinations</span></span></summary>' +
          '<div class="grid" style="margin-top:16px">' + inp('Global rank', b + '.rank', { num: true }) + inp('Visa-free destinations', b + '.dest', { num: true }) + inp('Donation from (US$)', b + '.price', { num: true }) + inp('Real estate from (US$)', b + '.re', { num: true }) +
          inp('Processing time', b + '.speed', { hint: 'e.g. 4–6 months' }) + inp('Speed for sorting', b + '.speedN', { num: true, hint: 'months, lower is faster' }) + inp('Programme since', b + '.est', { num: true }) + inp('Minimum stay', b + '.stay') + '</div><div style="height:12px"></div>' +
          area('Tagline', b + '.tagline', { rows: 2 }) + '<div style="height:12px"></div>' + area('About', b + '.about', { rows: 3 }) +
          '<div class="sub">Investment options</div>' + pairs(b + '.routes', [{ key: 'label', label: 'Name' }, { key: 'amount', label: 'Amount' }, { key: 'note', label: 'Note' }]) +
          '<div class="grid" style="margin-top:14px">' + area('Card highlights (3, one per line)', b + '.features', { lines: true, rows: 4 }) + area('What you get (one per line)', b + '.benefits', { lines: true, rows: 6 }) + area('Who you can include (one per line)', b + '.family', { lines: true, rows: 5 }) + '</div></details>';
      }).join('');
  };

  /* faqs */
  VIEWS.faqs = function () {
    var F = S.content.faqs, cats = {};
    F.forEach(function (f) { if (f.cat) cats[f.cat] = 1; });
    return '<div class="head"><div><h1>FAQs</h1><p>Questions on the FAQ page. Tick “Show on homepage” for the ones in the homepage section.</p></div><div class="tools"><button type="button" class="btn primary" data-act="add" data-path="faqs" data-blank=\'' + esc(JSON.stringify({ cat: 'The basics', home: false, q: '', a: '' })) + '\'>+ Add question</button></div></div>' +
      '<datalist id="faqCats">' + Object.keys(cats).map(function (c) { return '<option value="' + esc(c) + '">'; }).join('') + '</datalist>' +
      F.map(function (f, i) {
        var b = 'faqs.' + i;
        return '<div class="card"><div class="row-head"><b>#' + (i + 1) + '</b><span class="tools">' + check('Show on homepage', b + '.home') + mover('faqs', i, F.length, 'question') + '<button type="button" class="x" data-act="rm" data-path="faqs" data-i="' + i + '" data-confirm="Delete this question?" aria-label="Delete question">×</button></span></div>' +
          '<div class="grid" style="grid-template-columns:1fr 2fr">' + inp('Topic', b + '.cat', { list: 'faqCats' }) + inp('Question', b + '.q') + '</div><div style="height:10px"></div>' + area('Answer', b + '.a', { rows: 3 }) + '</div>';
      }).join('');
  };

  /* settings */
  VIEWS.settings = function () {
    return '<div class="head"><div><h1>Settings</h1><p>Site-wide details.</p></div></div>' +
      '<div class="card"><div class="grid">' + inp('WhatsApp number for forms', 'settings.whatsapp', { hint: 'international format, digits only, e.g. 2348073959876' }) + '</div></div>' +
      '<div class="card"><h3>Backups</h3><p style="color:var(--ink3)">Last published: ' + (S.savedAt ? esc(fmt(S.savedAt)) : 'never (the site is using its built-in content)') + '</p>' +
      '<div class="tools"><button type="button" class="btn" id="exportJson">Download content backup</button><button type="button" class="btn" id="undoPublish">Restore previous published version</button><button type="button" class="btn danger" id="resetDefaults">Reset everything to original content</button></div></div>';
  };

  /* ---------- view events ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.dataset.enqf) { S.enqFilter = t.dataset.enqf; render(); }
    else if (t.dataset.cmtf) { S.cmtFilter = t.dataset.cmtf; render(); }
    else if (t.id === 'enqRefresh') loadEnquiries().then(function () { render(); toast('Updated'); });
    else if (t.id === 'cmtRefresh') loadComments().then(function () { render(); toast('Updated'); });
    else if (t.dataset.enqdel) {
      if (!confirm('Delete this enquiry permanently?')) return;
      api('/api/admin/enquiries/' + encodeURIComponent(t.dataset.enqdel), { method: 'DELETE' }).then(function () { S.enquiries = S.enquiries.filter(function (x) { return x.id !== t.dataset.enqdel; }); render(); }).catch(fail);
    } else if (t.dataset.cmtdel) {
      if (!confirm('Delete this comment?')) return;
      api('/api/admin/comments/' + encodeURIComponent(t.dataset.cmtdel), { method: 'DELETE' }).then(function () { S.comments = S.comments.filter(function (x) { return x.id !== t.dataset.cmtdel; }); render(); }).catch(fail);
    } else if (t.dataset.cmttoggle) {
      var c = S.comments.filter(function (x) { return x.id === t.dataset.cmttoggle; })[0];
      api('/api/admin/comments/' + encodeURIComponent(c.id), { method: 'PATCH', body: { status: c.status === 'resolved' ? 'open' : 'resolved' } }).then(function (u) { c.status = u.status; render(); }).catch(fail);
    } else if (t.id === 'cmtCopy') {
      var open = S.comments.filter(function (x) { return x.status !== 'resolved'; });
      if (!open.length) return toast('No open comments');
      var txt = 'Website comments to action (' + open.length + '), from the VTA dashboard:\n\n' + open.map(function (c, i) {
        return (i + 1) + '. Page: ' + c.page + '\n   Element: "' + c.snippet + '"\n   Selector: ' + c.selector + '\n   Seen on: ' + (c.vw ? c.vw + 'px wide screen' : 'unknown') + '\n   Comment: ' + c.comment;
      }).join('\n\n');
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { toast('Copied. Paste it into your chat with Claude.'); }).catch(function () { prompt('Copy this text:', txt); });
    } else if (t.id === 'exportJson') {
      var blob = new Blob([JSON.stringify(S.content, null, 2)], { type: 'application/json' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'vta-content-' + new Date().toISOString().slice(0, 10) + '.json'; a.click();
    } else if (t.id === 'undoPublish') {
      if (!confirm('Replace the live content with the version published before the last one?')) return;
      api('/api/admin/content', { method: 'DELETE' }).then(function (d) { S.content = mergeDefaults(d.content); S.saved = JSON.stringify(S.content); markDirty(); render(); toast('Previous version restored'); }).catch(fail);
    } else if (t.id === 'resetDefaults') {
      if (!confirm('Load the original site content into the editor? Nothing changes on the site until you publish.')) return;
      S.content = clone(DEF); markDirty(); render();
    }
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.dataset.enq) {
      var r = S.enquiries.filter(function (x) { return x.id === t.dataset.enq; })[0], body = {};
      body[t.dataset.field] = t.value;
      api('/api/admin/enquiries/' + encodeURIComponent(r.id), { method: 'PATCH', body: body }).then(function (u) { Object.assign(r, u); counts(); if (t.dataset.field === 'status') render(); toast('Saved'); }).catch(fail);
    }
    if (t.dataset.upload !== undefined) uploadPhotos(Number(t.dataset.upload), t.files);
  });
  document.addEventListener('input', function (e) { if (e.target.id === 'enqQ') { S.enqQuery = e.target.value; var pos = e.target.selectionStart; render(); var el = $('#enqQ'); el.focus(); el.setSelectionRange(pos, pos); } });

  /* ---------- photo upload (resized in the browser first) ---------- */
  function resize(file, max, q) {
    return new Promise(function (res, rej) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { b ? res(b) : rej(new Error('Could not process image')); }, 'image/jpeg', q);
      };
      img.onerror = function () { rej(new Error('Could not read ' + file.name)); };
      img.src = url;
    });
  }
  function up(blob, name) { var fd = new FormData(); fd.append('file', new File([blob], name, { type: 'image/jpeg' })); return api('/api/admin/upload', { method: 'POST', body: fd }); }
  function uploadPhotos(pi, files) {
    var p = S.content.properties[pi], list = Array.prototype.slice.call(files || []);
    if (!list.length) return;
    toast('Uploading ' + list.length + ' photo' + (list.length > 1 ? 's' : '') + '…');
    list.reduce(function (chain, f) {
      return chain.then(function () {
        return Promise.all([resize(f, 1600, 0.82), resize(f, 480, 0.72)]).then(function (b) {
          return Promise.all([up(b[0], f.name), up(b[1], 'thumb-' + f.name)]);
        }).then(function (r) { p.photos = p.photos || []; p.photos.push({ src: r[0].url, thumb: r[1].url, caption: '' }); });
      });
    }, Promise.resolve()).then(function () { markDirty(); render('prop-' + p.id); toast('Photos added. Publish to put them live.'); }).catch(function (e) { fail(e); render('prop-' + p.id); });
  }

  /* ---------- load ---------- */
  function loadEnquiries() { return api('/api/admin/enquiries').then(function (d) { S.enquiries = d.rows || []; }); }
  function loadComments() { return api('/api/admin/comments').then(function (d) { S.comments = d.rows || []; }); }
  function start() {
    api('/api/admin/me').then(function (me) {
      $('#login').hidden = true; $('#app').hidden = false;
      $('#noStorage').hidden = me.storage;
      if (!me.storage) { S.content = clone(DEF); S.saved = JSON.stringify(S.content); S.tab = location.hash.slice(1) || 'properties'; if (!VIEWS[S.tab]) S.tab = 'properties'; render(); return; }
      return Promise.all([
        api('/api/admin/content').then(function (d) { S.content = mergeDefaults(d.content); S.saved = JSON.stringify(S.content); S.savedAt = d.savedAt; }),
        loadEnquiries(), loadComments()
      ]).then(function () { var t = location.hash.slice(1); S.tab = VIEWS[t] ? t : 'enquiries'; render(); markDirty(); });
    }).catch(function (e) { if (e.message !== 'Signed out') { showLogin(); $('#loginErr').textContent = e.message; } });
  }
  start();
})();
