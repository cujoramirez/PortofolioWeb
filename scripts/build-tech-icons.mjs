#!/usr/bin/env node
/**
 * Logos for the Toolbox (and the contact dock): official marks from Simple Icons (CC0) where one exists; simple glyphs
 * (drawn here, 24 x 24, stroked) for tools without a mark of their own, such as Apple's
 * frameworks, where a repeated Apple logo would say nothing. Writes src/data/tech-icons.json.
 *
 * Usage: node scripts/build-tech-icons.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import * as si from 'simple-icons';

const BRAND = {
  Swift: 'siSwift', SwiftUI: 'siSwift', Python: 'siPython', C: 'siC', JavaScript: 'siJavascript', PHP: 'siPhp',
  HTML: 'siHtml5', CSS: 'siCss', Xcode: 'siXcode', PyTorch: 'siPytorch', TensorFlow: 'siTensorflow', Keras: 'siKeras',
  OpenCV: 'siOpencv', Kaggle: 'siKaggle', React: 'siReact', 'Node.js': 'siNodedotjs', Express: 'siExpress',
  Laravel: 'siLaravel', 'ASP.NET MVC': 'siDotnet', '.NET': 'siDotnet', FastAPI: 'siFastapi', PostgreSQL: 'siPostgresql',
  MySQL: 'siMysql', SQLite: 'siSqlite', Pandas: 'siPandas', NumPy: 'siNumpy', Git: 'siGit',
  // contact dock
  GitHub: 'siGithub', 'Google Scholar': 'siGooglescholar',
};

// Stroked glyphs (24 x 24) for tools without a mark of their own.
const GLYPH = {
  'C#': 'M15 8.5a5 5 0 1 0 0 7 M17 9v6 M20 9v6 M16 11h5 M16 13h5',
  SQL: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Z M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6 M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  UIKit: 'M4 7h12v12H4Z M8 3h12v12',
  MapKit: 'M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10Z M12 8.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z',
  'App Intents': 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7Z',
  Vision: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z',
  CoreML: 'M5 6.5a1.5 1.5 0 1 1 0 .01 M5 17.5a1.5 1.5 0 1 1 0 .01 M12 12a1.5 1.5 0 1 1 0 .01 M19 6.5a1.5 1.5 0 1 1 0 .01 M19 17.5a1.5 1.5 0 1 1 0 .01 M6.3 7.3l4.4 3.9 M6.3 16.7l4.4-3.9 M13.3 11.2l4.4-3.9 M13.3 12.8l4.4 3.9',
  CreateML: 'M6 8a2 2 0 1 1 0 .01 M6 16a2 2 0 1 1 0 .01 M13 12a2 2 0 1 1 0 .01 M7.6 9.2l3.8 1.8 M7.6 14.8l3.8-1.8 M19 9v6 M16 12h6',
  Metal: 'M12 3l8 4.5v9L12 21l-8-4.5v-9Z M12 12l8-4.5 M12 12v9 M12 12L4 7.5',
  AVFoundation: 'M3 7h13v10H3Z M16 10.5l5-3v9l-5-3',
  CoreImage: 'M3 5h18v14H3Z M3 16l5-5 4 4 3-3 6 6 M15.5 9a1.5 1.5 0 1 1 0 .01',
  MLX: 'M4 4h4v4H4Z M10 4h4v4h-4Z M16 4h4v4h-4Z M4 10h4v4H4Z M10 10h4v4h-4Z M16 10h4v4h-4Z M4 16h4v4H4Z M10 16h4v4h-4Z M16 16h4v4h-4Z',
  GradCAM: 'M3 3h18v18H3Z M12 12m-6 0a6 6 0 1 0 12 0 6 6 0 1 0-12 0 M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0',
  'Weights & Biases': 'M12 4a1.5 1.5 0 1 1 0 .01 M12 12a1.5 1.5 0 1 1 0 .01 M12 20a1.5 1.5 0 1 1 0 .01 M6 8a1.5 1.5 0 1 1 0 .01 M18 16a1.5 1.5 0 1 1 0 .01',
  // contact dock (LinkedIn is not in Simple Icons)
  LinkedIn: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z M8 10.5V17 M8 7.2v.01 M12 17v-6.5 M12 13.5c0-1.8 1.3-3 3-3s3 1.2 3 3V17',
  Email: 'M3 6.5h18v11H3Z M3.5 7l8.5 6.5L20.5 7',
  'Résumé': 'M6.5 3h8l4 4v14h-12Z M14.5 3v4h4 M9.5 11.5h6 M9.5 15h6 M9.5 18.5h4',
};

const out = {};
for (const [name, key] of Object.entries(BRAND)) {
  const icon = si[key];
  if (!icon) throw new Error(`Simple Icons has no ${key}`);
  out[name] = { kind: 'brand', path: icon.path, title: icon.title };
}
for (const [name, d] of Object.entries(GLYPH)) out[name] = { kind: 'glyph', path: d };

const file = 'src/data/tech-icons.json';
const json = JSON.stringify(out) + '\n';
let prev = '';
try {
  prev = readFileSync(file, 'utf8');
} catch {
  /* first run */
}
if (prev !== json) writeFileSync(file, json);
console.log(`${Object.keys(out).length} icons -> ${file}`);
