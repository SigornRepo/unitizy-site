/* unitizy.com — modulo stage: regia dello scroll: cinema, timeline hero, sezioni, scan, video */

export default {
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
  },
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
  },
  updateHeroTimeline() {
    const doc = document.documentElement;
    const p = this.clamp(scrollY / Math.max(1, doc.scrollHeight - innerHeight), 0, 1);
    this.heroT = p;
    const ph = (a, b, c, d) => p < a ? 0 : p < b ? (p - a) / (b - a) : p < c ? 1 : p < d ? 1 - (p - c) / (d - c) : 0;
    const info = this.q('u-hero-info'); if (info) info.style.opacity = this.clamp(1 - p / 0.1, 0, 1).toFixed(3);
    const clim = this.q('u-hero-climax'); if (clim) clim.style.opacity = ph(0.74, 0.86, 1, 1).toFixed(3);
    const hint = this.q('u-hero-hint'); if (hint) hint.style.opacity = this.clamp(1 - p / 0.06, 0, 1).toFixed(3);
  },
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
  },
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
  },
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
  },
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
  },
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
  },
  initSectionFx() { this.fxTargets = [...document.querySelectorAll('.u-fx')].filter(el => !el.closest('.u-book') && !el.closest('.u-scan')); this.fxTargets.forEach(el => { el.style.transition = 'none'; }); },
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
  },
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
  },
  setHeroInfo() { const hi = this.q('u-hero-info'); if (hi) hi.style.display = this.props.heroInfo === false ? 'none' : ''; },
  updatePrima() {
    const sec = this.q('u-prima'), num = this.q('u-waste-num'); if (!sec || !num) return;
    const r = sec.getBoundingClientRect(); const vh = innerHeight;
    const p = this.clamp((vh*0.9 - r.top) / (vh*0.5 + r.height), 0, 1);
    num.textContent = Math.round(this.metrics().wasted * p).toLocaleString('it-IT');
  },
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
  },
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
  },
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
};
