// node render.js <data.json> <mode reel|yt> <out.mp4|preview> [t1 t2 ...] [--from N --to M]
const { chromium } = require('playwright-core');
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const [dataPath, mode, out, ...rest] = process.argv.slice(2);
const D = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const WORK = path.dirname(path.resolve(dataPath));
const W = mode === 'reel' ? 1080 : 1920, H = mode === 'reel' ? 1920 : 1080, FPS = 30;
const arg = k => { const i = rest.indexOf(k); return i >= 0 ? +rest[i + 1] : null; };

(async () => {
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--allow-file-access-from-files', '--force-color-profile=srgb', '--font-render-hinting=none'] });
  const pg = await br.newPage({ viewport: { width: W, height: H } });
  await pg.goto('file://' + path.join(__dirname, 'compose.html'));
  await pg.evaluate(([d, m]) => setup(d, m), [D, mode]);
  const fr = n => D.frames[Math.min(n, D.frames.length - 1)];
  const fit = c => D.fit[mode][c];
  async function draw(n) {
    const f = fr(n), t = n / FPS;
    const fsrc = `file://${WORK}/p${f.c}/${String(f.k).padStart(5, '0')}.jpg`;
    const msrc = `file://${WORK}/q${f.c}/${String(f.k).padStart(5, '0')}.png`;
    await pg.evaluate(([t, a, b, ft]) => frame(t, a, b, ft), [t, fsrc, msrc, fit(f.g)]);
    return pg.screenshot({ type: 'jpeg', quality: 93 });
  }
  if (out === 'preview') {
    const ts = rest.filter(x => !x.startsWith('--')).map(Number);
    for (const t of ts) { fs.writeFileSync(`${WORK}/prev_${mode}_${t.toFixed(2)}.jpg`, await draw(Math.round(t * FPS))); }
  } else {
    const N = D.frames.length, a = arg('--from') ?? 0, b = arg('--to') ?? N;
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-',
      '-vf', 'scale=in_color_matrix=bt601:in_range=pc:out_color_matrix=bt709:out_range=tv,format=yuv420p',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let n = a; n < b; n++) {
      const buf = await draw(n);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (n % 150 === 0) console.log(mode, n, '/', b);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await br.close();
})();
