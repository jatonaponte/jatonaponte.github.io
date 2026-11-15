// Renderiza o Reel "A semana na Ponte" a partir de um JSON de dados.
// Uso: node render_semana.mjs <dados.json> <saida.mp4> <capa.jpg>
// Precisa de: npm install (three, fontes, playwright), npx playwright install chromium, ffmpeg no PATH.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, copyFile, rename, rm } from 'node:fs/promises';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const [dadosArq, saida, capa] = process.argv.slice(2);
if (!dadosArq || !saida || !capa) { console.error('uso: node render_semana.mjs <dados.json> <saida.mp4> <capa.jpg>'); process.exit(2); }
const FPS = 30, DUR = 15.5, T_CAPA = 2.9;

// copia os dados para dentro da pasta servida
await copyFile(resolve(dadosArq), join(AQUI, '_dados.json'));

// servidor estático simples da pasta do modelo
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const srv = createServer(async (req, res) => {
  try {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const f = join(AQUI, p);
    if (!f.startsWith(AQUI)) throw new Error('fora');
    const b = await readFile(f);
    res.writeHead(200, { 'content-type': TIPOS[extname(f)] || 'application/octet-stream' }); res.end(b);
  } catch { res.writeHead(404); res.end(); }
}).listen(0, '127.0.0.1');
await new Promise(r => srv.once('listening', r));
const url = `http://127.0.0.1:${srv.address().port}/semana.html?dados=_dados.json`;

const browser = await chromium.launch({
  executablePath: process.env.CHROME || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('[erro na página]', e.message));
await page.goto(url);
await page.waitForFunction(() => window.ready);
await page.evaluate(() => window.ready);
const shot = async t => { await page.evaluate(t => window.renderAt(t), t); return page.screenshot({ type: 'jpeg', quality: 92, timeout: 120000 }); };

// capa
const { writeFile } = await import('node:fs/promises');
await writeFile(capa, await shot(T_CAPA));

// vídeo (quadros em JPEG direto para o ffmpeg) + trilha
const tmp = saida.replace(/\.mp4$/, '.tmp.mp4');
const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-i', join(AQUI, 'trilha.m4a'), '-map', '0:v', '-map', '1:a',
  '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', tmp], { stdio: ['pipe', 'ignore', 'inherit'] });
const n = Math.round(DUR * FPS);
for (let f = 0; f < n; f++) {
  const buf = await shot(f / FPS);
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (f % 90 === 0) console.log('quadro', f, '/', n);
}
ff.stdin.end();
const code = await new Promise(r => ff.on('close', r));
await browser.close(); srv.close(); await rm(join(AQUI, '_dados.json'), { force: true });
if (code !== 0) { console.error('ffmpeg falhou', code); process.exit(1); }
await rename(tmp, saida);
console.log('ok', saida, capa);
