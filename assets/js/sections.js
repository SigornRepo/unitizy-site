/* unitizy.com — modulo sections: sezioni interattive: servizi/scene, metodo, impatto, verticali */

export default {
  initServices() {
    const cards = [...document.querySelectorAll('.svc')];
    const N = cards.length;
    if (this.RM) { cards.forEach(c => { c.style.opacity = '1'; c.style.transform = 'none'; }); }
    else {
      // scomposta entry: outer cards from the sides, inner two from above — never from below
      // [dx, dy, rotate, delay-ms] per card index (0=left … 3=right)
      const START = [
        [-150, -34, -5, 40],   // 0: from the left
        [-34, -168, -2.4, 220], // 1: from the top (slightly left)
        [34, -168, 2.4, 300],   // 2: from the top (slightly right)
        [150, -34, 5, 120]      // 3: from the right
      ];
      cards.forEach(c => {
        const i = +c.dataset.i || 0; const s = START[i] || [0, -120, 0, i * 100];
        c.style.transform = 'translate(' + s[0] + 'px,' + s[1] + 'px) scale(.9) rotate(' + s[2] + 'deg)';
        c.style.opacity = '0';
      });
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) {
        const i = +e.target.dataset.i || 0; const s = START[i] || [0, 0, 0, i * 100];
        e.target.style.transition = 'opacity .6s ease, transform .95s cubic-bezier(.22,1.12,.36,1), border-color .25s';
        e.target.style.transitionDelay = s[3] + 'ms';
        e.target.style.opacity = '1';
        e.target.style.transform = 'none';
        io.unobserve(e.target);
      } }), { threshold: 0.25 });
      cards.forEach(c => io.observe(c)); this.cleanups.push(() => io.disconnect());
    }
    // click-to-expand deep-dive panel
    const panel = this.q('u-svc-detail');
    const blocks = panel ? [...panel.querySelectorAll('.svc-d')] : [];
    // i diagrammi vivono una volta sola, nelle scene: l'accordion li clona a runtime (delay accorciati)
    blocks.forEach(b => {
      const slot = b.querySelector('.sdg[data-clone]');
      const src = document.querySelector('.svc-scene[data-s="' + b.dataset.d + '"] .sdg');
      if (slot && src) {
        const c = src.cloneNode(true);
        c.style.margin = '0 0 8px'; c.style.padding = '14px 16px 6px';
        c.querySelectorAll('[style*="animation-delay"]').forEach(el => { const d = parseFloat(el.style.animationDelay); if (d) el.style.animationDelay = Math.max(0.15, d - 0.3).toFixed(2) + 's'; });
        slot.replaceWith(c);
      }
    });
    this._svcOpen = -1;
    const closePanel = () => {
      this._svcOpen = -1;
      if (panel) { panel.style.maxHeight = '0'; panel.style.opacity = '0'; panel.style.marginTop = '0'; }
      blocks.forEach(b => b.classList.remove('ss-run'));
      cards.forEach(c => { c.dataset.open = '0'; c.style.borderColor = 'var(--line)'; });
    };
    const openPanel = i => {
      if (!panel) return;
      // .ss-run drives the block's diagram; re-add with a reflow so animations restart on every open
      blocks.forEach(b => { const on = +b.dataset.d === i; b.style.display = on ? 'grid' : 'none'; b.classList.remove('ss-run'); if (on) { void b.offsetWidth; b.classList.add('ss-run'); } });
      panel.style.opacity = '1'; panel.style.marginTop = '16px';
      panel.style.maxHeight = (panel.firstElementChild.scrollHeight + 40) + 'px';
      cards.forEach(c => { const on = (+c.dataset.i === i); c.dataset.open = on ? '1' : '0'; c.style.borderColor = on ? 'var(--cy)' : 'var(--line)'; });
      this._svcOpen = i;
    };
    this._svcClose = closePanel;
    cards.forEach(c => {
      c.style.cursor = 'pointer';
      const mv = e => { const r = c.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5; c.style.transition = 'transform .1s ease, border-color .2s'; c.style.transform = `perspective(1000px) rotateY(${px*9}deg) rotateX(${-py*9}deg) translateY(-4px)`; c.style.borderColor = 'rgba(110,139,255,.55)'; };
      const lv = () => { c.style.transition = 'transform .4s var(--ease), border-color .3s'; c.style.transform = 'none'; c.style.borderColor = c.dataset.open === '1' ? 'var(--cy)' : 'var(--line)'; };
      const ck = () => { const i = +c.dataset.i || 0; if (this._svcScrub) { this.jumpSvc(i); } else { if (this._svcOpen === i) closePanel(); else openPanel(i); } };
      c.addEventListener('mousemove', mv); c.addEventListener('mouseleave', lv); c.addEventListener('click', ck);
      this.cleanups.push(() => { c.removeEventListener('mousemove', mv); c.removeEventListener('mouseleave', lv); c.removeEventListener('click', ck); });
    });
  },
  initServicesScroll() {
    const outer = this.q('u-svc-outer'), stage = this.q('u-svc-stage'), panel = this.q('u-svc-detail');
    this._svcScrub = false;
    if (!outer || !stage) return;
    if (this.RM || matchMedia('(max-width:820px)').matches) return; // fallback: click accordion (initServices)
    this._svcScrub = true;
    this._svcCards = [...document.querySelectorAll('.svc')];
    this._svcScenes = [...stage.querySelectorAll('.svc-scene')];
    const SCRUB = 3.6; // extra viewport-heights: overview + 4 full-screen scenes
    this._svcScenes.forEach(s => { s.style.willChange = 'clip-path, transform, opacity'; });
    outer.style.height = 'calc(100vh + ' + (SCRUB * 100) + 'vh)';
    stage.style.position = 'sticky';
    stage.style.top = '0';
    stage.style.height = '100vh';
    stage.style.overflow = 'hidden';
    if (panel) panel.style.display = 'none'; // scenes replace the inline panel on desktop
    // decorative gradient-sweep overlay for the scene transitions
    this._svcScenes.forEach(s => {
      if (!s.querySelector('.ss-shine')) {
        const sh = document.createElement('div');
        sh.className = 'ss-shine';
        sh.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:5;background:linear-gradient(105deg,transparent 38%,rgba(110,139,255,.22) 48%,rgba(168,85,247,.16) 54%,transparent 64%);transform:translateX(-130%)';
        s.appendChild(sh);
      }
    });
    this._svcPhase = -2;
    this.updateSvcScroll();
  },
  updateSvcScroll() {
    if (!this._svcScrub) return;
    const outer = this.q('u-svc-outer'); if (!outer) return;
    const vh = innerHeight;
    const r = outer.getBoundingClientRect();
    const denom = outer.offsetHeight - vh;
    const p = this.clamp(-r.top / (denom || 1), 0, 1);
    const T0 = 0.14; // first stretch: the 4-card overview
    let phase = -1;
    if (p >= T0) phase = Math.min(3, Math.floor((p - T0) / ((1 - T0) / 4 * 0.9999)));
    if (phase === this._svcPhase) return;
    this._svcPhase = phase;
    const ov = this.q('servizi');
    const EASE = 'cubic-bezier(.22,1,.36,1)'; // same curve as --ease (WAAPI can't resolve var())
    if (phase === -1) {
      // back to overview: wipe scenes out, restore the grid
      if (ov) { ov.style.transition = 'transform .5s ' + EASE + ', opacity .5s ease'; ov.style.transform = 'none'; ov.style.opacity = '1'; }
      this._svcScenes.forEach(s => s.classList.remove('ss-run'));
      this._svcScenes.forEach(s => {
        if (s.style.display !== 'none') {
          const a = s.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 420, easing: 'ease', fill: 'forwards' });
          a.onfinish = () => { if (this._svcPhase === -1) s.style.display = 'none'; };
        }
      });
      return;
    }
    if (ov) { ov.style.transition = 'transform .6s ' + EASE + ', opacity .6s ease'; ov.style.transform = 'scale(.96) translateY(-10px)'; ov.style.opacity = '0.12'; }
    const sc = this._svcScenes[phase]; if (!sc) return;
    this._sceneZ = (this._sceneZ || 10) + 1;
    sc.getAnimations().forEach(a => a.cancel());
    sc.style.display = 'block';
    sc.style.zIndex = String(this._sceneZ);
    // restart the scene's diagram animations from zero on every open
    this._svcScenes.forEach(s => { if (s !== sc) s.classList.remove('ss-run'); });
    sc.classList.remove('ss-run'); void sc.offsetWidth; sc.classList.add('ss-run');
    // WOW: the scene morphs open from its module card (rect → full screen)
    let from = 'inset(42% 40% 42% 40%)';
    const card = this._svcCards[phase];
    if (card) {
      const cr = card.getBoundingClientRect(); const vw = innerWidth;
      from = 'inset(' + Math.max(0, cr.top).toFixed(0) + 'px ' + Math.max(0, vw - cr.right).toFixed(0) + 'px ' + Math.max(0, vh - cr.bottom).toFixed(0) + 'px ' + Math.max(0, cr.left).toFixed(0) + 'px)';
    }
    sc.animate([{ clipPath: from, offset: 0 }, { clipPath: 'inset(0px 0px 0px 0px)' }], { duration: 820, easing: EASE, fill: 'forwards' });
    // content settles from a slight zoom for depth
    const inner = sc.firstElementChild;
    if (inner) { inner.getAnimations().forEach(a => a.cancel()); inner.animate([{ transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 1000, easing: EASE, fill: 'both' }); }
    // gradient flash sweeps across the opened scene
    const shine = sc.querySelector('.ss-shine');
    if (shine) shine.animate([{ transform: 'translateX(-130%) skewX(-12deg)' }, { transform: 'translateX(130%) skewX(-12deg)' }], { duration: 950, delay: 160, easing: 'cubic-bezier(.4,0,.2,1)' });
    [...sc.querySelectorAll('.ss-a')].forEach((el, k) => {
      el.animate([{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 240 + k * 110, easing: EASE, fill: 'both' });
    });
    // the covered scene recedes in depth beneath the incoming one
    this._svcScenes.forEach((s, j) => {
      if (j !== phase && s.style.display !== 'none') {
        s.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.94)', opacity: .55 }], { duration: 760, easing: EASE, fill: 'forwards' });
        setTimeout(() => { if (this._svcPhase !== j) { s.getAnimations().forEach(a => a.cancel()); s.style.display = 'none'; } }, 860);
      }
    });
  },
  jumpSvc(i) {
    const outer = this.q('u-svc-outer'); if (!outer) return;
    const d = outer.offsetHeight - innerHeight;
    const T0 = 0.14;
    const target = T0 + (i + 0.5) * ((1 - T0) / 4);
    const y = scrollY + outer.getBoundingClientRect().top + target * d;
    scrollTo({ top: y, behavior: 'smooth' });
  },
  initMetodo() {
    const steps = [...document.querySelectorAll('#metodo .mstep')];
    if (!steps.length) return;
    const N = steps.length;
    if (this.RM) { steps.forEach(s => { s.style.opacity = '1'; s.style.transform = 'none'; }); return; }
    // start: each module displaced outward + tilted, so they converge and lock into the rail
    steps.forEach((s, i) => {
      const dx = (i - (N - 1) / 2) * 82;
      const dy = (i % 2 === 0 ? -1 : 1) * 42;
      const rot = (dx >= 0 ? 1 : -1) * 2.2;
      s.style.transformOrigin = 'center';
      s.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(.92) rotate(' + rot + 'deg)';
      s.style.opacity = '0';
      s.style.willChange = 'transform, opacity';
    });
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) {
      const i = steps.indexOf(e.target);
      const order = Math.min(i, N - 1 - i); // outside-in, so the pieces close into place
      e.target.style.transition = 'opacity .6s ease, transform .95s cubic-bezier(.22,1.12,.36,1)';
      e.target.style.transitionDelay = (order * 110) + 'ms';
      e.target.style.opacity = '1';
      e.target.style.transform = 'none';
      io.unobserve(e.target);
    } }), { threshold: 0.35 });
    steps.forEach(s => io.observe(s)); this.cleanups.push(() => io.disconnect());
  },
  updateMetodo() {
    return;
    const sec = this.q('metodo'); if (!sec) return;
    if (!this.msteps) this.msteps = [...sec.querySelectorAll('.mstep')];
    const r = sec.getBoundingClientRect(); const total = r.height - innerHeight;
    const p = this.clamp((-r.top) / (total || 1), 0, 1);
    const active = this.clamp(Math.floor(p * this.msteps.length * 0.999), 0, this.msteps.length - 1);
    const fill = this.q('u-mrail-fill'); if (fill) fill.style.height = (this.clamp((active + 1) / this.msteps.length, 0, 1) * 100) + '%';
    if (this._mActive !== active) { this._mActive = active; this.msteps.forEach((s, i) => s.classList.toggle('is-active', i === active)); }
    this.msteps.forEach((s, i) => {
      const on = i === active; s.style.opacity = on ? '1' : '0.34'; s.style.transform = on ? 'translateX(0)' : 'translateX(-4px)';
      const deliv = s.querySelector('.mstep-deliv'); if (deliv) { deliv.style.maxHeight = on ? '300px' : '0px'; deliv.style.opacity = on ? '1' : '0'; }
      const dot = s.querySelector('.mstep-dot'); const done = i <= active;
      if (dot) { dot.style.background = done ? 'var(--cy)' : 'var(--bg)'; dot.style.borderColor = done ? 'var(--cy)' : 'var(--dim)'; dot.style.boxShadow = on ? '0 0 16px var(--cy)' : 'none'; dot.style.transform = on ? 'scale(1.25)' : 'scale(1)'; }
    });
  },
  initImpatto() {
    const nums = [...document.querySelectorAll('.u-metric-num')];
    const m = this.metrics(); const map = { hoursReturned: m.hoursReturned, processesAutomated: m.processesAutomated, projectsProduction: m.projectsProduction };
    nums.forEach(el => { el.dataset.target = map[el.dataset.key] ?? 0; });
    const run = el => { const target = +el.dataset.target, suf = el.dataset.suffix || '', dur = this.RM ? 0 : 2000, st = performance.now(); const ease = t => 1 - Math.pow(1 - t, 3); const step = now => { const t = this.RM ? 1 : Math.min((now - st)/dur, 1); el.textContent = Math.round(target*ease(t)).toLocaleString('it-IT') + suf; if (t < 1) { const id = requestAnimationFrame(step); this.rafs.push(id); } }; const id = requestAnimationFrame(step); this.rafs.push(id); };
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: 0.5 });
    nums.forEach(n => io.observe(n)); this.cleanups.push(() => io.disconnect());
    // gradient top-lines sweep in with the counters
    const lines = [...document.querySelectorAll('.u-imp-line')];
    if (lines.length) {
      const lio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { lines.forEach(l => { l.style.transform = 'scaleX(1)'; }); lio.disconnect(); } }), { threshold: 0.4 });
      lio.observe(lines[0]); this.cleanups.push(() => lio.disconnect());
    }
  },
  initCarousel() {
    const wrap = this.q('u-carousel'), track = this.q('u-car-track');
    if (!wrap || !track || track.children.length < 2) return;
    // outlined watermark index on each vertical card (decorative)
    [...track.querySelectorAll('.u-vcard')].forEach(c => {
      if (c.querySelector('.u-vnum')) return;
      const idx = c.querySelector('span');
      const wm = document.createElement('div');
      wm.className = 'u-vnum';
      wm.textContent = idx ? idx.textContent : '';
      wm.style.cssText = 'position:absolute;right:8px;bottom:-16px;font-family:var(--dsp);font-weight:700;font-size:112px;line-height:1;color:transparent;-webkit-text-stroke:1.5px rgba(110,139,255,.15);pointer-events:none;user-select:none';
      c.appendChild(wm);
    });
    let off = 0, period = 1, hover = false, drag = null, target = null, moved = 0;
    const measure = () => { period = track.children[1].offsetLeft - track.children[0].offsetLeft; };
    measure();
    addEventListener('resize', measure);
    this.cleanups.push(() => removeEventListener('resize', measure));
    const speed = () => { const v = +this.props.carouselSpeed; return isFinite(v) && v >= 0 ? v : 45; };
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (drag == null) {
        if (target != null) { const d = target - off; off += d * Math.min(1, dt * 7); if (Math.abs(d) < 0.5) { off = target; target = null; } }
        else if (!hover && !this.RM) off += speed() * dt;
      }
      if (period > 1) { const r = ((off % period) + period) % period; track.style.transform = `translateX(${(-r).toFixed(2)}px)`; }
      this._carRaf = requestAnimationFrame(loop);
    };
    this._carRaf = requestAnimationFrame(loop);
    this.cleanups.push(() => cancelAnimationFrame(this._carRaf));
    wrap.addEventListener('mouseenter', () => { hover = true; });
    wrap.addEventListener('mouseleave', () => { hover = false; });
    wrap.addEventListener('pointerdown', e => { drag = { x: e.clientX, off }; moved = 0; target = null; try { wrap.setPointerCapture(e.pointerId); } catch (err) {} wrap.style.cursor = 'grabbing'; });
    wrap.addEventListener('pointermove', e => { if (drag) { const dx = e.clientX - drag.x; moved = Math.max(moved, Math.abs(dx)); off = drag.off - dx; } });
    const up = () => { drag = null; wrap.style.cursor = 'grab'; };
    wrap.addEventListener('pointerup', up); wrap.addEventListener('pointercancel', up);
    wrap.addEventListener('click', e => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    const card = track.querySelector('.u-vcard');
    const step = dir => { const w = (card ? card.getBoundingClientRect().width : 340) + 18; target = (target == null ? off : target) + dir * w; };
    const pv = this.q('u-car-prev'), nx = this.q('u-car-next');
    if (pv) pv.addEventListener('click', () => step(-1));
    if (nx) nx.addEventListener('click', () => step(1));
  }
};
