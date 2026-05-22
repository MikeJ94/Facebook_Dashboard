import path from 'path';
import { createRequire } from 'module';

// Forzamos la lectura usando la ruta absoluta del proceso en el servidor de Vercel
const require = createRequire(import.meta.url);
const appPath = path.resolve(process.cwd(), 'artifacts/api-server/dist/index.mjs');

const app = await import(appPath);

export default app.default || app;
