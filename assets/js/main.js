/* unitizy.com — entry point: assembla i moduli e avvia il sito */
import { UnitizySite } from './core.js';
import hero3d from './hero3d.js';
import particles from './particles.js';
import stage from './stage.js';
import sections from './sections.js';
import chrome from './chrome.js';
import story from './story.js';

Object.assign(UnitizySite.prototype, hero3d, particles, stage, sections, chrome, story);

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
