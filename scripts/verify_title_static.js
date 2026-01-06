import fs from 'fs';
import path from 'path';

const root = path.resolve(process.cwd());
const indexPath = path.join(root, 'index.html');
const appPath = path.join(root, 'src', 'App.tsx');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ${message}`);
    process.exit(1);
  }
}

// 1) Verifica <title> en index.html
const html = fs.readFileSync(indexPath, 'utf-8');
assert(html.includes('<title>Weather Platform</title>'), 'El título en index.html no es "Weather Platform"');

// 2) Verifica sincronización de título en App.tsx
const app = fs.readFileSync(appPath, 'utf-8');
assert(app.includes('TitleSync'), 'No se encontró TitleSync en App.tsx; el título podría cambiar entre rutas');

console.log('✅ Verificación de título estático y sincronización de rutas pasada.');

