/* unitizy.com — modulo particles: effetti particellari: spray, cristalli che compongono il testo, finale CTA */

export default {
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
  },
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
  },
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
  },
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
  },
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
  },
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
};
