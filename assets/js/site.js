/* unitizy.com — motore del sito (classe UnitizySite). Estratto dal monolite il 19/07/2026. */

class UnitizySite {
  constructor(props) { this.props = props; }
  init() {
    this.RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.cleanups = [];
    this.rafs = [];
    this.disposers = [];
    this.applyAccent();
    this.initServices();
    this.initMetodo();
    this.initCursor();
    this.initBurger();
    this.initImpatto();
    this.initPenWrite();
    this.initSectionFx();
    this.setHeroInfo();
    this.initHeroParallax();
    this.initPrimaBg();
    this.initHRide();
    this.initCinema();
    this.initServicesScroll();
    this.initThread();
    this.initCtaFinale();
    this.initScan();
    this.initCarousel();
    this.initFilmBar();
    this._pending = false;
    this._onScroll = () => { if (this._pending) return; this._pending = true; requestAnimationFrame(() => { this._pending = false; this._heroScroll = this.clamp(scrollY / Math.max(1, innerHeight), 0, 1); this.updateHeroTimeline(); this.updateHRide(); this.updateBookOpen(); this.updateScan(); this.updatePrima(); this.updateSpine(); this.updateMetodo(); this.updateSvcScroll(); this.updateSectionFx(); this.updateCinema(); this.updateFilm(); }); };
    addEventListener('scroll', this._onScroll, { passive: true });
    addEventListener('resize', this._onScroll);
    this.cleanups.push(() => { removeEventListener('scroll', this._onScroll); removeEventListener('resize', this._onScroll); });
    this._onScroll();
    this.initSmoothScroll();
    this.waitThree(() => {
      // costruzione scene 3D in idle: non rubare il main thread al primo paint
      const go = () => {
        try { this.buildHero(this.q('u-hero3d')); } catch (e) { console.warn('hero3d', e); }
        try { this.buildHero(this.q('u-cta3d'), true); } catch (e) { console.warn('cta3d', e); }
      };
      (window.requestIdleCallback || (f => setTimeout(f, 180)))(go);
    });
  }

  clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  q(id) { return document.getElementById(id); }
  accentHex() { return this.props.accentColor || '#4C6FFF'; }
  applyAccent() { const r = this.q('u-root'); if (r) { r.style.setProperty('--cy', this.accentHex()); r.style.setProperty('--grad', `linear-gradient(120deg,${this.accentHex()} 0%,#7C3AED 100%)`); } }
  metrics() { const p = this.props || {}; return { wasted: +p.wastedHours || 1240, hoursReturned: +p.hoursReturned || 12400, processesAutomated: +p.processesAutomated || 40, projectsProduction: +p.projectsProduction || 100 }; }
  glowTexture() {
    if (this._glow) return this._glow;
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.22, 'rgba(214,228,255,0.7)'); gr.addColorStop(0.55, 'rgba(150,175,255,0.2)'); gr.addColorStop(1, 'rgba(120,150,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    this._glow = new THREE.CanvasTexture(c); return this._glow;
  }
  envCanvas() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, 256); grad.addColorStop(0, '#c9d6ff'); grad.addColorStop(0.5, '#eef2ff'); grad.addColorStop(1, '#ffffff');
    g.fillStyle = grad; g.fillRect(0, 0, 512, 256);
    const blob = (x, y, r, col) => { const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, 512, 256); };
    blob(150, 60, 130, 'rgba(120,150,255,0.95)'); blob(380, 70, 150, 'rgba(175,110,255,0.85)'); blob(300, 210, 120, 'rgba(255,255,255,0.55)');
    return c;
  }
  penLine(inner, delay) {
    const parent = inner.parentElement; if (!parent) return 0;
    parent.style.position = 'relative'; inner.style.display = 'inline-block'; inner.style.opacity = '1';
    if (this.RM) { inner.style.clipPath = 'none'; return 0; }
    const dur = Math.max(650, Math.min(1700, (inner.textContent || '').length * 22));
    inner.style.clipPath = 'inset(-18% 101% -18% -2%)';
    const nib = document.createElement('span');
    nib.style.cssText = 'position:absolute;top:.06em;left:0;width:3px;height:.9em;border-radius:2px;background:linear-gradient(180deg,var(--cy),var(--vi));box-shadow:0 0 12px var(--cy),0 0 24px rgba(168,85,247,.85);opacity:0;pointer-events:none;z-index:5';
    parent.appendChild(nib);
    const start = performance.now() + (delay || 0);
    const step = (now) => {
      if (now < start) { const id = requestAnimationFrame(step); this.rafs.push(id); return; }
      const t = this.clamp((now - start) / dur, 0, 1);
      const w = inner.offsetWidth || 1;
      inner.style.clipPath = `inset(-18% ${101 * (1 - t)}% -18% -2%)`;
      nib.style.left = (w * t) + 'px'; nib.style.opacity = (t > 0.02 && t < 0.98) ? '1' : '0';
      if (t < 1) { const id = requestAnimationFrame(step); this.rafs.push(id); } else { inner.style.clipPath = 'none'; nib.remove(); }
    };
    const id = requestAnimationFrame(step); this.rafs.push(id);
    return dur;
  }
  sprayLine(inner, delay) {
    const parent = inner.parentElement; if (!parent) return 0;
    parent.style.position = 'relative'; inner.style.display = 'inline-block'; inner.style.opacity = '1';
    if (this.RM) { inner.style.webkitMaskImage = 'none'; inner.style.maskImage = 'none'; return 0; }
    const dur = Math.max(780, Math.min(1900, (inner.textContent || '').length * 27));
    const soft = 11;
    const setMask = (pct) => { const m = `linear-gradient(90deg, #000 ${Math.max(0, pct - soft)}%, rgba(0,0,0,0.4) ${pct}%, transparent ${Math.min(100, pct + soft)}%)`; inner.style.webkitMaskImage = m; inner.style.maskImage = m; };
    setMask(0);
    const noz = document.createElement('span');
    noz.style.cssText = 'position:absolute;top:.02em;left:0;width:16px;height:.94em;pointer-events:none;z-index:6;opacity:0';
    noz.innerHTML = '<span style="position:absolute;left:0;top:50%;transform:translateY(-50%);width:15px;height:6px;border-radius:2px;background:#c9d0e0;box-shadow:0 0 6px rgba(0,0,0,.4)"></span><span style="position:absolute;left:13px;top:50%;transform:translateY(-50%);width:6px;height:11px;border-radius:2px;background:#8a93b5"></span>';
    parent.appendChild(noz);
    const dots = [];
    const start = performance.now() + (delay || 0);
    let lastSpawn = 0;
    const step = (now) => {
      if (now < start) { const id = requestAnimationFrame(step); this.rafs.push(id); return; }
      const t = this.clamp((now - start) / dur, 0, 1);
      const w = inner.offsetWidth || 1, h = inner.offsetHeight || 1;
      const pct = t * 111; const x = w * (pct / 100);
      setMask(pct);
      noz.style.left = (x - 6) + 'px'; noz.style.opacity = (t > 0.01 && t < 0.985) ? '1' : '0';
      if (t < 0.985 && now - lastSpawn > 26) {
        lastSpawn = now; const cnt = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < cnt; i++) { const d = document.createElement('span'); const dy = Math.random() * h; const dx = x + (Math.random() * 30 - 8); const r = 1 + Math.random() * 3.2; const col = Math.random() < 0.5 ? '110,139,255' : '168,85,247'; d.style.cssText = `position:absolute;left:${dx}px;top:${dy}px;width:${r}px;height:${r}px;border-radius:50%;background:rgba(${col},${(0.3 + Math.random() * 0.45).toFixed(2)});filter:blur(.4px);pointer-events:none;z-index:5;transition:opacity .5s ease`; parent.appendChild(d); dots.push({ el: d, born: now }); }
      }
      for (let i = dots.length - 1; i >= 0; i--) { const age = now - dots[i].born; if (age > 90) dots[i].el.style.opacity = '0'; if (age > 640) { dots[i].el.remove(); dots.splice(i, 1); } }
      if (t < 1) { const id = requestAnimationFrame(step); this.rafs.push(id); } else { inner.style.webkitMaskImage = 'none'; inner.style.maskImage = 'none'; noz.remove(); dots.forEach(o => o.el.remove()); }
    };
    const id = requestAnimationFrame(step); this.rafs.push(id);
    return dur;
  }
  initPenWrite() {
    const heroLines = [...document.querySelectorAll('header .u-hl > span')];
    if (!this.initCrystalText(heroLines)) {
      let delay = 250;
      heroLines.forEach(s => { const dur = this.sprayLine(s, delay); delay += dur + 90; });
    }
    const heads = [...document.querySelectorAll('#u-root h2')];
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { this.sprayLine(e.target.__inner, 0); io.unobserve(e.target); } }), { threshold: 0.55 });
    heads.forEach(h => {
      const inner = document.createElement('span'); inner.style.display = 'inline-block'; inner.innerHTML = h.innerHTML;
      h.innerHTML = ''; h.style.position = 'relative'; h.appendChild(inner); h.__inner = inner;
      if (this.RM) { inner.style.clipPath = 'none'; } else { inner.style.opacity = '0'; io.observe(h); }
    });
    this.cleanups.push(() => io.disconnect());
  }
  initCrystalText(lines) {
    // Hero: le parole si formano dalle particelle esplose dal cluster di cristalli.
    // Il testo DOM resta la verità (SEO/a11y): le particelle sono scenografia, poi crossfade.
    const conn = navigator.connection || {};
    if (this.RM || matchMedia('(max-width:820px)').matches || !lines.length || scrollY > innerHeight * 0.4 || conn.saveData || /(^|-)2g/.test(conn.effectiveType || '')) return false;
    const reveal = () => lines.forEach(s => { s.style.transition = 'opacity .55s ease'; s.style.opacity = '1'; });
    const start = () => { try {
      if (document.hidden) { // tab in background: rimanda l'esplosione a quando l'utente guarda
        const onVis = () => { if (!document.hidden) { document.removeEventListener('visibilitychange', onVis); setTimeout(start, 120); } };
        document.addEventListener('visibilitychange', onVis);
        this.cleanups.push(() => document.removeEventListener('visibilitychange', onVis));
        return;
      }
      const vw = innerWidth, vh = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const off = document.createElement('canvas'); off.width = vw; off.height = vh;
      const octx = off.getContext('2d', { willReadFrequently: true });
      const lerpHex = (a, b, t) => {
        const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16));
        const pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
        return 'rgb(' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',') + ')';
      };
      const spans = [];
      lines.forEach(s => {
        const r = s.getBoundingClientRect();
        if (!r.width || r.bottom < 0 || r.top > vh) return;
        const cs = getComputedStyle(s);
        const fs = parseFloat(cs.fontSize);
        octx.font = cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily;
        octx.textBaseline = 'alphabetic';
        octx.fillStyle = '#000';
        octx.fillText(s.textContent, r.left, r.top + (r.height - fs) / 2 + fs * 0.78);
        spans.push({ el: s, r, grad: ((cs.webkitBackgroundClip || '') + (cs.backgroundClip || '')).includes('text') });
      });
      if (!spans.length) { reveal(); return; }
      // campiona solo il rettangolo che contiene il testo, non tutta la viewport
      const bx = Math.max(0, Math.min(...spans.map(s => s.r.left)) | 0), by = Math.max(0, Math.min(...spans.map(s => s.r.top)) | 0);
      const bw = Math.min(vw, Math.max(...spans.map(s => s.r.right)) + 2 | 0) - bx, bh = Math.min(vh, Math.max(...spans.map(s => s.r.bottom)) + 2 | 0) - by;
      const img = octx.getImageData(bx, by, bw, bh).data;
      const pts = [], STEP = 5;
      spans.forEach(sp => {
        const x0 = Math.max(bx, sp.r.left | 0), x1 = Math.min(bx + bw, (sp.r.right + 2) | 0);
        const y0 = Math.max(by, sp.r.top | 0), y1 = Math.min(by + bh, (sp.r.bottom + 2) | 0);
        for (let y = y0; y < y1; y += STEP) for (let x = x0; x < x1; x += STEP) {
          if (img[((y - by) * bw + (x - bx)) * 4 + 3] > 100) pts.push({ tx: x, ty: y, c: sp.grad ? lerpHex('#4C6FFF', '#7C3AED', (x - sp.r.left) / (sp.r.width || 1)) : '#0E1B4D' });
        }
      });
      if (!pts.length) { reveal(); return; }
      while (pts.length > 2400) pts.splice((Math.random() * pts.length) | 0, 1);
      // origine dell'esplosione: il cluster 3D, ora dietro il testo centrato
      const ox = vw * 0.5, oy = vh * 0.42;
      const P = pts.map(p => {
        const a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 300;
        return { tx: p.tx, ty: p.ty, c: p.c, bx: ox + Math.cos(a) * d, by: oy + Math.sin(a) * d * 0.7, delay: (p.tx / vw) * 0.5 + Math.random() * 0.1, curl: (Math.random() - 0.5) * 60, s: 1.6 + Math.random() * 1.6 };
      });
      const cv = document.createElement('canvas');
      cv.width = vw * dpr; cv.height = vh * dpr;
      cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:40;pointer-events:none';
      document.body.appendChild(cv);
      const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
      const T = 2000, t0 = performance.now(), EX = 0.16;
      let revealed = false;
      const eo = t => 1 - Math.pow(1 - t, 3), eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const tick = now => {
        const t = Math.min((now - t0) / T, 1);
        ctx.clearRect(0, 0, vw, vh);
        for (const p of P) {
          let x, y, al;
          if (t < EX) { const k = eo(t / EX); x = ox + (p.bx - ox) * k; y = oy + (p.by - oy) * k; al = k; }
          else {
            const k = Math.min(Math.max((t - EX - p.delay * (1 - EX)) / 0.42, 0), 1);
            const e = eio(k);
            x = p.bx + (p.tx - p.bx) * e + Math.sin(e * Math.PI) * p.curl;
            y = p.by + (p.ty - p.by) * e + Math.sin(e * Math.PI * 2) * p.curl * 0.3;
            al = 1;
          }
          ctx.globalAlpha = al; ctx.fillStyle = p.c; ctx.fillRect(x, y, p.s, p.s);
        }
        if (t > 0.55 && !revealed) { // reveal anticipato: il titolo è l'elemento LCP, non farlo aspettare
          revealed = true; reveal();
          cv.style.transition = 'opacity .6s ease'; cv.style.opacity = '0';
        }
        if (t < 1) { const id = requestAnimationFrame(tick); this.rafs.push(id); }
        else cv.remove();
      };
      const id = requestAnimationFrame(tick); this.rafs.push(id);
      this.cleanups.push(() => cv.remove());
    } catch (e) { console.warn('crystalText', e); reveal(); } };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(start, 150)); else setTimeout(start, 350);
    return true;
  }
  setHeroInfo() { const hi = this.q('u-hero-info'); if (hi) hi.style.display = this.props.heroInfo === false ? 'none' : ''; }
  initHeroParallax() {
    if (this.RM) return;
    const header = document.getElementById('u-hero-pin'); if (!header) return;
    const layers = [...document.querySelectorAll('#u-hero-info .u-flp, #u-hero-content .u-hpar')].map(el => ({ el, d: +el.dataset.depth || 20 }));
    if (!layers.length) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, active = false;
    const mv = e => { const r = header.getBoundingClientRect(); tx = ((e.clientX - r.left) / (r.width || 1) - 0.5); ty = ((e.clientY - r.top) / (r.height || 1) - 0.5); };
    const io = new IntersectionObserver(es => { active = es[0].isIntersecting; }, { threshold: 0 });
    io.observe(header);
    addEventListener('pointermove', mv, { passive: true });
    const loop = () => {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      if (active) layers.forEach(l => { l.el.style.transform = `translate3d(${(-cx * l.d).toFixed(2)}px, ${(-cy * l.d).toFixed(2)}px, 0)`; });
      this._parRaf = requestAnimationFrame(loop); this.rafs.push(this._parRaf);
    };
    loop();
    this.cleanups.push(() => { removeEventListener('pointermove', mv); io.disconnect(); });
  }
  initPrimaBg() {
    const bg = this.q('u-prima-bg'); if (!bg) return;
    const u = (this.props.primaVideoUrl || '').trim();
    if (u) { bg.innerHTML = ''; bg.src = u; }
    bg.muted = true; bg.loop = true; bg.play().catch(() => {});
    bg.addEventListener('ended', () => { try { bg.currentTime = 0; bg.play(); } catch (e) {} });
    let last = 0, lastAt = performance.now();
    bg.addEventListener('timeupdate', () => { const n = performance.now(); if (bg.currentTime > last + 0.01) { last = bg.currentTime; lastAt = n; } });
    const wd = setInterval(() => { if (!bg.paused && bg.currentTime > 1 && (performance.now() - lastAt) > 700) { try { bg.currentTime = 0; last = 0; lastAt = performance.now(); bg.play(); } catch (e) {} } }, 500);
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) bg.play().catch(() => {}); else bg.pause(); }), { threshold: 0.05 });
    io.observe(bg); this.cleanups.push(() => { io.disconnect(); clearInterval(wd); });
  }
  initSmoothScroll() {
    if (this.RM) return;
    let n = 0;
    const t = () => {
      if (window.Lenis) {
        const lenis = new Lenis({ duration: 1.05, smoothWheel: true, touchMultiplier: 1.4 });
        lenis.on('scroll', (e) => { this._scrollVel = (e && e.velocity) || 0; if (this._onScroll) this._onScroll(); });
        const raf = (time) => { lenis.raf(time); this._lenisRaf = requestAnimationFrame(raf); };
        this._lenisRaf = requestAnimationFrame(raf);
        this._lenis = lenis;
        document.querySelectorAll('a[href^="#"]').forEach(a => { const h = a.getAttribute('href'); if (h && h.length > 1) a.addEventListener('click', (ev) => { const el = document.getElementById(h.slice(1)); if (el) { ev.preventDefault(); lenis.scrollTo(el, { offset: -72 }); } }); });
        this.cleanups.push(() => { cancelAnimationFrame(this._lenisRaf); try { lenis.destroy(); } catch (e) {} });
      } else if (n++ < 120) { setTimeout(t, 60); }
    };
    t();
  }
  initSectionFx() { this.fxTargets = [...document.querySelectorAll('.u-fx')].filter(el => !el.closest('.u-book') && !el.closest('.u-scan')); this.fxTargets.forEach(el => { el.style.transition = 'none'; }); }
  initHRide() {
    const ride = this.q('u-hride'), pin = this.q('u-hride-pin'), track = this.q('u-hride-track');
    if (!ride || !track) return;
    const mobile = matchMedia('(max-width: 820px)').matches;
    const bookMode = true;
    if (mobile || this.RM || bookMode) { pin.style.position = 'static'; pin.style.height = 'auto'; pin.style.overflow = 'visible'; track.style.display = 'block'; track.style.transform = 'none'; this.initBookOpen(); return; }
    const slides = [...track.children];
    const HW = () => { const H = innerHeight, W = innerWidth; pin.style.height = H + 'px'; slides.forEach(s => { s.style.flex = '0 0 ' + W + 'px'; s.style.width = W + 'px'; s.style.height = H + 'px'; s.style.overflow = 'hidden'; s.style.display = 'flex'; s.style.flexDirection = 'column'; s.style.justifyContent = 'center'; }); };
    HW(); addEventListener('resize', HW); this.cleanups.push(() => removeEventListener('resize', HW));
    const tl = ride.querySelector('#u-tline'); if (tl) { const ts = tl.closest('section'); if (ts) ts.style.display = 'none'; }
    const sp = ride.querySelector('#u-spine'); if (sp) sp.style.display = 'none';
    const bg = this.q('u-prima-bg'); if (bg) { const kick = () => { if (bg.paused) bg.play().catch(() => {}); }; kick(); const iv = setInterval(kick, 800); this.cleanups.push(() => clearInterval(iv)); }
    this._hSlides = slides.length;
    ride.style.height = (slides.length * 70) + 'vh';
    this._hTrack = track; this._hRide = ride;
    if (this.fxTargets) this.fxTargets = this.fxTargets.filter(el => !ride.contains(el) || (el.style.opacity = '', el.style.transform = '', el.style.filter = '', false));
  }
  updateHRide() {
    if (!this._hTrack || !this._hRide) return;
    const r = this._hRide.getBoundingClientRect(); const total = r.height - innerHeight;
    const p = this.clamp((-r.top) / (total || 1), 0, 1);
    const cv = this.q('u-hero3d'); if (cv) cv.style.opacity = String(this.clamp((r.bottom - innerHeight * 0.15) / (innerHeight * 0.45), 0, 1));
    const n = this._hSlides - 1;
    const seg = p * n; const si = Math.min(Math.floor(seg), n - 1); const f = seg - si;
    const hold = 0.38; let ft = f <= hold ? 0 : (f - hold) / (1 - hold);
    ft = ft < .5 ? 4*ft*ft*ft : 1 - Math.pow(-2*ft+2, 3)/2;
    const x = Math.min(si + ft, n);
    this._hTrack.style.transform = `translateX(${(-x * innerWidth).toFixed(1)}px)`;
    [...this._hTrack.children].forEach((s, i) => { const inner = s.querySelector('.u-fx') || s.querySelector('#u-hero-content'); if (inner) { const d = i - x; inner.style.transform = `translateX(${(d * 5).toFixed(2)}vw)`; inner.style.opacity = String(this.clamp(1 - Math.abs(d) * 0.85, 0, 1)); inner.style.filter = Math.abs(d) > 0.04 ? `blur(${(Math.abs(d) * 3).toFixed(1)}px)` : 'none'; } });
    const num = this.q('u-waste-num'); if (num) num.textContent = Math.round(this.metrics().wasted * this.clamp((seg - 0.55) / 0.95, 0, 1)).toLocaleString('it-IT');
  }
  updateHeroTimeline() {
    const doc = document.documentElement;
    const p = this.clamp(scrollY / Math.max(1, doc.scrollHeight - innerHeight), 0, 1);
    this.heroT = p;
    const ph = (a, b, c, d) => p < a ? 0 : p < b ? (p - a) / (b - a) : p < c ? 1 : p < d ? 1 - (p - c) / (d - c) : 0;
    const info = this.q('u-hero-info'); if (info) info.style.opacity = this.clamp(1 - p / 0.1, 0, 1).toFixed(3);
    const clim = this.q('u-hero-climax'); if (clim) clim.style.opacity = ph(0.74, 0.86, 1, 1).toFixed(3);
    const hint = this.q('u-hero-hint'); if (hint) hint.style.opacity = this.clamp(1 - p / 0.06, 0, 1).toFixed(3);
  }
  updateSectionFx() {
    if (!this.fxTargets) return;
    const mode = this.props.scrollFx || 'Cinematico';
    if (this.RM || mode === 'Off') { this.fxTargets.forEach(el => { el.style.opacity = ''; el.style.transform = ''; el.style.filter = ''; el.style.willChange = ''; }); return; }
    const k = mode === 'Morbido' ? 0.5 : 1; const vh = innerHeight;
    this.fxTargets.forEach(el => {
      const r = el.getBoundingClientRect();
      const pIn = this.clamp((vh * 0.92 - r.top) / (vh * 0.5), 0, 1);
      const pOut = this.clamp((r.bottom - vh * 0.06) / (vh * 0.34), 0, 1);
      const ez = q => q < .5 ? 4*q*q*q : 1 - Math.pow(-2*q+2, 3)/2;
      const eIn = ez(pIn), eOut = ez(pOut);
      const e = eIn * eOut, g = 1 - eIn, go = 1 - eOut;
      const cin = this._cinema && this._cinema.length;
      el.style.transformOrigin = '50% 60%';
      el.style.opacity = (0.03 + 0.97 * e).toFixed(3);
      el.style.visibility = e < 0.05 ? 'hidden' : ''; // quasi invisibile = fuori da paint e audit contrasto
      el.style.transform = `perspective(1300px) translateY(${(cin ? 0 : g*90*k).toFixed(1)}px) translateZ(${(-g*330*k + (cin ? 0 : go*150*k)).toFixed(1)}px) rotateX(${(cin ? 0 : g*13*k).toFixed(2)}deg)`;
      el.style.filter = e < 0.99 ? `blur(${((g*9 + go*7)*k).toFixed(1)}px) saturate(${(0.6+0.4*e).toFixed(2)})` : 'none';
      el.style.pointerEvents = e < 0.4 ? 'none' : '';
      el.style.willChange = 'transform,opacity,filter';
    });
  }
  waitThree(cb) {
    let n = 0;
    const t = () => {
      if (window.THREE && THREE.WebGLRenderer && THREE.Sprite) cb();
      else if (n++ < 400) setTimeout(t, 60);
      else console.warn('[unitizy] three.js non caricato');
    };
    t();
  }

  // Shared 3D crystal + node network + panels. cta=true → calmer, fewer elements, assembled.
  buildHero(canvas, cta) {
    if (!canvas || !window.THREE) return;
    const T = THREE;
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, matchMedia('(max-width:820px)').matches ? 1.5 : 1.8));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    const scene = new T.Scene();
    scene.fog = new T.FogExp2(0xffffff, cta ? 0.02 : 0.03);
    try { const eqTex = new T.CanvasTexture(this.envCanvas()); eqTex.mapping = T.EquirectangularReflectionMapping; const pmrem = new T.PMREMGenerator(renderer); pmrem.compileEquirectangularShader(); scene.environment = pmrem.fromEquirectangular(eqTex).texture; eqTex.dispose(); pmrem.dispose(); } catch (e) { console.warn('env', e); }
    const camera = new T.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.3, 9.4);
    // (core three only — no post-processing / environment addons)
    scene.add(new T.AmbientLight(0xdde4f5, 0.9));
    const l1 = new T.PointLight(0x6E8BFF, 60, 40); l1.position.set(4, 4, 6); scene.add(l1);
    const l2 = new T.PointLight(0xA855F7, 45, 40); l2.position.set(-5, -2, 4); scene.add(l2);

    const root = new T.Group(); root.position.x = cta ? -0.6 : 0; scene.add(root);
    const acc = new T.Color(this.accentHex());
    const vio = new T.Color(0xA855F7);

    // crystal
    const cg = new T.BoxGeometry(3.0, 3.0, 0.4);
    const cmat = new T.MeshStandardMaterial({ color: 0x18223f, metalness: 0.75, roughness: 0.35, envMapIntensity: 1.8, emissive: new T.Color(0x16224a), emissiveIntensity: 0.8, transparent: true, opacity: 1 });
    const crystal = new T.Group(); const body = new T.Mesh(cg, cmat); crystal.add(body); root.add(crystal); crystal.rotation.x = -0.5;
    const edges = new T.LineSegments(new T.EdgesGeometry(cg), new T.LineBasicMaterial({ color: 0x2A3D8F, transparent: true, opacity: 0.7 })); body.add(edges);
    const pinMat = new T.MeshStandardMaterial({ color: 0x93A0C9, metalness: 0.92, roughness: 0.28, envMapIntensity: 1.5, transparent: true });
    for (let s = 0; s < 4; s++) { for (let i = 0; i < 9; i++) { const pin = new T.Mesh(new T.BoxGeometry(0.16, 0.36, 0.1), pinMat); const off = (i - 4) * 0.32; if (s < 2) { pin.position.set(off, s ? -1.66 : 1.66, 0); } else { pin.position.set(s === 2 ? -1.66 : 1.66, off, 0); pin.rotation.z = Math.PI / 2; } crystal.add(pin); } }
    const traceMat = new T.LineBasicMaterial({ color: 0x3B5BDB, transparent: true, opacity: 0, blending: T.NormalBlending, depthWrite: false });
    const tarr = []; const seg = (x1, y1, x2, y2) => tarr.push(x1, y1, 0.22, x2, y2, 0.22);
    seg(0,0,0,1.35); seg(0,1.35,0.95,1.35); seg(0,0,-1.25,0); seg(-1.25,0,-1.25,0.85); seg(0,0,0.75,-0.65); seg(0.75,-0.65,0.75,-1.35); seg(0,0,1.15,0.45); seg(1.15,0.45,1.45,0.45); seg(0,0,-0.6,-1.1); seg(-0.6,-1.1,-0.6,-1.4);
    const tg2 = new T.BufferGeometry(); tg2.setAttribute('position', new T.Float32BufferAttribute(tarr, 3));
    const traces = new T.LineSegments(tg2, traceMat); crystal.add(traces);
    const core = new T.Mesh(new T.BoxGeometry(0.85, 0.85, 0.16), new T.MeshStandardMaterial({ color: 0x141d38, emissive: new T.Color(0x6E8BFF), emissiveIntensity: 0.15, metalness: 0.6, roughness: 0.3, transparent: true })); core.position.z = 0.22; crystal.add(core);
    const shock = new T.Mesh(new T.SphereGeometry(1, 24, 24), new T.MeshBasicMaterial({ color: 0xa9c4ff, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false })); shock.visible = false; root.add(shock);
    let burstT = 999, lastBurst = -1;
    // (pedestal rings removed)

    // nodes + curves
    const nodePos = cta
      ? [[-2.6,1.3,-0.6],[2.7,1.5,-0.4],[-2.9,-1.1,0.4],[2.8,-1.0,-0.8],[0,2.3,-1.0]]
      : [[-3.0,1.6,-1.0],[3.1,1.9,-0.6],[-3.4,-1.4,0.4],[3.3,-1.2,-1.2],[-1.8,2.5,1.2],[2.0,-2.3,1.0],[0.2,3.0,-1.6],[-0.4,-3.0,-0.8]];
    const nodes = [], tubes = [], pulses = [];
    const nmat = new T.MeshStandardMaterial({ color: 0x0, emissive: acc, emissiveIntensity: 2.2, metalness: 0.3, roughness: 0.4 });
    const nmatV = new T.MeshStandardMaterial({ color: 0x0, emissive: vio, emissiveIntensity: 2.2, metalness: 0.3, roughness: 0.4 });
    nodePos.forEach((p, i) => {
      const geo = i % 3 === 0 ? new T.BoxGeometry(0.2, 0.2, 0.2) : new T.IcosahedronGeometry(0.13, 0);
      const m = new T.Mesh(geo, i % 2 ? nmatV : nmat);
      const target = new T.Vector3(p[0], p[1], p[2]);
      m.userData = { target, start: new T.Vector3((Math.random()-0.5)*10, (Math.random()-0.5)*8, (Math.random()-0.5)*6) };
      m.position.copy(cta ? target : m.userData.start);
      root.add(m); nodes.push(m);
      const end = new T.Vector3(p[0]*0.24, p[1]*0.24, p[2]*0.24);
      const mid = target.clone().lerp(end, 0.5).add(new T.Vector3((Math.random()-0.5)*1.4, (Math.random()-0.5)*1.4, (Math.random()-0.5)*1.4));
      const curve = new T.QuadraticBezierCurve3(target, mid, end);
      const tube = new T.Mesh(new T.TubeGeometry(curve, 24, 0.014, 6, false), new T.MeshBasicMaterial({ color: (i%2?vio:acc), transparent: true, opacity: cta ? 0.5 : 0 }));
      root.add(tube); tubes.push({ tube, curve });
      const pm = new T.Mesh(new T.SphereGeometry(0.055, 10, 10), new T.MeshBasicMaterial({ color: 0x16205C }));
      root.add(pm); pulses.push({ mesh: pm, curve, phase: Math.random(), node: m, ni: i });
    });

    // transient "new connections" spawned when a pulse bursts a node
    const links = [];
    for (let i = 0; i < 8; i++) { const lg = new T.BufferGeometry(); lg.setAttribute('position', new T.BufferAttribute(new Float32Array(6), 3)); const ln = new T.Line(lg, new T.LineBasicMaterial({ color: 0x4C6FFF, transparent: true, opacity: 0, blending: T.NormalBlending, depthWrite: false })); ln.visible = false; root.add(ln); links.push({ ln, t: 999, a: new T.Vector3(), b: new T.Vector3() }); }
    let linkIdx = 0;
    const SPP = 16; const sparks = [];
    for (let i = 0; i < 6; i++) { const sg = new T.BufferGeometry(); const sarr = new Float32Array(SPP * 3); sg.setAttribute('position', new T.BufferAttribute(sarr, 3)); const spts = new T.Points(sg, new T.PointsMaterial({ color: 0x4C6FFF, size: 0.1, transparent: true, opacity: 0, blending: T.NormalBlending, depthWrite: false })); spts.visible = false; root.add(spts); sparks.push({ pts: spts, pos: sarr, vel: new Float32Array(SPP * 3), t: 999 }); }
    let sparkIdx = 0;
    const pLinks = [];
    for (let i = 0; i < 14; i++) { const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(6), 3)); const ln = new T.Line(g, new T.LineBasicMaterial({ color: 0x3B5BDB, transparent: true, opacity: 0, blending: T.NormalBlending, depthWrite: false })); ln.visible = false; root.add(ln); pLinks.push(ln); }
    let pIdx = 0;
    let disint = null;
    if (!cta) {
      const DN = 2600; const darr = new Float32Array(DN * 3); const ddir = [];
      for (let i = 0; i < DN; i++) { const edge = Math.random() < 0.4; let bx, by; if (edge) { const s = Math.floor(Math.random() * 4); const o = (Math.random() - 0.5) * 3.0; if (s < 2) { bx = o; by = (s ? -1.5 : 1.5); } else { bx = (s === 2 ? -1.5 : 1.5); by = o; } } else { bx = (Math.random() - 0.5) * 2.9; by = (Math.random() - 0.5) * 2.9; } const bz = (Math.random() - 0.5) * 0.36; darr[i*3] = bx; darr[i*3+1] = by; darr[i*3+2] = bz; const th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1); ddir.push([Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)]); }
      const dg = new T.BufferGeometry(); dg.setAttribute('position', new T.BufferAttribute(darr, 3));
      const dpts = new T.Points(dg, new T.PointsMaterial({ color: 0x3B5BDB, size: 0.06, map: this.glowTexture(), alphaTest: 0.02, transparent: true, opacity: 0, blending: T.NormalBlending, depthWrite: false })); dpts.visible = false; crystal.add(dpts);
      disint = { pts: dpts, arr: darr, base: darr.slice(), dir: ddir, geo: dg };
    }

    // glass panels (hero only)
    const panels = [];
    if (!cta) {
      const P = [[-2.6,0.4,-1.8,2.4,1.5,0.3],[2.7,0.9,-2.0,2.0,1.3,-0.4],[-2.2,-1.5,0.7,1.8,1.1,0.2],[2.5,-0.6,0.9,1.7,1.2,-0.3],[0.1,1.9,-2.6,2.6,1.6,0.1]];
      P.forEach(pp => {
        const g = new T.BoxGeometry(pp[3], pp[4], 0.05);
        const m = new T.MeshPhysicalMaterial({ color: 0x9fb4ff, metalness: 0, roughness: 0.06, transmission: 1, thickness: 0.5, ior: 1.45, transparent: true, envMapIntensity: 1.5, side: T.DoubleSide });
        const mesh = new T.Mesh(g, m); mesh.rotation.z = pp[5]; mesh.rotation.y = pp[5] * 0.5;
        const target = new T.Vector3(pp[0], pp[1], pp[2]);
        mesh.userData = { target, start: new T.Vector3((Math.random()-0.5)*12, (Math.random()-0.5)*9, pp[2]-3), phase: Math.random()*6.28, baseY: pp[1] };
        mesh.position.copy(mesh.userData.start);
        const el = new T.LineSegments(new T.EdgesGeometry(g), new T.LineBasicMaterial({ color: 0x5468B8, transparent: true, opacity: 0.35 })); mesh.add(el);
        root.add(mesh); panels.push(mesh);
      });
    }

    // ambient starfield
    const N = cta ? 500 : 800; const pos = new Float32Array(N*3);
    for (let i = 0; i < N; i++) { pos[i*3]=(Math.random()-0.5)*24; pos[i*3+1]=(Math.random()-0.5)*16; pos[i*3+2]=(Math.random()-0.5)*14; }
    const pts = new T.Points(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(pos,3)), new T.PointsMaterial({ color: 0x8FA3DE, size: 0.03, transparent: true, opacity: 0.5, blending: T.NormalBlending, depthWrite: false }));
    scene.add(pts);

    // additive glow halos (bloom substitute — core three only)
    const glowTex = this.glowTexture();
    const mkGlow = (parent, color, scale) => { const s = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: color, blending: T.AdditiveBlending, transparent: true, depthWrite: false })); s.scale.setScalar(scale); parent.add(s); return s; };
    mkGlow(crystal, 0xaec2ff, 2.6);
    nodes.forEach((m, i) => mkGlow(m, i % 2 ? 0xc79bff : 0x9fb6ff, 1.0));
    pulses.forEach(p => mkGlow(p.mesh, 0xffffff, 0.55));

    let W = 1, H = 1;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const w = Math.max(1, r.width), h = Math.max(1, r.height);
      // su mobile la barra URL fa oscillare l'altezza a ogni scroll: ridimensionare qui = sfarfallio.
      // Ignora i cambi di sola altezza sotto i 140px (la rotazione schermo cambia anche la larghezza)
      if (W && Math.abs(w - W) < 2 && Math.abs(h - H) < 140) return;
      W = w; H = h; renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas); this.cleanups.push(() => ro.disconnect());

    // parallax
    const host = canvas.closest('section') || canvas.parentElement;
    let mx = 0, my = 0, tmx = 0, tmy = 0;
    if (!this.RM) { const mv = e => { const r = canvas.getBoundingClientRect(); tmx = ((e.clientX - r.left) / r.width - 0.5); tmy = ((e.clientY - r.top) / r.height - 0.5); }; host.addEventListener('mousemove', mv); this.cleanups.push(() => host.removeEventListener('mousemove', mv)); }

    let inView = false;
    const io = new IntersectionObserver(es => es.forEach(e => { inView = e.isIntersecting; }), { threshold: 0.01 });
    io.observe(canvas); this.cleanups.push(() => io.disconnect());

    const clock = new T.Clock();
    let intro = 0;
    const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
    const animate = () => {
      const dt = clock.getDelta(); const el = clock.elapsedTime;
      if (inView || this.RM) {
        if (this._introStart == null) this._introStart = el;
        intro = (cta || this.RM) ? 1 : this.clamp((el - this._introStart - 0.25) / 2.4, 0, 1);
        const e = ease(intro);
        crystal.scale.setScalar(cta ? (0.2 + 0.8 * e) : 1);
        crystal.rotation.x = -0.5 + Math.sin(el * 0.3) * 0.05; crystal.rotation.y = (cta ? el * 0.5 : mx * 0.4 + Math.sin(el * 0.22) * 0.12);
        core.scale.setScalar(1 + Math.sin(el * 2.4) * 0.06);
        nodes.forEach((m, i) => { if (!cta) m.position.lerpVectors(m.userData.start, m.userData.target, e); m.rotation.x += dt * 0.6; m.rotation.y += dt * 0.5; const fl = m.userData.flash || 0; m.scale.setScalar(1 + fl * 2.0); if (fl > 0) m.userData.flash = Math.max(0, fl - dt * 2.6); });
        tubes.forEach((t, i) => { t.tube.material.opacity = (cta ? 0.5 : 0.5 * e); });
        pulses.forEach(p => {
          const u = (el * 0.22 + p.phase) % 1;
          const pt = p.curve.getPoint(1 - u); p.mesh.position.copy(pt); p.mesh.visible = intro > 0.6;
          if (p.prevU !== undefined && p.prevU < 0.96 && u >= 0.96 && intro > 0.6) {
            p.node.userData.flash = 1;
            const L = links[linkIdx = (linkIdx + 1) % links.length];
            L.a.copy(p.node.position); L.b.copy(nodes[(p.ni + 2 + Math.floor(Math.random() * (nodes.length - 2))) % nodes.length].position); L.t = 0;
            const pos = L.ln.geometry.attributes.position; pos.setXYZ(0, L.a.x, L.a.y, L.a.z); pos.setXYZ(1, L.a.x, L.a.y, L.a.z); pos.needsUpdate = true; L.ln.visible = true;
            const S = sparks[sparkIdx = (sparkIdx + 1) % sparks.length]; S.t = 0; S.pts.visible = true; S.pts.material.opacity = 1;
            for (let k = 0; k < SPP; k++) { S.pos[k*3] = L.a.x; S.pos[k*3+1] = L.a.y; S.pos[k*3+2] = L.a.z; const th = Math.random()*6.283, ph = Math.acos(2*Math.random()-1), sv = 1.8 + Math.random()*2.6; S.vel[k*3] = Math.sin(ph)*Math.cos(th)*sv; S.vel[k*3+1] = Math.sin(ph)*Math.sin(th)*sv; S.vel[k*3+2] = Math.cos(ph)*sv; }
            S.pts.geometry.attributes.position.needsUpdate = true;
            const PL = pLinks[pIdx = (pIdx + 1) % pLinks.length]; const pp = PL.geometry.attributes.position; pp.setXYZ(0, L.a.x, L.a.y, L.a.z); pp.setXYZ(1, L.b.x, L.b.y, L.b.z); pp.needsUpdate = true; PL.visible = true; PL.material.opacity = 0.22;
          }
          p.prevU = u;
        });
        links.forEach(L => { if (L.t < 1.25) { L.t += dt; const d = this.clamp(L.t / 0.35, 0, 1); const f = this.clamp((L.t - 0.45) / 0.8, 0, 1); const px = L.a.x + (L.b.x - L.a.x) * d, py = L.a.y + (L.b.y - L.a.y) * d, pz = L.a.z + (L.b.z - L.a.z) * d; const pos = L.ln.geometry.attributes.position; pos.setXYZ(1, px, py, pz); pos.needsUpdate = true; L.ln.material.opacity = (1 - f) * 0.85; } else if (L.ln.visible) { L.ln.visible = false; } });
        sparks.forEach(S => { if (S.t < 0.75) { S.t += dt; for (let k = 0; k < SPP; k++) { S.pos[k*3] += S.vel[k*3]*dt; S.pos[k*3+1] += S.vel[k*3+1]*dt; S.pos[k*3+2] += S.vel[k*3+2]*dt; S.vel[k*3] *= 0.93; S.vel[k*3+1] *= 0.93; S.vel[k*3+2] *= 0.93; } S.pts.geometry.attributes.position.needsUpdate = true; S.pts.material.opacity = Math.max(0, 1 - S.t/0.75); } else if (S.pts.visible) S.pts.visible = false; });
        cmat.emissiveIntensity = 0.22;
        const spp = 0; const spread = 1 + spp * 1.1;
        panels.forEach((m, i) => { m.position.lerpVectors(m.userData.start, m.userData.target, e); m.position.x = m.position.x * spread + Math.sign(m.userData.target.x || 1) * spp * 1.6; m.position.y = (m.userData.baseY * e + Math.sin(el * 0.6 + m.userData.phase) * 0.12) * spread; m.rotation.y += dt * (0.06 + spp * 0.5); m.rotation.z += dt * spp * 0.4; });
        pts.rotation.y += dt * 0.01;
        mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
        const cx = root.position.x; const asm = cta ? 1 : intro;
        root.rotation.y = mx * 0.25; root.rotation.x = -my * 0.12;
        camera.position.set(mx * 0.5, 0.3 - my * 0.5, cta ? 9.5 : 10.5); camera.lookAt(cx, 0, 0);
        if (!cta && disint) {
          if (asm < 0.99) { disint.pts.visible = true; const a = disint.arr, b = disint.base, dr = disint.dir; const spread = (1 - asm) * 1.7; for (let i = 0; i < b.length; i += 3) { const d = dr[i / 3]; a[i] = b[i] + d[0] * spread; a[i + 1] = b[i + 1] + d[1] * spread; a[i + 2] = b[i + 2] + d[2] * spread; } disint.geo.attributes.position.needsUpdate = true; disint.pts.material.opacity = this.clamp((0.95 - asm) / 0.4, 0, 1) * 0.5 + 0.55; } else disint.pts.visible = false;
          const cvis = this.clamp((asm - 0.18) / 0.45, 0, 1); cmat.opacity = cvis; edges.material.opacity = 0.6 + cvis * 0.3; pinMat.opacity = this.clamp((asm - 0.12) / 0.4, 0, 1); core.material.opacity = cvis;
          const ign = this.clamp((asm - 0.72) / 0.28, 0, 1); traceMat.opacity = 0.3 + ign * 0.7; traceMat.color.setRGB(0.30 - 0.20 * ign, 0.44 - 0.30 * ign, 1 - 0.35 * ign); core.material.emissiveIntensity = 0.3 + ign * 2.6;
        }
        if (!cta) { const rd = this.q('impatto') || this.q('u-hride'); if (rd) { const rb = rd.getBoundingClientRect().bottom; renderer.domElement.style.opacity = String(this.clamp((rb - innerHeight * 0.15) / (innerHeight * 0.45), 0, 1)); } }
        renderer.render(scene, camera);
      }
      if (!this.RM) { const id = requestAnimationFrame(animate); this.rafs.push(id); }
    };
    if (this.RM) { intro = 1; nodes.forEach(m => m.position.copy(m.userData.target)); panels.forEach(m => { m.position.copy(m.userData.target); m.position.y = m.userData.baseY; }); crystal.scale.setScalar(1); tubes.forEach(t => t.tube.material.opacity = 0.5); renderer.render(scene, camera); }
    else { const id = requestAnimationFrame(animate); this.rafs.push(id); }
    this.disposers.push(() => { renderer.dispose(); });
  }


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
  }
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
  }
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
  }
  jumpSvc(i) {
    const outer = this.q('u-svc-outer'); if (!outer) return;
    const d = outer.offsetHeight - innerHeight;
    const T0 = 0.14;
    const target = T0 + (i + 0.5) * ((1 - T0) / 4);
    const y = scrollY + outer.getBoundingClientRect().top + target * d;
    scrollTo({ top: y, behavior: 'smooth' });
  }
  initBurger() {
    const b = this.q('u-burger'), m = this.q('u-mmenu'); if (!b || !m) return;
    const spans = b.querySelectorAll('span');
    const links = [...m.querySelectorAll('.u-mlink')];
    let open = false;
    const set = (o) => {
      open = o;
      b.setAttribute('aria-label', o ? 'Chiudi menu' : 'Apri menu');
      m.style.opacity = o ? '1' : '0';
      m.style.pointerEvents = o ? 'auto' : 'none';
      document.documentElement.style.overflow = o ? 'hidden' : '';
      if (spans[0]) spans[0].style.transform = o ? 'translateY(7px) rotate(45deg)' : 'none';
      if (spans[1]) spans[1].style.opacity = o ? '0' : '1';
      if (spans[2]) spans[2].style.transform = o ? 'translateY(-7px) rotate(-45deg)' : 'none';
      links.forEach((l, i) => { l.style.transitionDelay = o ? (70 + i * 55) + 'ms' : '0ms'; l.style.opacity = o ? '1' : '0'; l.style.transform = o ? 'none' : 'translateY(14px)'; });
    };
    const onB = () => set(!open);
    b.addEventListener('click', onB);
    const closers = links.map(l => { const h = () => set(false); l.addEventListener('click', h); return () => l.removeEventListener('click', h); });
    this.cleanups.push(() => { b.removeEventListener('click', onB); closers.forEach(f => f()); document.documentElement.style.overflow = ''; });
  }
  initCursor() {
    if (this.RM || matchMedia('(pointer:coarse)').matches) return;
    const ring = document.createElement('div'), dot = document.createElement('div');
    const base = 'position:fixed;left:0;top:0;z-index:9999;pointer-events:none;border-radius:50%;transform:translate(-50%,-50%);opacity:0';
    dot.style.cssText = base + ';width:6px;height:6px;background:var(--cy)';
    ring.style.cssText = base + ';width:34px;height:34px;border:1.5px solid rgba(110,139,255,.6);transition:width .22s ease,height .22s ease,background .22s ease,border-color .22s ease,opacity .25s ease';
    // il cursore di sistema resta visibile (a11y): l'anello è solo un accento che lo segue
    document.body.appendChild(ring);
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, shown = false;
    const move = e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      if (!shown) { shown = true; ring.style.opacity = '1'; dot.style.opacity = '1'; }
    };
    const over = e => {
      const hit = e.target.closest && e.target.closest('a,button,.svc,.u-vcard,input,textarea,select,[role=button]');
      if (hit) { ring.style.width = '56px'; ring.style.height = '56px'; ring.style.borderColor = 'transparent'; ring.style.background = 'rgba(110,139,255,.14)'; }
      else { ring.style.width = '34px'; ring.style.height = '34px'; ring.style.borderColor = 'rgba(110,139,255,.6)'; ring.style.background = 'transparent'; }
    };
    const leave = () => { ring.style.opacity = '0'; dot.style.opacity = '0'; shown = false; };
    addEventListener('mousemove', move); addEventListener('mouseover', over); document.addEventListener('mouseleave', leave);
    const loop = () => { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)'; const id = requestAnimationFrame(loop); this.rafs.push(id); };
    loop();
    this.cleanups.push(() => { removeEventListener('mousemove', move); removeEventListener('mouseover', over); document.removeEventListener('mouseleave', leave); ring.remove(); dot.remove(); document.documentElement.classList.remove('u-cursor-hide'); });
  }
  initCinema() {
    if (this.RM || matchMedia('(max-width:820px)').matches) return;
    ['u-hride', 'u-hride-pin', 'u-hride-track'].forEach(id => { const el = this.q(id); if (el) { el.style.display = 'contents'; } });
    const ids = ['top', 'u-prima', 'metodo', 'impatto', 'verticali', 'prova'];
    // u-svcwrap is driven by its own pinned scrub (initServicesScroll); keep it layered between prima and metodo
    const sw = this.q('u-svcwrap'); if (sw) { sw.style.position = 'relative'; sw.style.zIndex = '6'; sw.style.background = 'var(--bg)'; }
    this._cinema = [];
    let z = 5;
    ids.forEach((id, i) => {
      const el = this.q(id); if (!el) return;
      el.style.position = 'sticky';
      el.style.zIndex = String(z++);
      el.style.minHeight = '100vh';
      el.style.willChange = 'transform, filter, clip-path';
      el.style.backfaceVisibility = 'hidden';
      if (i > 0) el.style.boxShadow = '0 -34px 90px rgba(14,27,77,.16)';
      if (id !== 'top' && id !== 'u-prima' && id !== 'impatto') el.style.background = 'var(--bg)';
      this._cinema.push(el);
    });
    const cta = this.q('contatti'); const foot = document.querySelector('#u-root footer');
    if (cta) { cta.style.position = 'relative'; cta.style.zIndex = String(z++); cta.style.boxShadow = '0 -34px 90px rgba(14,27,77,.16)'; }
    if (foot) { foot.style.position = 'relative'; foot.style.zIndex = String(z++); }
    this._cinemaNext = this._cinema.slice(1).concat(cta ? [cta] : []);
    this._enterTypes = ['zoom', 'wipe-r', 'fold', 'slide-r', 'wipe-l', 'slide-l', 'iris'];
    const setTops = () => { this._cinema.forEach(el => { el.style.top = Math.min(0, innerHeight - el.offsetHeight) + 'px'; }); };
    setTops();
    this._cinTops = setTops;
    addEventListener('resize', setTops);
    this.cleanups.push(() => removeEventListener('resize', setTops));
    setTimeout(setTops, 1200);
  }
  applyEnter(el, type, t) {
    // ease-out quint: fast arrival, gentle settle — no mid-scroll snap
    const e = 1 - Math.pow(1 - t, 5);
    const inv = 1 - e;
    let tf = 'translateZ(0)', cp = '';
    if (type === 'zoom') { tf = `scale(${(1.12 - 0.12 * e).toFixed(4)})`; el.style.transformOrigin = '50% 50%'; }
    else if (type === 'fold') { tf = `perspective(1600px) rotateX(${(-9 * inv).toFixed(2)}deg)`; el.style.transformOrigin = '50% 0%'; }
    else if (type === 'slide-r') { tf = `translate3d(${(20 * inv).toFixed(2)}%,0,0)`; }
    else if (type === 'slide-l') { tf = `translate3d(${(-20 * inv).toFixed(2)}%,0,0)`; }
    else if (type === 'wipe-r') { cp = `inset(0 ${(inv * 100).toFixed(1)}% 0 0)`; }
    else if (type === 'wipe-l') { cp = `inset(0 0 0 ${(inv * 100).toFixed(1)}%)`; }
    else if (type === 'iris') { cp = `circle(${(12 + e * 130).toFixed(1)}% at 50% 45%)`; }
    el.style.transform = tf;
    if (el._lastCp !== cp) { el.style.clipPath = cp; el.style.webkitClipPath = cp; el._lastCp = cp; }
    if (el._lastFl !== '') { el.style.filter = ''; el._lastFl = ''; }
  }
  updateCinema() {
    if (!this._cinema || !this._cinema.length) return;
    const vh = innerHeight;
    const doc = document.documentElement;
    if (Math.abs((this._cinH || 0) - doc.scrollHeight) > 4) { this._cinH = doc.scrollHeight; if (this._cinTops) this._cinTops(); }
    // entrance: each scene arrives with its own transition
    this._cinemaNext.forEach((el, idx) => {
      const top = el.getBoundingClientRect().top;
      if (top <= 2 || top >= vh - 1) {
        if (el._entOn) { el._entOn = false; el.style.clipPath = ''; el.style.webkitClipPath = ''; el._lastCp = ''; if (!el._covOn) { el.style.transform = ''; el.style.filter = ''; el._lastFl = ''; } }
        return;
      }
      this.applyEnter(el, this._enterTypes[idx] || 'zoom', this.clamp(1 - top / vh, 0, 1));
      el._entOn = true;
    });
    // cover: the pinned scene recedes as the next one covers it
    for (let i = 0; i < this._cinema.length; i++) {
      const nxt = this._cinemaNext[i]; if (!nxt) break;
      const el = this._cinema[i];
      const c = this.clamp((vh - nxt.getBoundingClientRect().top) / vh, 0, 1);
      if (c <= 0.001 || c >= 0.999) { if (el._covOn) { el._covOn = false; if (!el._entOn) { el.style.transform = ''; el.style.filter = ''; el._lastFl = ''; } } continue; }
      const e = c < .5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2;
      el.style.transformOrigin = '50% 30%';
      el.style.transform = `translate3d(0,${(-30 * e).toFixed(1)}px,0) scale(${(1 - 0.06 * e).toFixed(4)})`;
      const bl = e > 0.05 ? `brightness(${(1 - 0.14 * e).toFixed(3)})` : '';
      if (el._lastFl !== bl) { el.style.filter = bl; el._lastFl = bl; }
      el._covOn = true;
    }
  }
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
  scrollToY(y) { if (this._lenis) this._lenis.scrollTo(y); else scrollTo({ top: y, behavior: 'smooth' }); }
  initFilmBar() {
    const bar = this.q('u-filmbar'), ix = this.q('u-film-ix');
    if (!bar || !ix) return;
    if (this.props.filmBar === false) { bar.style.display = 'none'; }
    // keep the pill visible while the pointer is over it (see updateFilm auto-hide)
    bar.addEventListener('mouseenter', () => { bar._hover = true; clearTimeout(this._filmHideT); bar.style.transform = 'translateX(-50%)'; bar.style.opacity = '1'; });
    bar.addEventListener('mouseleave', () => { bar._hover = false; });
    this.cleanups.push(() => clearTimeout(this._filmHideT));
    const chapters = [['top', 'Apertura'], ['u-prima', 'Il prima'], ['servizi', 'Servizi'], ['metodo', 'Metodo'], ['impatto', 'Impatto'], ['verticali', 'Verticali'], ['prova', 'Prova'], ['contatti', 'Contatti']];
    this._filmTicks = [];
    chapters.forEach(([id, label]) => {
      const el = this.q(id); if (!el) return;
      const d = document.createElement('button');
      d.type = 'button';
      d.textContent = label;
      d.style.cssText = 'appearance:none;border:0;background:transparent;font-family:var(--mo);font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--dim);padding:6px 10px;border-radius:999px;cursor:pointer;white-space:nowrap;transition:color .2s,background .2s';
      d.addEventListener('click', ev => { ev.stopPropagation(); this.scrollToY(el.getBoundingClientRect().top + scrollY - 71); });
      d.addEventListener('mouseenter', () => { if (!d._cur) d.style.color = 'var(--tx)'; });
      d.addEventListener('mouseleave', () => { if (!d._cur) d.style.color = 'var(--dim)'; });
      ix.appendChild(d);
      this._filmTicks.push({ el, d, label, p: 0 });
    });
    this.updateFilm();
  }
  updateFilm() {
    if (!this._filmTicks || !this._filmTicks.length) return;
    const doc = document.documentElement;
    // auto-hide while actively scrolling so the pill never covers content; back when idle
    const bar = this.q('u-filmbar');
    if (bar) {
      const sy = scrollY;
      if (this._filmLastY !== undefined && Math.abs(sy - this._filmLastY) > 2 && !bar._hover) {
        bar.style.transform = 'translateX(-50%) translateY(76px)';
        bar.style.opacity = '0';
        clearTimeout(this._filmHideT);
        this._filmHideT = setTimeout(() => { bar.style.transform = 'translateX(-50%)'; bar.style.opacity = '1'; }, 550);
      }
      this._filmLastY = sy;
    }
    const total = Math.max(1, doc.scrollHeight - innerHeight);
    const p = this.clamp(scrollY / total, 0, 1);
    if (Math.abs((this._filmH || 0) - doc.scrollHeight) > 4 && (!this._filmH || scrollY < 120)) {
      this._filmH = doc.scrollHeight;
      this._filmTicks.forEach(t => { t.p = this.clamp((t.el.getBoundingClientRect().top + scrollY - innerHeight * 0.35) / total, 0, 1); });
    }
    let cur = this._filmTicks[0];
    this._filmTicks.forEach(t => { if (p >= t.p - 0.004) cur = t; });
    if (this._filmCur === cur) return;
    this._filmCur = cur;
    this._filmTicks.forEach(t => {
      const on = t === cur;
      t.d._cur = on;
      t.d.style.color = on ? '#fff' : 'var(--dim)';
      t.d.style.background = on ? 'var(--grad)' : 'transparent';
    });
  }
  initBookOpen() {
    // Light theme: book-open rotation/fade reads as flicker over white — disabled.
    document.querySelectorAll('.u-book').forEach(el => { el.style.transform = ''; el.style.opacity = ''; });
    this.bookEls = [];
    return;
    this.bookEls = [...document.querySelectorAll('.u-book')];
    if (this.RM) { this.bookEls.forEach(el => { el.style.transform = ''; el.style.opacity = ''; }); this.bookEls = []; return; }
    this.bookEls.forEach(el => {
      el.style.transformOrigin = '0% 50%';
      el.style.transformStyle = 'flat';
      el.style.backfaceVisibility = 'hidden';
      el.style.willChange = 'transform, opacity';
      el.style.transition = 'none';
      // spine seam: a thin luminous edge on the hinge side
      if (!el.querySelector(':scope > .u-book-spine')) {
        const s = document.createElement('div');
        s.className = 'u-book-spine';
        s.style.cssText = 'position:absolute;left:0;top:0;bottom:0;width:2px;background:linear-gradient(180deg,transparent,var(--cy),transparent);opacity:0;z-index:40;pointer-events:none;box-shadow:0 0 18px var(--cy)';
        el.appendChild(s);
      }
    });
    this.updateBookOpen();
  }
  updateBookOpen() {
    if (!this.bookEls || !this.bookEls.length) return;
    const vh = innerHeight;
    for (const el of this.bookEls) {
      const r = el.getBoundingClientRect();
      const p = this.clamp((vh * 0.9 - r.top) / (vh * 0.52), 0, 1);
      const e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const rot = (1 - e) * -66;
      el.style.transform = `perspective(2100px) rotateY(${rot.toFixed(2)}deg)`;
      el.style.opacity = (0.1 + 0.9 * e).toFixed(3);
      const spine = el.querySelector(':scope > .u-book-spine');
      if (spine) spine.style.opacity = (Math.sin(this.clamp(e, 0, 1) * Math.PI) * 0.9).toFixed(3);
    }
  }
  initCtaFinale() {
    // Finale: i frammenti convergono nel glifo quando arrivi alla CTA — specchio dell'hero
    const sec = this.q('contatti'), glyph = this.q('u-cta-glyph');
    if (!sec || !glyph) return;
    if (this.RM || matchMedia('(max-width:820px)').matches) { glyph.style.opacity = '1'; return; }
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io.disconnect();
      try { this.runCtaFinale(sec, glyph); } catch (err) { console.warn('ctaFinale', err); glyph.style.opacity = '1'; }
    }), { threshold: 0.45 });
    io.observe(sec);
    this.cleanups.push(() => io.disconnect());
  }
  runCtaFinale(sec, glyph) {
    const sr = sec.getBoundingClientRect(), gr = glyph.getBoundingClientRect();
    const W = Math.round(sr.width), H = Math.round(sr.height);
    const gx = gr.left - sr.left, gy = gr.top - sr.top, gw = gr.width;
    const off = document.createElement('canvas'); off.width = W; off.height = H;
    const oc = off.getContext('2d', { willReadFrequently: true });
    oc.setTransform(gw / 64, 0, 0, gw / 64, gx, gy);
    oc.fillStyle = '#000';
    oc.fill(new Path2D('M38 8 L58 20 V44 L38 56 L18 44 V36 L24 32 L18 28 V20 Z'));
    oc.fill(new Path2D('M8 30l3.4-2.4 2.6 2.4-3 2.2z'));
    // campiona solo il box del glifo, non l'intera sezione
    const x0 = Math.max(0, gx - 4 | 0), x1 = Math.min(W, (gx + gw + 4) | 0), y0 = Math.max(0, gy - 4 | 0), y1 = Math.min(H, (gy + gr.height + 4) | 0);
    const bw = x1 - x0, bh = y1 - y0;
    if (bw <= 0 || bh <= 0) { glyph.style.opacity = '1'; return; }
    const img = oc.getImageData(x0, y0, bw, bh).data;
    const pts = [];
    for (let y = y0; y < y1; y += 3) for (let x = x0; x < x1; x += 3) if (img[((y - y0) * bw + (x - x0)) * 4 + 3] > 100) pts.push({ tx: x, ty: y });
    if (!pts.length) { glyph.style.opacity = '1'; return; }
    while (pts.length > 1300) pts.splice((Math.random() * pts.length) | 0, 1);
    const lr = (a, b, t) => Math.round(a + (b - a) * t);
    const P = pts.map(p => {
      const a = Math.random() * Math.PI * 2, d = 140 + Math.random() * Math.max(W, H) * 0.5;
      const k = (p.tx - gx) / gw;
      return { tx: p.tx, ty: p.ty, sx: p.tx + Math.cos(a) * d, sy: p.ty + Math.sin(a) * d, delay: k * 0.4 + Math.random() * 0.15, c: 'rgb(' + lr(76, 124, k) + ',' + lr(111, 58, k) + ',' + lr(255, 237, k) + ')', s: 1.4 + Math.random() * 1.5 };
    });
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const cv = document.createElement('canvas');
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none';
    sec.appendChild(cv);
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    const T = 1900, t0 = performance.now();
    let revealed = false;
    const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const tick = now => {
      const t = Math.min((now - t0) / T, 1);
      ctx.clearRect(0, 0, W, H);
      for (const p of P) {
        const k = Math.min(Math.max((t - p.delay) / 0.45, 0), 1);
        if (k <= 0) continue;
        const e = eio(k);
        ctx.globalAlpha = 0.25 + 0.75 * e;
        ctx.fillStyle = p.c;
        ctx.fillRect(p.sx + (p.tx - p.sx) * e, p.sy + (p.ty - p.sy) * e, p.s, p.s);
      }
      if (t > 0.82 && !revealed) { revealed = true; glyph.style.transition = 'opacity .5s ease'; glyph.style.opacity = '1'; cv.style.transition = 'opacity .55s ease'; cv.style.opacity = '0'; }
      if (t < 1) { const id = requestAnimationFrame(tick); this.rafs.push(id); } else cv.remove();
    };
    const id = requestAnimationFrame(tick); this.rafs.push(id);
    this.cleanups.push(() => cv.remove());
  }
  initThread() {
    if (this.RM) return;
    if (matchMedia('(max-width: 820px)').matches) return;
    const root = this.q('u-root'); if (!root) return;
    const oldSpine = this.q('u-spine'); if (oldSpine) oldSpine.style.display = 'none';
    const NS = 'http://www.w3.org/2000/svg';
    this.THREAD_W = 64;
    const svg = document.createElementNS(NS, 'svg');
    svg.id = 'u-thread';
    svg.setAttribute('viewBox', `0 0 ${this.THREAD_W} ${innerHeight}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.cssText = 'position:fixed;left:clamp(2px,1.4vw,22px);top:0;height:100vh;width:' + this.THREAD_W + 'px;z-index:56;pointer-events:none;overflow:visible';
    svg.innerHTML = ''
      + '<defs><linearGradient id="u-thread-g" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0" style="stop-color:var(--vi)"/><stop offset="0.5" style="stop-color:var(--cy)"/><stop offset="1" style="stop-color:var(--vi)"/>'
      + '</linearGradient></defs>'
      + '<path id="u-thread-glow" fill="none" stroke="url(#u-thread-g)" stroke-width="8" stroke-linecap="round" vector-effect="non-scaling-stroke" opacity="0.16" style="filter:blur(3px)"/>'
      + '<path id="u-thread-path" fill="none" stroke="url(#u-thread-g)" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke" style="filter:drop-shadow(0 0 4px var(--cy))"/>'
      + '<g id="u-thread-nodes"></g>'
      + '<circle id="u-thread-trail" r="9" fill="var(--cy)" opacity="0.28" style="filter:blur(4px)"/>'
      + '<path id="u-thread-packet" d="M0 -4.4 L4.4 0 L0 4.4 L-4.4 0 Z" fill="#16205C" style="filter:drop-shadow(0 0 7px var(--cy)) drop-shadow(0 0 14px var(--vi))"/>';
    root.appendChild(svg);
    const nodesG = svg.querySelector('#u-thread-nodes');
    // frammenti sul filo: irregolari in alto (caos), rombi perfetti in basso (ordine)
    this._thNodes = [
      { p: 0.13, d: 'M-5 -2 L-1.4 -6 L5 -2.6 L3.6 3.4 L-2.4 5 Z' },
      { p: 0.34, d: 'M-5 -3 L2 -5.4 L5 .6 L1.4 5 L-4 3 Z' },
      { p: 0.55, d: 'M0 -6 L5 -1.4 L1 6 L-5 1 Z' },
      { p: 0.74, d: 'M0 -6 L5.4 0 L0 6 L-4.6 0 Z' },
      { p: 0.9,  d: 'M0 -6.4 L5.6 0 L0 6.4 L-5.6 0 Z' }
    ].map(n => {
      const el = document.createElementNS(NS, 'path');
      el.setAttribute('d', n.d);
      el.setAttribute('fill', 'var(--bg)');
      el.setAttribute('stroke', 'var(--cy)'); el.setAttribute('stroke-width', '1.5');
      el.setAttribute('stroke-linejoin', 'round');
      nodesG.appendChild(el); return { p: n.p, el, a: 0 };
    });
    this._thread = { svg, path: svg.querySelector('#u-thread-path'), glow: svg.querySelector('#u-thread-glow'), packet: svg.querySelector('#u-thread-packet'), trail: svg.querySelector('#u-thread-trail') };
    this._thSeeds = [1.3, 4.7, 8.2];
    this._packetT = 0.5; this._vel = 0; this._lastY = scrollY; this._lastTs = performance.now(); this._thH = innerHeight;
    const loop = (ts) => {
      const dt = Math.min(0.05, (ts - this._lastTs) / 1000); this._lastTs = ts;
      try { this.updateThread(dt); } catch (e) {}
      this._threadRaf = requestAnimationFrame(loop);
    };
    this._threadRaf = requestAnimationFrame(loop);
    this.rafs.push(this._threadRaf);
    this.cleanups.push(() => { if (svg.parentNode) svg.parentNode.removeChild(svg); });
  }
  threadX(t, chaos, lean) {
    const cx = this.THREAD_W * 0.5;
    const s = this._thSeeds;
    const env = this.clamp((t - 0.03) / 0.1, 0, 1);
    const wig = chaos * env * (16 * Math.sin(t * 8.6 + s[0]) + 9 * Math.sin(t * 21.2 + s[1]) + 5 * Math.sin(t * 43.9 + s[2]));
    return cx + wig + lean * t;
  }
  updateThread(dt) {
    const t = this._thread; if (!t) return;
    const H = innerHeight;
    if (Math.abs(H - this._thH) > 2) { this._thH = H; t.svg.setAttribute('viewBox', `0 0 ${this.THREAD_W} ${H}`); }
    const doc = document.documentElement;
    const gp = this.clamp(scrollY / Math.max(1, doc.scrollHeight - innerHeight), 0, 1);
    let chaos = this.clamp(1 - gp / 0.72, 0, 1);
    chaos = chaos * chaos * (3 - 2 * chaos);
    // velocity (lenis if present, else raw delta)
    let vRaw = this._lenis ? (this._scrollVel || 0) : (scrollY - this._lastY);
    this._lastY = scrollY;
    this._vel += (vRaw - this._vel) * 0.18;
    const lean = this.clamp(this._vel * 0.55, -20, 20);
    const N = 60; let d = '';
    for (let i = 0; i <= N; i++) { const tt = i / N; d += (i ? 'L' : 'M') + this.threadX(tt, chaos, lean).toFixed(1) + ' ' + (tt * H).toFixed(1) + ' '; }
    t.path.setAttribute('d', d); t.glow.setAttribute('d', d);
    // packet flows down; speed reacts to scroll velocity
    const speed = 0.055 + this.clamp(Math.abs(this._vel) * 0.004, 0, 0.55);
    this._packetT = (this._packetT + dt * speed) % 1;
    let len = 0; try { len = t.path.getTotalLength(); } catch (e) {}
    if (len) { const pt = t.path.getPointAtLength(this._packetT * len); t.packet.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ')'); t.trail.setAttribute('cx', pt.x.toFixed(1)); t.trail.setAttribute('cy', pt.y.toFixed(1)); }
    // frammenti sul filo: i non-superati ruotano inquieti (più in alto = più caos);
    // quando li superi si allineano e si accendono — il caos diventa ordine man mano che scendi
    this._thNodes.forEach(n => {
      const x = this.threadX(n.p, chaos, lean), y = n.p * H;
      const lit = gp >= n.p - 0.015;
      if (!lit) { n.a += dt * 40 * Math.pow(1 - n.p, 2); }
      else { n.a = n.a % 360; if (n.a > 180) n.a -= 360; if (n.a < -180) n.a += 360; n.a *= 0.85; }
      n.el.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + n.a.toFixed(1) + ')');
      n.el.setAttribute('fill', lit ? 'url(#u-thread-g)' : 'var(--bg)');
      n.el.style.filter = lit ? 'drop-shadow(0 0 6px var(--cy))' : 'none';
    });
    // (l'effetto skew sui titoli è stato rimosso: moto senza significato — regola "un protagonista")
  }
  initScan() {
    this.scanEls = [...document.querySelectorAll('.u-scan')];
    if (this.RM) { this.scanEls.forEach(el => { el.style.maskImage = ''; el.style.webkitMaskImage = ''; }); this.scanEls = []; return; }
    this.scanEls.forEach(el => {
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      el.style.willChange = 'mask-image';
      const bar = document.createElement('div');
      bar.className = 'u-scan-bar';
      bar.style.cssText = 'position:absolute;left:0;right:0;top:0;height:2px;transform:translateY(-100%);z-index:44;pointer-events:none;opacity:0;background:linear-gradient(90deg,transparent,var(--cy) 18%,#16205C 50%,var(--cy) 82%,transparent);box-shadow:0 0 22px var(--cy),0 -6px 26px rgba(76,111,255,.35)';
      const wash = document.createElement('div');
      wash.className = 'u-scan-wash';
      wash.style.cssText = 'position:absolute;left:0;right:0;top:0;height:180px;transform:translateY(-100%);z-index:43;pointer-events:none;opacity:0;background:linear-gradient(180deg,transparent,rgba(76,111,255,.12) 60%,rgba(76,111,255,.18));mix-blend-mode:multiply';
      el.appendChild(wash); el.appendChild(bar);
      el._scanBar = bar; el._scanWash = wash;
    });
    this.updateScan();
  }
  updateScan() {
    if (!this.scanEls || !this.scanEls.length) return;
    const vh = innerHeight;
    const cin = this._cinema && this._cinema.length;
    for (const el of this.scanEls) {
      const r = el.getBoundingClientRect();
      if (cin) {
        el.style.maskImage = 'none'; el.style.webkitMaskImage = 'none';
        const pe = this.clamp((vh - r.top) / vh, 0, 1);
        const on = r.top > 2 && pe > 0.01;
        const bar = el._scanBar, wash = el._scanWash;
        if (bar) { bar.style.top = '0'; bar.style.transform = 'none'; bar.style.opacity = on ? '1' : '0'; }
        if (wash) { wash.style.top = '0'; wash.style.transform = 'scaleY(-1)'; wash.style.opacity = on ? '0.6' : '0'; }
        continue;
      }
      const p = this.clamp((vh - r.top) / (vh * 0.72), 0, 1);
      const e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const pct = e * 100;
      if (e >= 0.999) { el.style.maskImage = 'none'; el.style.webkitMaskImage = 'none'; }
      else { const m = `linear-gradient(180deg, #000 ${(pct - 5).toFixed(1)}%, rgba(0,0,0,0.4) ${pct.toFixed(1)}%, transparent ${(pct + 3).toFixed(1)}%)`; el.style.maskImage = m; el.style.webkitMaskImage = m; }
      const on = e > 0.004 && e < 0.99;
      const glow = on ? (Math.sin(this.clamp(e, 0, 1) * Math.PI) * 0.85 + 0.15).toFixed(3) : '0';
      const bar = el._scanBar, wash = el._scanWash;
      if (bar) { bar.style.top = pct.toFixed(2) + '%'; bar.style.opacity = glow; }
      if (wash) { wash.style.top = pct.toFixed(2) + '%'; wash.style.opacity = on ? (0.6).toFixed(2) : '0'; }
    }
  }
  updatePrima() {
    const sec = this.q('u-prima'), num = this.q('u-waste-num'); if (!sec || !num) return;
    const r = sec.getBoundingClientRect(); const vh = innerHeight;
    const p = this.clamp((vh*0.9 - r.top) / (vh*0.5 + r.height), 0, 1);
    num.textContent = Math.round(this.metrics().wasted * p).toLocaleString('it-IT');
  }
  updateSpine() {
    const path = this.q('u-spine-path');
    if (path) { const r = path.ownerSVGElement.getBoundingClientRect(); const vh = innerHeight; const p = this.clamp((vh*0.8 - r.top) / (r.height - vh*0.2), 0, 1); path.style.strokeDashoffset = String(1 - p); }
    const tl = this.q('u-tline'), td = this.q('u-tdot'), frag = this.q('u-frag');
    if (tl) { const r = tl.ownerSVGElement.getBoundingClientRect(); const vh = innerHeight; const p = this.clamp((vh*0.75 - r.top) / (r.height + vh*0.35), 0, 1); tl.style.strokeDashoffset = String(1 - p); if (frag) frag.style.opacity = String(this.clamp(1 - p*1.6, 0, 1)); if (td) { if (p > 0.02 && p < 0.99) { const len = tl.getTotalLength(); const pt = tl.getPointAtLength(len*p); td.setAttribute('cx', pt.x); td.setAttribute('cy', pt.y); td.style.opacity = '1'; } else td.style.opacity = '0'; } }
  }
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
  }
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
  }
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
  }
}
new UnitizySite({
  accentColor: '#4C6FFF',
  scrollFx: 'Cinematico',
  heroInfo: true,
  filmBar: true,
  carouselSpeed: 45,
  primaVideoUrl: '',
  wastedHours: 1240,
  hoursReturned: 12400,
  processesAutomated: 40,
  projectsProduction: 100
}).init();
