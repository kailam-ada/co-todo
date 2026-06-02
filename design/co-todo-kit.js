// =========================================================================
// Co-Todo Brand & UI Kit — contrast calculation + interactivity
// WCAG 2.x relative luminance: https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
// =========================================================================

(function () {
  'use strict';

  // ---------- Contrast math ----------
  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function srgbToLin(c) {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  function luminance(rgb) {
    const [r, g, b] = rgb.map(srgbToLin);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function contrast(hex1, hex2) {
    const L1 = luminance(hexToRgb(hex1));
    const L2 = luminance(hexToRgb(hex2));
    const [a, b] = L1 > L2 ? [L1, L2] : [L2, L1];
    return (a + 0.05) / (b + 0.05);
  }
  window.contrast = contrast; // expose for debugging

  // ---------- Token map (kept in sync with CSS) ----------
  const T = {
    bg:        '#FAF7F1',
    surface:   '#FFFFFF',
    surface2:  '#F2EDE2',
    surface3:  '#E6DFCF',
    line:      '#D9D4C9',
    line2:     '#928A7A',
    ink:       '#1B1A17',
    ink2:      '#2C2A26',
    muted:     '#5E5A52',
    faint:     '#737060',
    // Palette logo RGAA v2 (28 mai 2026) — voir co-todo-kit.css.
    primary:      '#073841',
    primaryHover: '#052830',
    primarySoft:  '#DBE7E9',
    accent:       '#C77127',
    accentHover:  '#A55C1E',
    accentSoft:   '#F7E2CC',
    accentInk:    '#1B1A17',  // ink, pas blanc — voir CSS
    success:   '#15663D',
    successSoft:'#DCEEE0',
    danger:    '#A8232F',
    dangerSoft:'#F8DCDE',
    focus:     '#0B5FFF',
    focusSoft: '#DCE6FF',
    white:     '#FFFFFF'
  };

  function ratioBadge(r) {
    const rounded = (Math.round(r * 10) / 10).toFixed(1);
    let cls = 'chip-fail', icon = '✕';
    if (r >= 7)        { cls = 'chip-aaa';  icon = 'AAA'; }
    else if (r >= 4.5) { cls = 'chip-pass'; icon = 'AA';  }
    else if (r >= 3)   { cls = 'chip-warn'; icon = 'AA · large'; }
    return `<span class="chip ${cls}">${icon} · ${rounded}:1</span>`;
  }
  function statusCell(r, threshold) {
    const ok = r >= threshold;
    const rounded = (Math.round(r * 10) / 10).toFixed(1);
    return `<span class="chip ${ok ? 'chip-pass' : 'chip-fail'}">${ok ? '✓' : '✕'} ${rounded}</span>`;
  }

  // ---------- 1. Swatch generation ----------
  const brandSwatches = [
    { role: 'Primary',     token: '--c-primary',    hex: T.primary,    onDark: true,
      label: 'Teal Nuit',
      desc: 'Toutes les actions principales : CTA, liens, cases cochées, onglet actif.' },
    { role: 'Accent',      token: '--c-accent',     hex: T.accent,     onDark: false,
      label: 'Terre cuite',
      desc: 'Bonus de planification, étoiles, récompenses. Jamais pour une action neutre.' },
    { role: 'Success',     token: '--c-success',    hex: T.success,    onDark: true,
      label: 'Sage Leaf',
      desc: 'Tâche faite, validation. Toujours accompagné d\'une coche ✓.' },
    { role: 'Destructive', token: '--c-danger',     hex: T.danger,     onDark: true,
      label: 'Warm Cranberry',
      desc: 'Erreur, retard, suppression. Toujours accompagné d\'une icône ⓘ ou ⚠.' },
    { role: 'Focus',       token: '--c-focus',      hex: T.focus,      onDark: true,
      label: 'Pure Focus Blue',
      desc: 'Anneau de focus clavier — distinct de toutes les couleurs sémantiques.' },
  ];
  const neutralSwatches = [
    { role: 'Page',         token: '--c-bg',        hex: T.bg,       onDark: false, label: 'Warm Cream',  desc: 'Fond de page. Apaisant, jamais blanc clinique.' },
    { role: 'Surface',      token: '--c-surface',   hex: T.surface,  onDark: false, label: 'Pure White',  desc: 'Cartes, modales, champs de saisie.' },
    { role: 'Surface · alt',token: '--c-surface-2', hex: T.surface2, onDark: false, label: 'Sand',        desc: 'Surfaces secondaires, en-têtes de table.' },
    { role: 'Ink',          token: '--c-ink',       hex: T.ink,      onDark: true,  label: 'Espresso',    desc: 'Texte principal. 17.4:1 sur blanc.' },
    { role: 'Ink · 2',      token: '--c-ink-2',     hex: T.ink2,     onDark: true,  label: 'Bistre',      desc: 'Titres et boutons sombres. 13.3:1.' },
    { role: 'Muted',        token: '--c-muted',     hex: T.muted,    onDark: true,  label: 'Driftwood',   desc: 'Texte secondaire, descriptions. 6.8:1 sur blanc.' },
  ];

  function renderSwatch(s) {
    const onBg   = contrast(s.hex, T.bg);
    const onSurf = contrast(s.hex, T.surface);
    const onDarkRatio = contrast(s.hex, T.ink);
    return `
      <article class="swatch">
        <div class="swatch-fill" style="background:${s.hex}" data-on="${s.onDark ? 'dark' : 'light'}">
          <span class="role">${s.role}</span>
        </div>
        <div class="swatch-body">
          <div class="label">${s.label}</div>
          <div class="hex">${s.hex.toUpperCase()}</div>
          <div class="token">${s.token}</div>
          <p class="desc">${s.desc}</p>
          <div class="ratios">
            <span class="chip" title="Sur fond crème (page)"><span class="kbd">bg</span> ${ratioBadge(onBg).replace(/<span[^>]+>|<\/span>/g, '')}</span>
            <span class="chip" title="Sur surface blanche"><span class="kbd">w</span> ${ratioBadge(onSurf).replace(/<span[^>]+>|<\/span>/g, '')}</span>
          </div>
        </div>
      </article>
    `;
  }
  function fill(id, items) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = items.map(renderSwatch).join('');
  }
  fill('swatches-brand', brandSwatches);
  fill('swatches-neutral', neutralSwatches);

  // ---------- 2. Contrast matrix ----------
  // Each row: foreground, background, usage description, what threshold matters
  const matrix = [
    // text on bg
    { fg: T.ink,     bg: T.surface, fgName: 'Ink (#1B1A17)',    bgName: 'Surface (#FFFFFF)', use: 'Body text on cards',         kind: 'text' },
    { fg: T.ink,     bg: T.bg,      fgName: 'Ink (#1B1A17)',    bgName: 'Page cream',        use: 'Body text on page',          kind: 'text' },
    { fg: T.muted,   bg: T.surface, fgName: 'Muted (#5E5A52)',  bgName: 'Surface (#FFFFFF)', use: 'Secondary copy, metadata',   kind: 'text' },
    { fg: T.faint,   bg: T.surface, fgName: 'Faint (#737060)',  bgName: 'Surface (#FFFFFF)', use: 'Placeholder / disabled',     kind: 'text' },
    { fg: T.primary, bg: T.surface, fgName: 'Primary teal',         bgName: 'Surface',           use: 'Links, primary text',        kind: 'text' },
    { fg: T.primary, bg: T.bg,      fgName: 'Primary teal',         bgName: 'Page cream',        use: 'Active TOC entry',           kind: 'text' },
    { fg: T.ink,     bg: T.accentSoft, fgName: 'Ink',                bgName: 'Accent soft',       use: 'Bonus chip text',            kind: 'text' },
    { fg: T.success, bg: T.successSoft, fgName: 'Success sage', bgName: 'Success soft',      use: 'Done chip text',             kind: 'text' },
    { fg: T.danger,  bg: T.dangerSoft, fgName: 'Danger',        bgName: 'Danger soft',       use: 'Error chip / message',       kind: 'text' },
    // text on filled brand
    { fg: T.white,   bg: T.primary, fgName: 'White',                bgName: 'Primary teal',      use: 'Primary button label',       kind: 'text' },
    { fg: T.ink,     bg: T.accent,  fgName: 'Ink',                  bgName: 'Accent terracotta', use: 'Accent button label',        kind: 'text' },
    { fg: T.white,   bg: T.success, fgName: 'White',            bgName: 'Success sage',      use: 'Done badge filled',          kind: 'text' },
    { fg: T.white,   bg: T.danger,  fgName: 'White',            bgName: 'Danger',            use: 'Destructive button label',   kind: 'text' },
    // UI elements 3:1
    { fg: T.line2,   bg: T.surface, fgName: 'Line · 2',         bgName: 'Surface',           use: 'Input border / divider',     kind: 'ui'   },
    { fg: T.line2,   bg: T.bg,      fgName: 'Line · 2',         bgName: 'Page cream',        use: 'Border on page',             kind: 'ui'   },
    { fg: T.primary, bg: T.bg,      fgName: 'Primary',          bgName: 'Page',              use: 'Filled button on page',      kind: 'ui'   },
    { fg: T.focus,   bg: T.bg,      fgName: 'Focus blue',       bgName: 'Page',              use: 'Focus ring on page',         kind: 'ui'   },
    { fg: T.focus,   bg: T.surface, fgName: 'Focus blue',       bgName: 'Surface',           use: 'Focus ring on card',         kind: 'ui'   },
  ];

  function renderRow(row) {
    const r = contrast(row.fg, row.bg);
    const rounded = (Math.round(r * 10) / 10).toFixed(2);
    return `
      <tr>
        <td><span class="ratio-cell" style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${row.fg};vertical-align:-2px;margin-right:6px;border:1px solid rgba(0,0,0,.08);"></span>${row.fgName}</td>
        <td><span class="ratio-cell" style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${row.bg};vertical-align:-2px;margin-right:6px;border:1px solid rgba(0,0,0,.08);"></span>${row.bgName}</td>
        <td><span class="pair-sample" style="background:${row.bg};color:${row.fg};">${row.kind === 'text' ? 'Aa 16' : '———'}</span></td>
        <td><span class="ratio-cell">${rounded}</span> : 1</td>
        <td>${row.kind === 'text' ? statusCell(r, 4.5) : '<span class="chip" style="opacity:.5;">n/a</span>'}</td>
        <td>${row.kind === 'text' ? statusCell(r, 3)   : '<span class="chip" style="opacity:.5;">n/a</span>'}</td>
        <td>${statusCell(r, 3)}</td>
      </tr>
      <tr style="background:var(--c-bg);">
        <td colspan="7" style="padding-top:4px;padding-bottom:10px;font-size:var(--fs-12);color:var(--c-muted);font-family:var(--ff-mono);text-transform:uppercase;letter-spacing:.06em;">Usage · ${row.use}</td>
      </tr>
    `;
  }

  const tbody = document.querySelector('#contrast-table tbody');
  if (tbody) tbody.innerHTML = matrix.map(renderRow).join('');

  // ---------- 3. Button playground ----------
  const variantSeg = document.getElementById('btn-variant');
  const statesGrid = document.getElementById('btn-states');

  function paintBtnStates(variant) {
    if (!statesGrid) return;
    const label = ({ primary:'Ajouter une tâche', accent:'Bonus +5 pts', danger:'Supprimer', ghost:'Annuler' })[variant];
    const icon = ({
      primary: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
      accent:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"><path d="M12 2l2.5 6.5L21 10l-5 4.5L17.5 22 12 18.5 6.5 22 8 14.5 3 10l6.5-1.5L12 2z"/></svg>',
      danger:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>',
      ghost:   ''
    })[variant];

    const make = (extra) =>
      `<button type="button" class="btn ${variant} ${extra.cls || ''}">${icon}${label}</button>`;

    statesGrid.innerHTML = `
      <div class="state-cell">
        <span class="state-label">Default</span>
        ${make({})}
      </div>
      <div class="state-cell">
        <span class="state-label">Hover</span>
        <button type="button" class="btn ${variant}" data-hover>${icon}${label}</button>
      </div>
      <div class="state-cell">
        <span class="state-label">Focus clavier</span>
        <button type="button" class="btn ${variant} force-focus">${icon}${label}</button>
      </div>
      <div class="state-cell">
        <span class="state-label">Actif / pressé</span>
        ${make({ cls: 'is-active' })}
      </div>
    `;
    // Force-hover style for the demo (since :hover can't be triggered)
    statesGrid.querySelectorAll('[data-hover]').forEach(b => {
      if (variant === 'primary') { b.style.background = T.primaryHover; b.style.borderColor = T.primaryHover; }
      else if (variant === 'accent') { b.style.background = T.accentHover; b.style.borderColor = T.accentHover; }
      else if (variant === 'danger') { b.style.background = '#8A1A24'; b.style.borderColor = '#8A1A24'; }
      else if (variant === 'ghost')  { b.style.background = T.primarySoft; }
    });
  }
  if (variantSeg) {
    paintBtnStates('primary');
    variantSeg.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-v]');
      if (!btn) return;
      variantSeg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      paintBtnStates(btn.dataset.v);
    });
  }

  // ---------- 4. TOC active highlight ----------
  const tocLinks = document.querySelectorAll('.toc a[href^="#"]');
  const sections = [...tocLinks].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  function onScroll() {
    let active = sections[0];
    const y = window.scrollY + 100;
    for (const s of sections) if (s.offsetTop <= y) active = s;
    tocLinks.forEach(a => {
      a.classList.toggle('current', a.getAttribute('href') === '#' + active.id);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- 5. Tabs — pattern ARIA complet (RGAA 7.1) ----------
  // Roving tabindex + activation au clic et au clavier (←/→/Home/End).
  document.querySelectorAll('[role="tablist"]').forEach(list => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    if (!tabs.length) return;

    function select(tab, focus) {
      tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        const panelId = t.getAttribute('aria-controls');
        if (panelId) {
          const panel = document.getElementById(panelId);
          if (panel) panel.hidden = !on;
        }
      });
      if (focus) tab.focus();
    }

    // État initial : l'onglet sélectionné est focusable, les autres non.
    const current = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
    select(current, false);

    list.addEventListener('click', (e) => {
      const t = e.target.closest('[role="tab"]');
      if (t && tabs.includes(t)) select(t, false);
    });

    list.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i === -1) return;
      let next = null;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown': next = tabs[(i + 1) % tabs.length]; break;
        case 'ArrowLeft':
        case 'ArrowUp':   next = tabs[(i - 1 + tabs.length) % tabs.length]; break;
        case 'Home':      next = tabs[0]; break;
        case 'End':       next = tabs[tabs.length - 1]; break;
        default: return;
      }
      e.preventDefault();
      select(next, true);
    });
  });

  // ---------- 6. Groupes segmentés / radios boutons (←/→) ----------
  document.querySelectorAll('.seg[role="radiogroup"]').forEach(group => {
    const opts = [...group.querySelectorAll('button')];
    if (!opts.length) return;
    function press(opt, focus) {
      opts.forEach(o => o.setAttribute('aria-pressed', o === opt ? 'true' : 'false'));
      if (focus) opt.focus();
    }
    group.addEventListener('click', (e) => {
      const o = e.target.closest('button');
      if (o && opts.includes(o)) press(o, false);
    });
    group.addEventListener('keydown', (e) => {
      const i = opts.indexOf(document.activeElement);
      if (i === -1) return;
      let next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = opts[(i + 1) % opts.length];
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = opts[(i - 1 + opts.length) % opts.length];
      else return;
      e.preventDefault();
      next.focus();
      next.click();
    });
  });

})();
