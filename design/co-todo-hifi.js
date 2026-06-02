/* ======================================================================
   Co-Todo — High-fidelity prototype interactions
   Vanilla JS. No build step. Drives:
   - View navigation (nav links, tabbar, CTAs)
   - Dashboard claim actions + animated load gauge
   - Task pool drag-and-drop AND tap-to-assign
   - Create form live points / bonus / impact calculation
   - Task detail modal
   - Toasts (with undo)
   - Perspective swap (you = A / B) + reduced motion
   ====================================================================== */
(function () {
  "use strict";
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var app = $('.app');

  /* ------------------------------------------------------------------ */
  /* View navigation                                                     */
  /* ------------------------------------------------------------------ */
  var views = $$('.view');
  function showView(name, opts) {
    opts = opts || {};
    var found = false;
    views.forEach(function (v) {
      var on = v.dataset.view === name;
      v.classList.toggle('active', on);
      if (on) found = true;
    });
    if (!found) return;
    // nav link + tabbar current state
    $$('.nav-links a, .mobile-tabbar a').forEach(function (a) {
      var on = a.dataset.go === name || (name === 'create' && a.dataset.go === 'create');
      if (a.dataset.go === name) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    // create view shows mobile sticky actions only
    app.dataset.activeView = name;
    var main = $('.app-main');
    if (main && !opts.keepScroll) main.scrollTop = 0;
    try { history.replaceState(null, '', '#' + name); } catch (e) {}
    if (name === 'dashboard') armGauge();
  }
  window.addEventListener('click', function (e) {
    var go = e.target.closest('[data-go]');
    if (go) { e.preventDefault(); showView(go.dataset.go); }
  });
  // Allow an embedding showcase to drive the view via hash or postMessage.
  window.addEventListener('hashchange', function () {
    var n = (location.hash || '').replace('#', '');
    if (['dashboard', 'pool', 'create'].indexOf(n) > -1) showView(n);
  });
  window.addEventListener('message', function (e) {
    var d = e.data || {};
    if (d && d.cotodo === 'goto' && ['dashboard', 'pool', 'create'].indexOf(d.view) > -1) showView(d.view);
  });

  /* ------------------------------------------------------------------ */
  /* Toasts                                                              */
  /* ------------------------------------------------------------------ */
  var toastStack = $('#toast-stack');
  var ICONS = {
    ok:   '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4 10-10"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M12 2l2.5 6.5L21 10l-5 4.5L17.5 22 12 18.5 6.5 22 8 14.5 3 10l6.5-1.5L12 2z"/></svg>'
  };
  function toast(msg, kind, onUndo) {
    kind = kind || 'ok';
    var el = document.createElement('div');
    el.className = 'toast ' + kind;
    el.innerHTML = '<span class="t-ico" aria-hidden="true">' + (ICONS[kind] || ICONS.ok) + '</span><span class="t-msg">' + msg + '</span>';
    if (onUndo) {
      var u = document.createElement('button');
      u.className = 't-undo'; u.type = 'button'; u.textContent = 'Annuler';
      u.addEventListener('click', function () { onUndo(); dismiss(); });
      el.appendChild(u);
    }
    toastStack.appendChild(el);
    var timer = setTimeout(dismiss, onUndo ? 5200 : 3200);
    function dismiss() {
      clearTimeout(timer);
      if (!el.parentNode) return;
      el.classList.add('out');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 280);
    }
    return dismiss;
  }

  /* ------------------------------------------------------------------ */
  /* Animated load gauge (dashboard)                                     */
  /* ------------------------------------------------------------------ */
  var loadBar = $('#load-bar');
  var gaugeArmed = false;
  function armGauge() {
    if (!loadBar) return;
    loadBar.classList.remove('armed');
    // force reflow then arm so it animates each time the view is shown
    void loadBar.offsetWidth;
    requestAnimationFrame(function () { loadBar.classList.add('armed'); });
    gaugeArmed = true;
  }

  /* ------------------------------------------------------------------ */
  /* Dashboard — claim / assign unassigned cards                         */
  /* ------------------------------------------------------------------ */
  function bumpCount(el) {
    if (!el) return;
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  }
  function updateUnassignedCount(delta) {
    var pill = $('[data-count="unassigned"]');
    if (!pill) return;
    var n = Math.max(0, (parseInt(pill.textContent, 10) || 0) + delta);
    pill.textContent = n + ' tâche' + (n > 1 ? 's' : '');
    bumpCount(pill);
  }
  $$('.unassigned-card [data-claim]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.unassigned-card');
      if (!card || card.classList.contains('leaving')) return;
      var title = card.getAttribute('data-ua') || 'Tâche';
      var who = btn.dataset.claim === 'me' ? 'vous' : 'Parent B';
      card.classList.add('leaving');
      updateUnassignedCount(-1);
      setTimeout(function () { if (card.parentNode) card.parentNode.removeChild(card); }, 320);
      toast('« ' + title + ' » attribuée à ' + who + '.', 'ok', function () {
        // undo: restore
        card.classList.remove('leaving');
        var list = $('[data-list="unassigned"]');
        if (list && !card.parentNode) list.insertBefore(card, list.firstChild);
        updateUnassignedCount(1);
      });
    });
  });

  /* ------------------------------------------------------------------ */
  /* Dashboard — open task detail from a task row                        */
  /* ------------------------------------------------------------------ */
  $$('.task-row[data-task]').forEach(function (row) {
    row.setAttribute('tabindex', '0');
    row.setAttribute('role', 'button');
    function open() {
      var data;
      try { data = JSON.parse(row.getAttribute('data-task')); } catch (e) { return; }
      openDetail(data);
    }
    row.addEventListener('click', open);
    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });

  /* ------------------------------------------------------------------ */
  /* Task detail modal                                                   */
  /* ------------------------------------------------------------------ */
  var scrim = $('#detail-scrim');
  var lastFocused = null;
  var BADGE = {
    urgent: '<span class="status urgent"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="9"/><path d="M12 8v4m0 4h.01" stroke-linecap="round"/></svg>En retard</span>',
    bonus:  '<span class="status bonus"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M12 2l2.5 6.5L21 10l-5 4.5L17.5 22 12 18.5 6.5 22 8 14.5 3 10l6.5-1.5L12 2z"/></svg>Bonus +5</span>'
  };
  function openDetail(d) {
    lastFocused = document.activeElement;
    $('#detail-title').textContent = d.title || 'Tâche';
    $('#detail-date').textContent = d.due || '';
    $('#detail-note').textContent = d.note || 'Aucune note.';
    $('#detail-pts').textContent = (d.pts || 0) + ' pt';
    var av = $('#detail-av'), nm = $('#detail-assignee-name');
    var who = d.assignee || 'A';
    av.className = 'avatar sm' + (who === 'B' ? ' b' : '');
    av.textContent = who === 'B' ? 'B' : 'A';
    nm.textContent = who === 'B' ? 'Parent B' : 'Vous';
    var badges = $('#detail-badges');
    badges.innerHTML = (d.tag && BADGE[d.tag]) ? BADGE[d.tag] : '<span class="status todo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>À faire</span>';
    scrim.hidden = false;
    void scrim.offsetWidth;
    scrim.classList.add('open');
    $('#detail-close').focus();
    scrim._task = d;
  }
  function closeDetail() {
    scrim.classList.remove('open');
    setTimeout(function () { scrim.hidden = true; }, 240);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }
  $('#detail-close').addEventListener('click', closeDetail);
  scrim.addEventListener('click', function (e) { if (e.target === scrim) closeDetail(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && scrim && !scrim.hidden) closeDetail();
  });
  $('#detail-done').addEventListener('click', function () {
    var d = scrim._task || {};
    closeDetail();
    toast('« ' + (d.title || 'Tâche') + ' » marquée comme faite. +' + (d.pts || 1) + ' pt 🎉', 'ok');
  });
  $('#detail-defer').addEventListener('click', function () {
    var d = scrim._task || {};
    closeDetail();
    toast('« ' + (d.title || 'Tâche') + ' » reportée à demain.', 'info');
  });

  /* ------------------------------------------------------------------ */
  /* Pool — filters                                                      */
  /* ------------------------------------------------------------------ */
  var poolList = $('#pool-list');
  $$('.pool-toolbar [data-filter]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      $$('.pool-toolbar [data-filter]').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      var f = chip.dataset.filter;
      $$('.pool-card', poolList).forEach(function (card) {
        var pool = (card.dataset.pool || '');
        var show = f === 'all'
          || (f === 'unassigned' && true)   /* all pool cards are unassigned in this mock */
          || (f === 'week' && pool.indexOf('week') > -1)
          || (f === 'big' && pool.indexOf('big') > -1);
        card.style.display = show ? '' : 'none';
      });
      refreshPoolCount();
    });
  });
  function refreshPoolCount() {
    var visible = $$('.pool-card', poolList).filter(function (c) { return c.style.display !== 'none'; }).length;
    var el = $('[data-pool-count]'); if (el) el.textContent = visible;
  }

  /* ------------------------------------------------------------------ */
  /* Pool — assignment via drag-and-drop AND tap-to-assign               */
  /* ------------------------------------------------------------------ */
  var buckets = $$('.bucket');
  var pickBanner = $('#pick-banner');
  var pickTitleEl = $('[data-pick-title]');
  var picked = null;

  function assignCardToBucket(card, bucket) {
    if (!card || !bucket) return;
    var title = (($('.title', card) || {}).textContent || 'Tâche').trim();
    var label = bucket.getAttribute('data-label') || 'un panier';
    // bump bucket count
    var countEl = $('[data-bucket-count]', bucket);
    if (countEl) {
      var n = (parseInt(countEl.getAttribute('data-bucket-count'), 10) || 0) + 1;
      countEl.setAttribute('data-bucket-count', n);
      var suffix = bucket.dataset.bucket === 'reserve' ? ' en attente'
                 : bucket.dataset.bucket === 'both' ? ' partagées'
                 : ' en cours';
      countEl.textContent = n + suffix;
      bumpCount(countEl);
    }
    card.classList.add('leaving');
    setTimeout(function () { if (card.parentNode) card.parentNode.removeChild(card); refreshPoolCount(); }, 320);
    clearPick();
    toast('« ' + title + ' » → ' + label + '.', 'ok', function () {
      card.classList.remove('leaving');
      if (poolList && !card.parentNode) poolList.appendChild(card);
      if (countEl) {
        var m = Math.max(0, (parseInt(countEl.getAttribute('data-bucket-count'), 10) || 1) - 1);
        countEl.setAttribute('data-bucket-count', m);
        var sfx = bucket.dataset.bucket === 'reserve' ? ' en attente'
                : bucket.dataset.bucket === 'both' ? ' partagées' : ' en cours';
        countEl.textContent = m + sfx;
      }
      refreshPoolCount();
    });
  }

  // --- tap to pick, tap bucket to drop ---
  function pickCard(card) {
    if (picked === card) { clearPick(); return; }
    clearPick();
    picked = card;
    card.classList.add('picked');
    if (pickTitleEl) pickTitleEl.textContent = (($('.title', card) || {}).textContent || 'Tâche').trim();
    if (pickBanner) pickBanner.classList.add('show');
    buckets.forEach(function (b) { b.classList.add('drop-target'); });
  }
  function clearPick() {
    if (picked) picked.classList.remove('picked');
    picked = null;
    if (pickBanner) pickBanner.classList.remove('show');
    buckets.forEach(function (b) { b.classList.remove('drop-target'); });
  }
  if ($('#pick-cancel')) $('#pick-cancel').addEventListener('click', clearPick);

  function wirePoolCard(card) {
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', function (e) {
      // ignore clicks that originate a native drag handle? simple: toggle pick
      pickCard(card);
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickCard(card); }
    });
    // native HTML5 drag
    card.addEventListener('dragstart', function (e) {
      card.classList.add('dragging');
      try { e.dataTransfer.setData('text/plain', 'card'); e.dataTransfer.effectAllowed = 'move'; } catch (er) {}
      window.__draggedCard = card;
      buckets.forEach(function (b) { b.classList.add('drop-target'); });
    });
    card.addEventListener('dragend', function () {
      card.classList.remove('dragging');
      window.__draggedCard = null;
      buckets.forEach(function (b) { b.classList.remove('drop-target'); });
    });
  }
  $$('.pool-card', poolList).forEach(wirePoolCard);

  buckets.forEach(function (bucket) {
    bucket.addEventListener('click', function () {
      if (picked) assignCardToBucket(picked, bucket);
    });
    bucket.addEventListener('dragover', function (e) { e.preventDefault(); bucket.classList.add('drop-target'); });
    bucket.addEventListener('dragenter', function (e) { e.preventDefault(); });
    bucket.addEventListener('dragleave', function (e) {
      if (!bucket.contains(e.relatedTarget)) bucket.classList.remove('drop-target');
    });
    bucket.addEventListener('drop', function (e) {
      e.preventDefault();
      var card = window.__draggedCard;
      if (card) assignCardToBucket(card, bucket);
    });
  });

  /* ------------------------------------------------------------------ */
  /* Create — subtasks (check / remove / add)                            */
  /* ------------------------------------------------------------------ */
  var subtaskList = $('#subtask-list');
  function wireSubtask(row) {
    var check = $('.check', row);
    var x = $('.x', row);
    if (check) {
      function toggle() {
        var on = !check.classList.contains('on');
        check.classList.toggle('on', on);
        check.setAttribute('aria-checked', String(on));
        row.classList.toggle('checked', on);
        recompute();
      }
      check.addEventListener('click', toggle);
      check.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    }
    if (x) {
      function rm() {
        row.style.opacity = '0'; row.style.transform = 'translateX(16px)';
        setTimeout(function () { if (row.parentNode) row.parentNode.removeChild(row); recompute(); }, 200);
      }
      x.addEventListener('click', rm);
      x.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rm(); }
      });
    }
  }
  $$('.subtask', subtaskList).forEach(wireSubtask);

  var addBtn = $('#add-subtask');
  if (addBtn) addBtn.addEventListener('click', function () {
    var row = document.createElement('div');
    row.className = 'subtask';
    row.innerHTML =
      '<span class="check" role="checkbox" aria-checked="false" tabindex="0" aria-label="Nouvelle sous-tâche"></span>' +
      '<span class="stxt" contenteditable="true">Nouvelle sous-tâche</span>' +
      '<span class="drag" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/></svg></span>' +
      '<span class="x" role="button" tabindex="0" aria-label="Supprimer la sous-tâche"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></span>';
    subtaskList.appendChild(row);
    wireSubtask(row);
    var txt = $('.stxt', row);
    if (txt) { txt.focus(); document.execCommand && document.execCommand('selectAll', false, null); }
    recompute();
  });

  /* ------------------------------------------------------------------ */
  /* Create — tags remove                                                */
  /* ------------------------------------------------------------------ */
  $$('#tag-chips .x').forEach(function (x) {
    x.addEventListener('click', function () {
      var chip = x.closest('.tag-chip');
      if (chip) chip.remove();
    });
  });

  /* ------------------------------------------------------------------ */
  /* Create — assignment select (+ impact gauge)                         */
  /* ------------------------------------------------------------------ */
  var assignGrid = $('#assign-grid');
  var currentAssign = 'A';
  if (assignGrid) $$('.assign-card', assignGrid).forEach(function (card) {
    card.addEventListener('click', function () {
      $$('.assign-card', assignGrid).forEach(function (c) { c.setAttribute('aria-checked', 'false'); });
      card.setAttribute('aria-checked', 'true');
      currentAssign = card.dataset.assign;
      recompute();
    });
  });

  /* ------------------------------------------------------------------ */
  /* Create — live calculation                                           */
  /* ------------------------------------------------------------------ */
  var BASE = 10;
  function filled(el) { return el && el.value && el.value.trim().length > 2; }
  function recompute() {
    var title = $('#f-title');
    var start = $('#d-start');
    var loc = $('#d-loc');
    var subs = $$('.subtask', subtaskList).length;

    var hasTitle = filled(title);
    var hasWhen = filled(start);
    var hasWhere = filled(loc);

    // bonus level: 0 minimal, 1 partial, 2 complet
    var level = 0;
    if (hasTitle) {
      if (hasWhen && hasWhere && subs >= 2) level = 2;
      else if (hasWhen || hasWhere) level = 1;
      else level = 0;
    }
    var LV = [
      { name: 'Minimal', mult: 1.0,  pct: '+0 %' },
      { name: 'Partiel', mult: 1.15, pct: '+15 %' },
      { name: 'Complet', mult: 1.30, pct: '+30 %' }
    ];
    var lv = LV[level];

    // meter
    $$('#bonus-meter .bonus-step').forEach(function (step, i) {
      step.classList.toggle('on', i <= level);
      step.classList.toggle('current', i === level);
    });
    var lvlBadge = $('#bonus-lvl'); if (lvlBadge) lvlBadge.textContent = lv.name;

    // points
    var subBonus = Math.min(2, subs * 0.5); // capped at 2
    var total = Math.round((BASE + subBonus) * lv.mult);

    $('#calc-sub-n').textContent = subs;
    $('#calc-sub').textContent = '+' + (subBonus % 1 === 0 ? subBonus : subBonus.toFixed(1)).toString().replace('.', ',');
    $('#calc-lvl').textContent = lv.name;
    $('#calc-mult').textContent = '×' + lv.mult.toFixed(2);
    $('#calc-total').textContent = '≈ ' + total + ' pt';

    var ptsTotal = $('#pts-total');
    ptsTotal.innerHTML = total + '<span class="unit">pt</span>';
    ptsTotal.classList.remove('flash'); void ptsTotal.offsetWidth; ptsTotal.classList.add('flash');
    $('#pts-bonus').innerHTML = lv.pct.replace(' %', '') + '<span class="unit">%</span>';

    // impact gauge: depends on assignment of these points
    var aBase = 232, bBase = 168;
    var aNew = aBase, bNew = bBase;
    if (currentAssign === 'A') aNew += total;
    else if (currentAssign === 'B') bNew += total;
    else if (currentAssign === 'both') { aNew += total / 2; bNew += total / 2; }
    var sum = aNew + bNew;
    var aPct = Math.round(aNew / sum * 100);
    var bPct = 100 - aPct;
    var bar = $('#impact-bar');
    var segA = $('.seg.a', bar), segB = $('.seg.b', bar);
    segA.style.width = aPct + '%'; segA.textContent = 'A · ' + aPct + '%';
    segB.style.width = bPct + '%'; segB.textContent = 'B · ' + bPct + '%';
    bar.setAttribute('aria-label', 'Projection de la jauge : A ' + aPct + ' %, B ' + bPct + ' %');
    var note = $('#impact-note');
    if (currentAssign === 'none') note.textContent = 'Non attribuée — la tâche reste dans la réserve, sans impact sur la jauge.';
    else if (currentAssign === 'both') note.textContent = 'Était 58 / 42 → projeté ' + aPct + ' / ' + bPct + ' en partageant cette tâche.';
    else if (currentAssign === 'B') note.textContent = 'Était 58 / 42 → projeté ' + aPct + ' / ' + bPct + ' si Parent B la prend.';
    else note.textContent = 'Était 58 / 42 → projeté ' + aPct + ' / ' + bPct + ' si vous gardez cette tâche.';
  }
  ['#f-title', '#d-start', '#d-end', '#d-loc'].forEach(function (sel) {
    var el = $(sel);
    if (el) el.addEventListener('input', recompute);
  });

  /* ------------------------------------------------------------------ */
  /* Create — submit                                                     */
  /* ------------------------------------------------------------------ */
  function submitCreate() {
    var title = ($('#f-title').value || 'Nouvelle tâche').trim();
    showView('pool');
    setTimeout(function () {
      toast('« ' + title +' » ajoutée à la réserve.', 'ok');
    }, 220);
  }
  if ($('#create-submit'))   $('#create-submit').addEventListener('click', submitCreate);
  if ($('#create-submit-m')) $('#create-submit-m').addEventListener('click', submitCreate);

  /* ------------------------------------------------------------------ */
  /* Mobile hamburger menu                                               */
  /* ------------------------------------------------------------------ */
  var ham = $('.hamburger');
  if (ham) {
    var navLinks = $('.nav-links');
    if (navLinks && !navLinks.id) navLinks.id = 'nav-links-menu';
    ham.setAttribute('aria-controls', navLinks ? navLinks.id : '');
    ham.setAttribute('aria-expanded', 'false');
    ham.addEventListener('click', function () {
      if (!navLinks) return;
      var open = navLinks.classList.toggle('open');
      ham.setAttribute('aria-expanded', String(open));
    });
  }

  /* ------------------------------------------------------------------ */
  /* Perspective + motion hooks (driven by Tweaks)                       */
  /* ------------------------------------------------------------------ */
  window.CoTodo = {
    setMotion: function (on) {
      document.documentElement.classList.toggle('no-motion', !on);
    },
    setYou: function (who) {
      // swap the "you" framing: A is default; B flips greeting + avatar letter
      var greet = $('[data-you-greet]');
      var av = $('[data-avatar-you]');
      if (who === 'B') {
        if (greet) greet.textContent = 'Bonjour Mathieu';
        if (av) { av.textContent = 'B'; av.classList.add('b'); av.title = 'Parent B — Mathieu'; }
      } else {
        if (greet) greet.textContent = 'Bonjour Adèle';
        if (av) { av.textContent = 'A'; av.classList.remove('b'); av.title = 'Parent A — Adèle'; }
      }
    }
  };

  /* ------------------------------------------------------------------ */
  /* Init                                                                */
  /* ------------------------------------------------------------------ */
  var initial = (location.hash || '').replace('#', '');
  if (['dashboard', 'pool', 'create'].indexOf(initial) > -1) showView(initial);
  else showView('dashboard');
  recompute();
  // arm the gauge after first paint
  requestAnimationFrame(armGauge);
})();
