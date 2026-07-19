/* unitizy.com — modulo chrome: UI di contorno: burger, cursore, filmbar, spina narrativa */

export default {
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
  },
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
  },
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
  },
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
  },
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
  },
  threadX(t, chaos, lean) {
    const cx = this.THREAD_W * 0.5;
    const s = this._thSeeds;
    const env = this.clamp((t - 0.03) / 0.1, 0, 1);
    const wig = chaos * env * (16 * Math.sin(t * 8.6 + s[0]) + 9 * Math.sin(t * 21.2 + s[1]) + 5 * Math.sin(t * 43.9 + s[2]));
    return cx + wig + lean * t;
  },
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
  },
  updateSpine() {
    const path = this.q('u-spine-path');
    if (path) { const r = path.ownerSVGElement.getBoundingClientRect(); const vh = innerHeight; const p = this.clamp((vh*0.8 - r.top) / (r.height - vh*0.2), 0, 1); path.style.strokeDashoffset = String(1 - p); }
    const tl = this.q('u-tline'), td = this.q('u-tdot'), frag = this.q('u-frag');
    if (tl) { const r = tl.ownerSVGElement.getBoundingClientRect(); const vh = innerHeight; const p = this.clamp((vh*0.75 - r.top) / (r.height + vh*0.35), 0, 1); tl.style.strokeDashoffset = String(1 - p); if (frag) frag.style.opacity = String(this.clamp(1 - p*1.6, 0, 1)); if (td) { if (p > 0.02 && p < 0.99) { const len = tl.getTotalLength(); const pt = tl.getPointAtLength(len*p); td.setAttribute('cx', pt.x); td.setAttribute('cy', pt.y); td.style.opacity = '1'; } else td.style.opacity = '0'; } }
  }
};
