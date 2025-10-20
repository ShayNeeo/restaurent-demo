import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isWatch = process.argv.includes('--watch');

const clientEntry = resolve(__dirname, 'src/client/index.ts');
const outFile = resolve(__dirname, '../Restaurent/assets/js/app.js');

await build({
  entryPoints: [clientEntry],
  bundle: true,
  outfile: outFile,
  platform: 'browser',
  target: ['es2020'],
  sourcemap: true,
  minify: !isWatch
});

if (isWatch) {
  console.log('[esbuild] watching client files...');
}

