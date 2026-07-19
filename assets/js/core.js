/* unitizy.com — core: classe UnitizySite, boot e utilità. I moduli feature estendono il prototype (vedi main.js) */

export class UnitizySite {
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
  scrollToY(y) { if (this._lenis) this._lenis.scrollTo(y); else scrollTo({ top: y, behavior: 'smooth' }); }
}
