/* unitizy.com — modulo story: il racconto continuo guidato dallo scroll.
   Un coro di frammenti persiste per tutta la pagina: il loro stato è pura funzione
   della posizione di scroll (avanti = la storia avanza, indietro = si riavvolge).
   Formazioni: caos (hero) → margini (il prima) → gruppi (servizi) → colonne (metodo)
   → margini (impatto) → corsie (verticali) → cerchio (prova) → glifo (cta).
   Anche il moto obbedisce alla tesi: l'agitazione decresce col progresso. */

export default {
  initStory() {
    if (this.RM) return;
    const mobile = matchMedia('(max-width:820px)').matches;
    const N = mobile ? 130 : 320;
    const DPR = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2);
    // le sezioni "cinema" hanno sfondi opachi: un canvas fisso dietro non si vedrebbe.
    // Il coro vive quindi su più tele: una fissa per l'hero + una per ogni sezione bianca,
    // tutte sincronizzate sulle stesse particelle in coordinate viewport.
    const layers = [];
    const fixed = document.createElement('canvas');
    fixed.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;height:100lvh;z-index:-2;pointer-events:none';
    const root = this.q('u-root');
    root.insertBefore(fixed, root.firstChild);
    layers.push({ cv: fixed, ctx: fixed.getContext('2d'), host: null, w: 0, h: 0 });
    for (const id of ['servizi', 'metodo', 'verticali', 'prova', 'contatti']) {
      const host = this.q(id); if (!host) continue;
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
      cv.setAttribute('aria-hidden', 'true');
      host.insertBefore(cv, host.firstChild);
      layers.push({ cv, ctx: cv.getContext('2d'), host, w: 0, h: 0 });
    }
    let W = 1, H = 1;
    const resize = () => {
      const w = innerWidth, h = innerHeight;
      if (W > 1 && Math.abs(w - W) < 2 && Math.abs(h - H) < 140) return;
      W = w; H = h;
      measure();
    };

    // particelle con semi stabili: la storia è deterministica, il rewind è perfetto
    const P = Array.from({ length: N }, () => ({
      r1: Math.random(), r2: Math.random(), r3: Math.random(), r4: Math.random(),
      ph: Math.random() * 6.283, x: 0, y: 0
    }));

    // ── formazioni: (p, t) → [nx, ny] in coordinate viewport normalizzate ──
    const F = {
      caos:    p => [p.r1, p.r2],
      margini: p => [p.r1 < 0.5 ? p.r2 * 0.13 : 1 - p.r2 * 0.13, p.r3],
      gruppi:  p => { const c = [[0.16, 0.3], [0.85, 0.24], [0.12, 0.78], [0.88, 0.74]][(p.r1 * 4) | 0]; return [c[0] + (p.r2 - 0.5) * 0.2, c[1] + (p.r3 - 0.5) * 0.26]; },
      colonne: p => [[0.14, 0.38, 0.62, 0.86][(p.r1 * 4) | 0] + (p.r2 - 0.5) * 0.05, 0.12 + p.r3 * 0.76],
      corsie:  (p, g) => [(p.r1 + g * 1.6) % 1, [0.2, 0.5, 0.8][(p.r2 * 3) | 0] + (p.r3 - 0.5) * 0.05],
      cerchio: p => { const a = p.r1 * 6.283, r = 0.30 + p.r2 * 0.05; return [0.5 + Math.cos(a) * r * 0.62, 0.5 + Math.sin(a) * r]; },
      glifo:   p => { const a = p.r1 * 6.283, r = Math.sqrt(p.r2) * 0.16; return [(mobile ? 0.5 : 0.72) + Math.cos(a) * r * 0.8, 0.5 + Math.sin(a) * r * 1.3]; }
    };

    // ── keyframes narrativi ancorati alle sezioni reali ──
    let KEY = [];
    const measure = () => {
      const doc = document.documentElement;
      const total = Math.max(1, doc.scrollHeight - innerHeight);
      const at = id => { const el = this.q(id); return el ? this.clamp((el.getBoundingClientRect().top + scrollY - innerHeight * 0.4) / total, 0, 1) : null; };
      KEY = [
        { at: 0, f: 'caos' },
        { at: at('u-prima'), f: 'margini' },
        { at: at('servizi'), f: 'gruppi' },
        { at: at('metodo'), f: 'colonne' },
        { at: at('impatto'), f: 'margini' },
        { at: at('verticali'), f: 'corsie' },
        { at: at('prova'), f: 'cerchio' },
        { at: at('contatti'), f: 'glifo' },
        { at: 1.01, f: 'glifo' }
      ].filter(k => k.at != null).sort((a, b) => a.at - b.at);
    };
    resize();
    addEventListener('resize', resize);
    this.cleanups.push(() => { removeEventListener('resize', resize); cv.remove(); });

    const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    let prev = 0;
    const draw = (now) => {
      const el = now / 1000; prev = el;
      const doc = document.documentElement;
      const gp = this.clamp(scrollY / Math.max(1, doc.scrollHeight - innerHeight), 0, 1);
      // segmento corrente del racconto
      let i = 0; while (i < KEY.length - 2 && gp >= KEY[i + 1].at) i++;
      const A = KEY[i], B = KEY[i + 1];
      const seg = this.clamp((gp - A.at) / Math.max(0.0001, B.at - A.at), 0, 1);
      const calm = 1.15 - gp;                          // l'agitazione decresce col viaggio
      const R = Math.round(76 + (124 - 76) * gp);      // blu → viola: il colore È il progresso
      const G = Math.round(111 + (58 - 111) * gp);
      const Bc = Math.round(255 + (237 - 255) * gp);
      const col = `rgb(${R},${G},${Bc})`;
      // posizioni viewport condivise da tutte le tele
      for (const p of P) {
        const t = ease(this.clamp((seg - p.r4 * 0.25) / 0.75, 0, 1)); // stagger per-particella
        const [ax, ay] = F[A.f](p, gp);
        const [bx, by] = F[B.f](p, gp);
        const nx = ax + (bx - ax) * t, ny = ay + (by - ay) * t;
        const wob = calm * (6 + p.r3 * 9);
        p.x = nx * W + Math.sin(el * (0.5 + p.r1) + p.ph) * wob;
        p.y = ny * H + Math.cos(el * (0.4 + p.r2) + p.ph) * wob * 0.7;
      }
      const checkSize = el - (this._storySized || 0) > 0.25;
      if (checkSize) this._storySized = el;
      for (const L of layers) {
        let ox = 0, oy = 0, lw = W, lh = H;
        if (L.host) {
          const r = L.host.getBoundingClientRect();
          if (r.bottom < -40 || r.top > H + 40) { if (L.on) { L.ctx.setTransform(1,0,0,1,0,0); L.ctx.clearRect(0, 0, L.cv.width, L.cv.height); L.on = false; } continue; }
          ox = r.left; oy = r.top;
          // dimensioni dal layout (immuni alle transform animate) e non oltre 4000px:
          // un buffer che cambia a ogni frame = tempesta di realloc = pagina bloccata
          lw = L.host.offsetWidth; lh = Math.min(4000, L.host.offsetHeight);
        }
        if (checkSize || !L.w) {
          const bw = Math.ceil(lw * DPR / 64) * 64, bh = Math.ceil(lh * DPR / 64) * 64;
          if (bw !== L.w || bh !== L.h) { L.w = bw; L.h = bh; L.cv.width = bw; L.cv.height = bh; }
        }
        const c = L.ctx; L.on = true;
        c.setTransform(DPR, 0, 0, DPR, 0, 0);
        c.clearRect(0, 0, lw, lh);
        c.translate(-ox, -oy);
        for (const p of P) {
          if (p.x < ox - 12 || p.x > ox + lw + 12 || p.y < oy - 12 || p.y > oy + lh + 12) continue;
          const s = 4.5 + p.r3 * 5;
          const rot = 0.785 + Math.sin(el * 0.6 + p.ph) * 0.7 * calm; // rombi che si raddrizzano
          c.save(); c.translate(p.x, p.y); c.rotate(rot);
          c.globalAlpha = 0.17 + p.r2 * 0.12;
          c.fillStyle = col;
          c.fillRect(-s / 2, -s / 2, s, s);
          c.restore();
        }
        c.globalAlpha = 1;
      }
    };
    const loop = (now) => {
      if (!document.hidden) draw(now);
      this._storyRaf = requestAnimationFrame(loop);
      this.rafs.push(this._storyRaf);
    };
    this._storyRaf = requestAnimationFrame(loop);
    // le sezioni si spostano quando i font/le immagini arrivano: rimisura a load
    addEventListener('load', measure);
    this.cleanups.push(() => removeEventListener('load', measure));
  }
};
