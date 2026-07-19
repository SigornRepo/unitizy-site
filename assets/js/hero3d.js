/* unitizy.com — modulo hero3d: la scena del "chip di cristallo", canvas 2D custom.
   Riscritto da Three.js (618KB) a 2D nativo il 19/07/2026: stessa scenografia
   — chip con pin e circuito, nodi con impulsi, scintille, pannelli, starfield,
   intro di assemblaggio dalle particelle — a costo di parse ~zero. */

export default {
  buildHero(canvas, cta) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const DPR = Math.min(devicePixelRatio || 1, matchMedia('(max-width:820px)').matches ? 1.5 : 2);
    const rand = (a, b) => a + Math.random() * (b - a);
    const ACC = '76,111,255', VIO = '168,85,247', NAVY = '22,32,92';

    let W = 1, H = 1, u = 50;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const w = Math.max(1, r.width), h = Math.max(1, r.height);
      // barra URL mobile: ignora oscillazioni di sola altezza (vedi commit "sfarfallio")
      if (W > 1 && Math.abs(w - W) < 2 && Math.abs(h - H) < 140) return;
      W = w; H = h; u = Math.min(W, H) / (cta ? 6.8 : 7.6);
      canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas); this.cleanups.push(() => ro.disconnect());

    // ── scena in unità mondo (origine al centro, y verso l'alto) ──
    const rootX = cta ? -0.6 : 0;
    const nodePos = cta
      ? [[-2.6,1.3,-0.6],[2.7,1.5,-0.4],[-2.9,-1.1,0.4],[2.8,-1.0,-0.8],[0,2.3,-1.0]]
      : [[-3.0,1.6,-1.0],[3.1,1.9,-0.6],[-3.4,-1.4,0.4],[3.3,-1.2,-1.2],[-1.8,2.5,1.2],[2.0,-2.3,1.0],[0.2,3.0,-1.6],[-0.4,-3.0,-0.8]];
    const nodes = nodePos.map((p, i) => ({
      tx: p[0], ty: p[1], z: p[2], x: 0, y: 0,
      sx: rand(-5, 5), sy: rand(-4, 4),
      box: i % 3 === 0, vio: !!(i % 2), rot: rand(0, 6.28), flash: 0,
      mid: [p[0] * 0.62 + rand(-0.7, 0.7), p[1] * 0.62 + rand(-0.7, 0.7)],
      ex: p[0] * 0.24, ey: p[1] * 0.24, phase: Math.random(), prevU: 1
    }));
    const qp = (n, t) => { const s = 1 - t; return [s * s * n.x + 2 * s * t * n.mid[0] + t * t * n.ex, s * s * n.y + 2 * s * t * n.mid[1] + t * t * n.ey]; };
    const panels = cta ? [] : [[-2.6,0.4,-1.8,2.4,1.5,0.3],[2.7,0.9,-2.0,2.0,1.3,-0.4],[-2.2,-1.5,0.7,1.8,1.1,0.2],[2.5,-0.6,0.9,1.7,1.2,-0.3],[0.1,1.9,-2.6,2.6,1.6,0.1]]
      .map(p => ({ tx: p[0], ty: p[1], z: p[2], w: p[3], h: p[4], rot: p[5], sx: rand(-6, 6), sy: rand(-4.5, 4.5), phase: rand(0, 6.28), spin: 0 }));
    const stars = Array.from({ length: cta ? 60 : 110 }, () => ({ x: rand(-12, 12), y: rand(-8, 8), z: rand(-7, 7), a: rand(0.2, 0.6), tw: rand(0, 6.28) }));
    // particelle di assemblaggio: nascono sparse, convergono sulla sagoma del chip
    const disint = cta ? [] : Array.from({ length: 280 }, () => {
      let bx, by;
      if (Math.random() < 0.4) { const s = (Math.random() * 4) | 0; const o = rand(-1.5, 1.5); if (s < 2) { bx = o; by = s ? -1.5 : 1.5; } else { bx = s === 2 ? -1.5 : 1.5; by = o; } }
      else { bx = rand(-1.45, 1.45); by = rand(-1.45, 1.45); }
      const th = rand(0, 6.283); return { bx, by, dx: Math.cos(th), dy: Math.sin(th) };
    });
    const traces = [[0,0,0,1.35],[0,1.35,0.95,1.35],[0,0,-1.25,0],[-1.25,0,-1.25,0.85],[0,0,0.75,-0.65],[0.75,-0.65,0.75,-1.35],[0,0,1.15,0.45],[1.15,0.45,1.45,0.45],[0,0,-0.6,-1.1],[-0.6,-1.1,-0.6,-1.4]];
    const links = [], sparks = [];

    // ── parallax ──
    let mx = 0, my = 0, tmx = 0, tmy = 0;
    if (!this.RM) {
      const host = canvas.closest('section') || canvas.parentElement;
      const mv = e => { const r = canvas.getBoundingClientRect(); tmx = (e.clientX - r.left) / r.width - 0.5; tmy = (e.clientY - r.top) / r.height - 0.5; };
      host.addEventListener('mousemove', mv); this.cleanups.push(() => host.removeEventListener('mousemove', mv));
    }
    let inView = false;
    const io = new IntersectionObserver(es => es.forEach(e => { inView = e.isIntersecting; }), { threshold: 0.01 });
    io.observe(canvas); this.cleanups.push(() => io.disconnect());

    // proiezione: dep ∈ [~0.5..1.3] scala lo spostamento parallattico per profondità
    const px = (x, z) => W / 2 + (x + rootX) * u + mx * u * 0.55 * (1.5 - z * 0.28);
    const py = (y, z) => H / 2 - y * u + my * u * 0.38 * (1.5 - z * 0.28);
    const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    let start = null, prev = 0;
    const draw = (now) => {
      const el = now / 1000, dt = Math.min(0.05, el - prev); prev = el;
      if (start == null) start = el;
      const intro = (cta || this.RM) ? 1 : this.clamp((el - start - 0.25) / 2.4, 0, 1);
      const e = ease(intro);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // starfield
      for (const s of stars) { ctx.globalAlpha = s.a * (0.6 + 0.4 * Math.sin(el * 0.7 + s.tw)); ctx.fillStyle = '#8FA3DE'; ctx.fillRect(px(s.x, s.z), py(s.y, s.z), 1.6, 1.6); }
      ctx.globalAlpha = 1;

      // pannelli di vetro
      for (const p of panels) {
        const x = p.sx + (p.tx - p.sx) * e, y = (p.sy + (p.ty - p.sy) * e) + Math.sin(el * 0.6 + p.phase) * 0.12;
        p.spin += dt * 0.06;
        ctx.save(); ctx.translate(px(x, p.z), py(y, p.z)); ctx.rotate(-p.rot - p.spin);
        ctx.globalAlpha = e;
        ctx.fillStyle = 'rgba(159,180,255,0.11)'; ctx.strokeStyle = 'rgba(84,104,184,0.35)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(-p.w * u / 2, -p.h * u / 2, p.w * u, p.h * u, 3);
        ctx.fill(); ctx.stroke(); ctx.restore();
      }
      ctx.globalAlpha = 1;

      // curve nodo→chip
      ctx.lineWidth = 1.4;
      for (const n of nodes) {
        if (!cta) { n.x = n.sx + (n.tx - n.sx) * e; n.y = n.sy + (n.ty - n.sy) * e; } else { n.x = n.tx; n.y = n.ty; }
        ctx.globalAlpha = 0.34 * e;
        ctx.strokeStyle = n.vio ? `rgb(${VIO})` : `rgb(${ACC})`;
        ctx.beginPath(); ctx.moveTo(px(n.x, n.z), py(n.y, n.z));
        ctx.quadraticCurveTo(px(n.mid[0], n.z), py(n.mid[1], n.z), px(n.ex, 0), py(n.ey, 0)); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // ── il chip ──
      const cx = px(0, 0), cy = py(0, 0);
      const rotY = cta ? Math.sin(el * 0.5) * 0.9 : mx * 0.4 + Math.sin(el * 0.22) * 0.12;
      const sqX = 1 - Math.abs(rotY) * 0.16, tilt = Math.sin(el * 0.3) * 0.03 + rotY * 0.05;
      const cvis = cta ? 1 : this.clamp((e - 0.18) / 0.45, 0, 1);
      const ign = cta ? 1 : this.clamp((e - 0.72) / 0.28, 0, 1);
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, 2.4 * u);
      halo.addColorStop(0, `rgba(174,194,255,${0.34 * cvis})`); halo.addColorStop(1, 'rgba(174,194,255,0)');
      ctx.fillStyle = halo; ctx.fillRect(cx - 2.4 * u, cy - 2.4 * u, 4.8 * u, 4.8 * u);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt); ctx.scale(sqX * (cta ? 0.2 + 0.8 * e : 1), (cta ? 0.2 + 0.8 * e : 1));
      const hw = 1.5 * u;
      // pin sui 4 lati
      ctx.fillStyle = `rgba(147,160,201,${0.9 * this.clamp((e - 0.12) / 0.4, 0, 1)})`;
      for (let i = 0; i < 9; i++) { const o = (i - 4) * 0.32 * u; ctx.fillRect(o - 0.08 * u, -hw - 0.2 * u, 0.16 * u, 0.2 * u); ctx.fillRect(o - 0.08 * u, hw, 0.16 * u, 0.2 * u); ctx.fillRect(-hw - 0.2 * u, o - 0.08 * u, 0.2 * u, 0.16 * u); ctx.fillRect(hw, o - 0.08 * u, 0.2 * u, 0.16 * u); }
      // corpo
      const bg = ctx.createLinearGradient(0, -hw, 0, hw);
      bg.addColorStop(0, `rgba(150,168,255,${0.50 * cvis})`); bg.addColorStop(0.55, `rgba(168,162,255,${0.42 * cvis})`); bg.addColorStop(1, `rgba(186,158,255,${0.46 * cvis})`);
      ctx.fillStyle = bg; ctx.strokeStyle = `rgba(42,61,143,${0.55 * cvis + 0.15})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(-hw, -hw, 2 * hw, 2 * hw, 0.1 * u); ctx.fill(); ctx.stroke();
      const sheen = ctx.createLinearGradient(-hw, -hw, hw, hw);
      sheen.addColorStop(0.1, 'rgba(255,255,255,0)'); sheen.addColorStop(0.42, `rgba(255,255,255,${0.28 * cvis})`); sheen.addColorStop(0.6, 'rgba(255,255,255,0)');
      ctx.fillStyle = sheen; ctx.beginPath(); ctx.roundRect(-hw, -hw, 2 * hw, 2 * hw, 0.1 * u); ctx.fill();
      // circuito: si "accende" a fine assemblaggio
      ctx.strokeStyle = `rgba(${Math.round(76 - 50 * ign)},${Math.round(112 - 76 * ign)},${Math.round(255 - 90 * ign)},${(0.3 + 0.7 * ign) * cvis})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); for (const t of traces) { ctx.moveTo(t[0] * u, -t[1] * u); ctx.lineTo(t[2] * u, -t[3] * u); } ctx.stroke();
      // core pulsante
      const cs = 0.425 * u * (1 + Math.sin(el * 2.4) * 0.06);
      const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, cs * 2.6);
      cg.addColorStop(0, `rgba(110,139,255,${(0.10 + 0.5 * ign) * cvis})`); cg.addColorStop(1, 'rgba(110,139,255,0)');
      ctx.fillStyle = cg; ctx.fillRect(-cs * 2.6, -cs * 2.6, cs * 5.2, cs * 5.2);
      ctx.fillStyle = `rgba(20,29,56,${0.9 * cvis})`; ctx.strokeStyle = `rgba(110,139,255,${(0.4 + 0.6 * ign) * cvis})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(-cs, -cs, 2 * cs, 2 * cs, 3); ctx.fill(); ctx.stroke();
      ctx.restore();

      // particelle di assemblaggio
      if (!cta && e < 0.99) {
        const spread = (1 - e) * 1.7;
        ctx.fillStyle = `rgba(59,91,219,${this.clamp((0.95 - e) / 0.4, 0, 1) * 0.5 + 0.4})`;
        for (const d of disint) { ctx.fillRect(px(d.bx + d.dx * spread, 0), py(d.by + d.dy * spread, 0), 2, 2); }
      }

      // nodi + impulsi
      for (const n of nodes) {
        n.rot += dt * 0.55; n.flash = Math.max(0, n.flash - dt * 2.6);
        const nx = px(n.x, n.z), ny = py(n.y, n.z), r = (n.box ? 0.13 : 0.11) * u * (1 + n.flash * 1.6);
        const col = n.vio ? VIO : ACC;
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, r * 3.2);
        g.addColorStop(0, `rgba(${col},${0.5 * e})`); g.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = g; ctx.fillRect(nx - r * 3.2, ny - r * 3.2, r * 6.4, r * 6.4);
        ctx.save(); ctx.translate(nx, ny); ctx.rotate(n.box ? n.rot : n.rot + 0.785);
        ctx.globalAlpha = e; ctx.fillStyle = `rgb(${col})`;
        ctx.fillRect(-r, -r, 2 * r, 2 * r); ctx.restore();
        // impulso che viaggia verso il chip
        if (intro > 0.6) {
          const uu = (el * 0.22 + n.phase) % 1;
          const [qx, qy] = qp(n, uu);
          const sx2 = px(qx, n.z * (1 - uu)), sy2 = py(qy, n.z * (1 - uu));
          ctx.globalAlpha = 1; ctx.fillStyle = `rgb(${NAVY})`;
          ctx.beginPath(); ctx.arc(sx2, sy2, 3.2, 0, 6.283); ctx.fill();
          if (n.prevU < 0.96 && uu >= 0.96) { // arrivo: flash + scintille + connessione transitoria
            n.flash = 1;
            const other = nodes[(nodes.indexOf(n) + 2 + (Math.random() * (nodes.length - 2)) | 0) % nodes.length];
            links.push({ ax: n.x, ay: n.y, bx: other.x, by: other.y, z: n.z, t: 0 });
            const burst = [];
            for (let k = 0; k < 12; k++) { const th = rand(0, 6.283), sv = rand(1.8, 4.4); burst.push({ x: n.x, y: n.y, vx: Math.cos(th) * sv, vy: Math.sin(th) * sv }); }
            sparks.push({ pts: burst, z: n.z, t: 0 });
            if (links.length > 8) links.shift(); if (sparks.length > 6) sparks.shift();
          }
          n.prevU = uu;
        }
      }
      ctx.globalAlpha = 1;

      // connessioni transitorie e scintille
      for (let i = links.length - 1; i >= 0; i--) {
        const L = links[i]; L.t += dt;
        if (L.t > 1.25) { links.splice(i, 1); continue; }
        const d = this.clamp(L.t / 0.35, 0, 1), f = this.clamp((L.t - 0.45) / 0.8, 0, 1);
        ctx.globalAlpha = (1 - f) * 0.85; ctx.strokeStyle = `rgb(${ACC})`; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(px(L.ax, L.z), py(L.ay, L.z));
        ctx.lineTo(px(L.ax + (L.bx - L.ax) * d, L.z), py(L.ay + (L.by - L.ay) * d, L.z)); ctx.stroke();
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const S = sparks[i]; S.t += dt;
        if (S.t > 0.75) { sparks.splice(i, 1); continue; }
        ctx.globalAlpha = 1 - S.t / 0.75; ctx.fillStyle = `rgb(${ACC})`;
        for (const q of S.pts) { q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= 0.93; q.vy *= 0.93; ctx.fillRect(px(q.x, S.z), py(q.y, S.z), 2.4, 2.4); }
      }
      ctx.globalAlpha = 1;
      mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
    };

    const loop = (now) => {
      if (inView) draw(now);
      const id = requestAnimationFrame(loop); this.rafs.push(id);
    };
    if (this.RM) { draw(3000); }
    else { const id = requestAnimationFrame(loop); this.rafs.push(id); }
  }
};
