# unitizy.com

Sito vetrina di **Unitizy sh.p.k.** (NIPT M61903504J) — tech house di AI consulting e development.
Statico, zero cookie, zero tracker, zero build step: quello che vedi nel repo è quello che va online.

## Struttura

| File / cartella | Cosa |
|---|---|
| `index.html` | Il markup del sito (~700 righe). |
| `assets/css/site.css` | Gli stili del sito (font, keyframes, utility). |
| `assets/js/site.js` | Il motore: classe `UnitizySite` (hero 3D, particelle, scene, spina, animazioni). |
| `brand.html` | Manuale d'identità visiva (marchio, colori, motivo dei frammenti, regole d'uso, template social). `noindex`. |
| `social.html` | Template social parametrici. Export: `social.html?board=1..4` + screenshot alla dimensione esatta. `noindex`. |
| `privacy.html` | Informativa privacy (GDPR + normativa albanese). |
| `assets/brand/marks.svg` | **Fonte canonica del marchio** (master, glifo compatto, motivo frammenti). Le pagine interne lo referenziano via `<use href>`; `index.html` tiene una copia inline per evitare una richiesta in più sul percorso critico (unica duplicazione ammessa, aggiornarle insieme). |
| `assets/social/` | PNG d'esempio esportati dai template. |
| `assets/prima-v2.mp4` | Video della sezione "Il prima". |
| `vendor/` | Three.js, Lenis e font self-hostati (GDPR: nessuna richiesta a server terzi). |
| `scripts/check.py` | Controlli pre-push (parse HTML, asset referenziati esistenti, stringhe vietate). |
| `PLACEHOLDERS.md` | **Censimento dei contenuti provvisori** da sostituire con dati veri prima di usarli commercialmente. |

## Sviluppo locale

```bash
python -m http.server 8010   # poi http://localhost:8010
```

## Deploy

Push su `main` → GitHub Pages ripubblica su https://unitizy.com in ~1 minuto. **Non c'è staging**: installa il hook pre-push per i controlli minimi:

```bash
cp scripts/pre-push .git/hooks/pre-push
```

## Font e licenze

- Space Grotesk, Inter, JetBrains Mono: SIL Open Font License (via Google Fonts, self-hostati).
- Clash Display: Fontshare / ITF Free Font License (uso commerciale consentito, non rivendibile come font).

## Debiti noti (scelti, non dimenticati)

1. **Stili per-elemento inline nel markup** (`style="..."` sugli elementi): stile di authoring ereditato dal progetto design. CSS e JS sono stati estratti in file dedicati (19/07/2026); la conversione degli inline a classi è lavoro incrementale, da fare quando si tocca una sezione.
2. **Three.js completo (618 KB)** per l'hero 3D: caricato `defer`, ma un build custom o un porting a canvas 2D peserebbe ~1/10. Da fare se Lighthouse mobile segna il fiato corto.
3. **Niente analytics** per scelta privacy: nessuna misura di conversione. Se servirà, valutare opzioni cookieless (es. GoatCounter/Plausible) e aggiornare la privacy policy.
