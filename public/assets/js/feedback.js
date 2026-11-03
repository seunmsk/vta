/* Page comments for signed-in admins. Loads only when the vta_admin cookie is present;
   the server checks the real session on every request. */
(function () {
  'use strict';
  if (!/(?:^|;\s*)vta_admin=1/.test(document.cookie)) return;
  var page = location.pathname.replace(/\/$/, '/index.html').replace(/^\/$/, '/index.html');
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var comments = [], mode = false, showPins = true, hoverEl = null;

  var css = document.createElement('style');
  css.textContent = [
    '.fb-bar{position:fixed;left:16px;bottom:16px;z-index:9998;display:flex;gap:8px;font:600 14px Manrope,system-ui,sans-serif}',
    '.fb-bar button,.fb-bar a{min-height:44px;padding:10px 16px;border-radius:999px;border:1px solid #D8B46A;background:#0B1B2B;color:#F3EFE6;cursor:pointer;text-decoration:none;display:flex;align-items:center;gap:8px;box-shadow:0 10px 30px rgba(0,0,0,.35);font:inherit}',
    '.fb-bar button.on{background:#D8B46A;color:#0B1B2B}',
    '.fb-hover{outline:2px dashed #D8B46A!important;outline-offset:3px!important;cursor:crosshair!important}',
    '.fb-pin{position:absolute;z-index:9997;width:28px;height:28px;border-radius:50% 50% 50% 0;background:#D8B46A;color:#0B1B2B;font:700 13px Manrope,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;border:2px solid #0B1B2B;cursor:pointer;transform:translate(-4px,-24px);box-shadow:0 6px 16px rgba(0,0,0,.35)}',
    '.fb-pin.done{background:#7F93A4}',
    '.fb-pop{position:absolute;z-index:9999;width:300px;max-width:calc(100vw - 32px);background:#fff;color:#0B1B2B;border-radius:14px;padding:14px;box-shadow:0 24px 60px rgba(0,0,0,.4);font:14px/1.5 Manrope,system-ui,sans-serif}',
    '.fb-pop textarea{width:100%;min-height:90px;border:1px solid #C9D2DA;border-radius:10px;padding:10px;font:inherit;resize:vertical}',
    '.fb-pop .row{display:flex;gap:8px;justify-content:flex-end;margin-top:10px}',
    '.fb-pop button{min-height:40px;padding:8px 14px;border-radius:999px;border:1px solid #C9D2DA;background:#fff;font:600 14px Manrope,system-ui,sans-serif;cursor:pointer}',
    '.fb-pop button.p{background:#0B1B2B;color:#fff;border-color:#0B1B2B}',
    '.fb-pop small{display:block;color:#5B6B78;margin-bottom:6px}',
    '.fb-flash{outline:3px solid #D8B46A!important;outline-offset:4px!important;transition:outline-color .3s}'
  ].join('');
  document.head.appendChild(css);

  var bar = document.createElement('div');
  bar.className = 'fb-bar';
  bar.innerHTML = '<button type="button" id="fbMode" aria-pressed="false"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>Comment</button><button type="button" id="fbPins" aria-pressed="true">Pins</button><a href="/admin/#comments">Dashboard</a>';
  document.body.appendChild(bar);
  var layer = document.createElement('div');
  layer.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0';
  document.body.appendChild(layer);

  function selectorFor(el) {
    if (el.id) return '#' + CSS.escape(el.id);
    var parts = [];
    while (el && el.nodeType === 1 && el !== document.body && parts.length < 12) {
      if (el.id) { parts.unshift('#' + CSS.escape(el.id)); break; }
      var tag = el.tagName.toLowerCase(), i = 1, s = el;
      while ((s = s.previousElementSibling)) if (s.tagName === el.tagName) i++;
      parts.unshift(tag + ':nth-of-type(' + i + ')');
      el = el.parentElement;
    }
    return (parts[0] && parts[0].charAt(0) === '#' ? '' : 'body > ') + parts.join(' > ');
  }
  function find(sel) { try { return document.querySelector(sel); } catch (e) { return null; } }
  function inUi(el) { return el.closest('.fb-bar,.fb-pop,.fb-pin'); }

  function drawPins() {
    layer.innerHTML = '';
    if (!showPins) return;
    comments.forEach(function (c, i) {
      var el = find(c.selector); if (!el) return;
      var r = el.getBoundingClientRect(); if (!r.width && !r.height) return;
      var pin = document.createElement('button');
      pin.type = 'button';
      pin.className = 'fb-pin' + (c.status === 'resolved' ? ' done' : '');
      pin.textContent = i + 1;
      pin.title = c.comment;
      pin.style.left = (r.left + window.scrollX + r.width * Math.min(Math.max(c.x, 0), 1)) + 'px';
      pin.style.top = (r.top + window.scrollY + r.height * Math.min(Math.max(c.y, 0), 1)) + 'px';
      pin.addEventListener('click', function (e) { e.stopPropagation(); showComment(c, i, pin); });
      layer.appendChild(pin);
    });
  }
  function popAt(x, y, html) {
    closePop();
    var p = document.createElement('div');
    p.className = 'fb-pop'; p.innerHTML = html;
    p.style.left = Math.min(x, window.scrollX + document.documentElement.clientWidth - 320) + 'px';
    p.style.top = (y + 12) + 'px';
    document.body.appendChild(p);
    return p;
  }
  function closePop() { var o = document.querySelector('.fb-pop'); if (o) o.remove(); }
  function showComment(c, i, pin) {
    var r = pin.getBoundingClientRect();
    var p = popAt(r.left + window.scrollX, r.bottom + window.scrollY,
      '<small>#' + (i + 1) + ' · ' + esc(new Date(c.created).toLocaleString()) + ' · ' + esc(c.status) + '</small><div style="white-space:pre-wrap">' + esc(c.comment) + '</div>' +
      '<div class="row"><button type="button" data-a="close">Close</button><button type="button" class="p" data-a="toggle">' + (c.status === 'resolved' ? 'Reopen' : 'Resolve') + '</button></div>');
    p.addEventListener('click', function (e) {
      var a = e.target.getAttribute('data-a'); if (!a) return;
      if (a === 'close') return closePop();
      fetch('/api/admin/comments/' + encodeURIComponent(c.id), { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: c.status === 'resolved' ? 'open' : 'resolved' }) })
        .then(function (r) { return r.json(); }).then(function (u) { c.status = u.status; closePop(); drawPins(); });
    });
  }

  function setMode(on) {
    mode = on;
    var b = document.getElementById('fbMode');
    b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.innerHTML = on ? 'Click anything to comment (Esc to stop)' : '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>Comment';
    if (!on && hoverEl) { hoverEl.classList.remove('fb-hover'); hoverEl = null; }
  }
  document.getElementById('fbMode').addEventListener('click', function () { setMode(!mode); });
  document.getElementById('fbPins').addEventListener('click', function () {
    showPins = !showPins; this.setAttribute('aria-pressed', showPins ? 'true' : 'false'); this.classList.toggle('on', !showPins); drawPins();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMode(false); closePop(); } });
  document.addEventListener('mouseover', function (e) {
    if (!mode || inUi(e.target)) return;
    if (hoverEl) hoverEl.classList.remove('fb-hover');
    hoverEl = e.target; hoverEl.classList.add('fb-hover');
  }, true);
  document.addEventListener('click', function (e) {
    if (!mode || inUi(e.target)) return;
    e.preventDefault(); e.stopPropagation();
    var el = e.target, r = el.getBoundingClientRect();
    var rx = r.width ? (e.clientX - r.left) / r.width : 0, ry = r.height ? (e.clientY - r.top) / r.height : 0;
    if (hoverEl) { hoverEl.classList.remove('fb-hover'); hoverEl = null; }
    var snippet = (el.innerText || el.alt || el.getAttribute('aria-label') || el.tagName).replace(/\s+/g, ' ').trim().slice(0, 140);
    var p = popAt(e.pageX, e.pageY, '<small>Comment on: “' + esc(snippet) + '”</small><textarea placeholder="What should change here?"></textarea><div class="row"><button type="button" data-a="cancel">Cancel</button><button type="button" class="p" data-a="save">Save comment</button></div>');
    var ta = p.querySelector('textarea'); ta.focus();
    p.addEventListener('click', function (ev) {
      var a = ev.target.getAttribute('data-a'); if (!a) return;
      if (a === 'cancel') return closePop();
      var text = ta.value.trim(); if (!text) { ta.focus(); return; }
      ev.target.disabled = true; ev.target.textContent = 'Saving…';
      fetch('/api/admin/comments', { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ page: page, selector: selectorFor(el), snippet: snippet, x: rx, y: ry, vw: window.innerWidth, comment: text }) })
        .then(function (r) { if (r.status === 401) throw new Error('signin'); return r.json(); })
        .then(function (c) { comments.push(c); closePop(); setMode(false); drawPins(); })
        .catch(function (err) { ev.target.disabled = false; ev.target.textContent = 'Save comment'; alertBox(err.message === 'signin' ? 'Your session has expired. Sign in again from the dashboard.' : 'Could not save. Check your connection.'); });
    });
  }, true);
  function alertBox(msg) { var p = document.querySelector('.fb-pop'); if (p) { var s = document.createElement('small'); s.style.color = '#B3262E'; s.textContent = msg; p.appendChild(s); } }

  function load() {
    fetch('/api/admin/comments?page=' + encodeURIComponent(page))
      .then(function (r) {
        if (r.status === 401) { document.cookie = 'vta_admin=; Path=/; Max-Age=0'; bar.remove(); throw new Error('signed out'); }
        return r.json();
      })
      .then(function (d) {
        comments = (d.rows || []).slice().reverse();
        drawPins();
        var m = location.search.match(/[?&]comment=([^&]+)/);
        if (m) {
          var id = decodeURIComponent(m[1]), c = comments.filter(function (x) { return x.id === id; })[0], el = c && find(c.selector);
          if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('fb-flash'); setTimeout(function () { el.classList.remove('fb-flash'); drawPins(); }, 2500); }
        }
      }).catch(function () {});
  }
  var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(drawPins, 150); });
  // Re-place pins once content (fonts, images, edited listings) has settled.
  window.addEventListener('load', function () { setTimeout(load, 300); });
})();
