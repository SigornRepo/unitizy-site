/* unitizy.com — modulo hero3d: scena Three.js (hero e CTA) */

export default {
  glowTexture() {
    if (this._glow) return this._glow;
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.22, 'rgba(214,228,255,0.7)'); gr.addColorStop(0.55, 'rgba(150,175,255,0.2)'); gr.addColorStop(1, 'rgba(120,150,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    this._glow = new THREE.CanvasTexture(c); return this._glow;
  },
  envCanvas() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, 256); grad.addColorStop(0, '#c9d6ff'); grad.addColorStop(0.5, '#eef2ff'); grad.addColorStop(1, '#ffffff');
    g.fillStyle = grad; g.fillRect(0, 0, 512, 256);
    const blob = (x, y, r, col) => { const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, 512, 256); };
    blob(150, 60, 130, 'rgba(120,150,255,0.95)'); blob(380, 70, 150, 'rgba(175,110,255,0.85)'); blob(300, 210, 120, 'rgba(255,255,255,0.55)');
    return c;
  },
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
};
