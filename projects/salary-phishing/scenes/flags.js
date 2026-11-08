/* shared helpers (concatenated into each scene by build.sh) */
const L = {
  rr(X, x, y, w, h, r) { X.beginPath(); X.roundRect(x, y, w, h, r); },
  bg(ctx, t, o = {}) {
    const { X, W, H, P } = ctx;
    X.fillStyle = o.color || P.bg; X.fillRect(0, 0, W, H);
    const g = X.createRadialGradient(540, o.gy || 760, 40, 540, o.gy || 760, 1100);
    g.addColorStop(0, o.glow || 'rgba(60,110,190,0.28)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    X.fillStyle = g; X.fillRect(0, 0, W, H);
    X.save(); X.globalAlpha = o.gridA ?? 0.10; X.fillStyle = '#9DB6D8';
    const off = (t * 14) % 60;
    for (let y = -60 + off; y < H; y += 60) for (let x = 30; x < W; x += 60) { X.beginPath(); X.arc(x, y, 2, 0, 6.283); X.fill(); }
    X.restore();
  },
  /* draw image so image-point (fx,fy) lands at (ax,ay) with scale z; returns mapper */
  cam(X, img, fx, fy, z, ax, ay) {
    const ox = ax - fx * z, oy = ay - fy * z;
    X.drawImage(img, ox, oy, img.width * z, img.height * z);
    return (x, y) => [ox + x * z, oy + y * z];
  },
  ellipse(cx, cy, rx, ry, seed = 1) {           // hand-drawn ring (slight overshoot)
    const pts = [];
    for (let i = 0; i <= 44; i++) { const a = -2.2 + i / 40 * 6.283, w = 1 + 0.035 * Math.sin(i * 1.7 + seed); pts.push([cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w]); }
    return pts;
  },
  ring(ctx, map, box, k, o = {}) {              // box in image coords
    if (k <= 0) return;
    const [x0, y0] = map(box[0], box[1]), [x1, y1] = map(box[2], box[3]);
    const pad = o.pad ?? 18;
    ctx.drawPath(ctx.X, L.ellipse((x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2 + pad + 10, (y1 - y0) / 2 + pad, o.seed || 1), k,
      { width: o.width || 9, color: o.color || ctx.P.acc, tip: { r: 7, color: o.color || ctx.P.acc } });
  },
  rect(ctx, map, box, k, o = {}) {
    if (k <= 0) return;
    const [x0, y0] = map(box[0], box[1]), [x1, y1] = map(box[2], box[3]), p = o.pad ?? 10;
    const pts = [[x0 - p, y0 - p], [x1 + p, y0 - p], [x1 + p, y1 + p], [x0 - p, y1 + p], [x0 - p, y0 - p - 4]];
    ctx.drawPath(ctx.X, pts, k, { width: o.width || 8, color: o.color || ctx.P.acc, smooth: false });
  },
  tag(ctx, str, x, y, k, o = {}) {              // sticker label
    if (k <= 0) return;
    const { X } = ctx; const size = o.size || 40;
    X.save(); X.font = `700 ${size}px Tajawal`; const w = X.measureText(str).width + 44; X.restore();
    const s = 0.94 + 0.06 * k;
    X.save(); X.globalAlpha = k; X.translate(x, y); X.scale(s, s); X.rotate(o.rot || 0);
    X.shadowColor = 'rgba(0,0,0,.35)'; X.shadowBlur = 18; X.shadowOffsetY = 6;
    X.fillStyle = o.bg || ctx.P.acc; L.rr(X, -w / 2, -size * 0.85, w, size * 1.55, 14); X.fill();
    X.shadowColor = 'transparent';
    ctx.text(X, str, 0, size * 0.25, { family: 'body', weight: 700, size, color: o.color || '#fff' });
    X.restore();
  },
  /* word-synced caption: caption words mapped onto VO words of lineId */
  say(ctx, t, lineId, str, x, y, o = {}) {
    const lay = ctx.text.layout(ctx.X, str, { family: o.family || 'display', weight: o.weight || 800, size: o.size || 72, maxWidth: o.maxWidth || 900, lineHeight: o.lh || 1.3 });
    const vw = ctx.wordsOf(lineId).length, n = lay.words.length, off = o.from || 0, span = (o.to ?? vw - 1) - off;
    const out = o.out ?? 1e9;
    return ctx.text.drawLayout(ctx.X, lay, x, y, { align: o.align || 'center', color: o.color || ctx.P.ink, perWord: (i) => {
      const wi = Math.round(off + (n > 1 ? i / (n - 1) : 0) * span), w = ctx.wordTime(lineId, wi);
      const k = ctx.at(t, w.s - 0.08, w.s + 0.22, 'expoOut'), ko = ctx.at(t, out, out + 0.25, 'cubicIn');
      if (k <= 0 || ko >= 1) return { skip: true };
      const c = o.hot && o.hot.includes(i) ? (o.hotColor || ctx.P.acc) : undefined;
      return { alpha: k * (1 - ko), dy: (1 - k) * 46 - ko * 30, scale: 0.94 + 0.06 * k, color: c };
    } });
  },
  card(ctx, x, y, w, h, k, o = {}) {
    if (k <= 0) return;
    const { X } = ctx;
    X.save(); X.globalAlpha = k; X.translate(0, (1 - k) * 40);
    X.shadowColor = 'rgba(0,0,0,.4)'; X.shadowBlur = 40; X.shadowOffsetY = 14;
    X.fillStyle = o.fill || 'rgba(255,255,255,0.07)'; L.rr(X, x, y, w, h, o.r || 36); X.fill();
    X.shadowColor = 'transparent';
    if (o.stroke) { X.lineWidth = 3; X.strokeStyle = o.stroke; X.stroke(); }
    X.restore();
  },
  badge(ctx, n, x, y, k, color) {               // numbered circle
    if (k <= 0) return;
    const { X } = ctx; const s = 0.92 + 0.08 * k;
    X.save(); X.globalAlpha = k; X.translate(x, y); X.scale(s, s);
    X.fillStyle = color || ctx.P.acc; X.beginPath(); X.arc(0, 0, 50, 0, 6.283); X.fill();
    ctx.text(X, String(n), 0, 22, { family: 'num', weight: 900, size: 62, color: '#fff' });
    X.restore();
  },
  check(ctx, x, y, s, k, color) { ctx.drawPath(ctx.X, [[x - s, y], [x - s * .3, y + s * .7], [x + s, y - s * .7]], k, { width: s * .3, color, smooth: false }); },
  cross(ctx, x, y, s, k, color) {
    ctx.drawPath(ctx.X, [[x - s, y - s], [x + s, y + s]], ctx.clamp(k * 2), { width: s * .3, color });
    ctx.drawPath(ctx.X, [[x + s, y - s], [x - s, y + s]], ctx.clamp(k * 2 - 1), { width: s * .3, color });
  },
};
MOTION.scene({ id: 'flags',
  draw(t, lt, ctx) {
    const { X, P, at, kf, clamp } = ctx;
    L.bg(ctx, t, { glow: 'rgba(200,40,60,0.12)' });
    const img = ctx.img('email');
    const T = id => ctx.lineSpan(id).s;
    const s1 = T('l4'), s2 = T('l5'), s3 = T('l6'), s4 = T('l7');
    const E = 'expoInOut';
    const fx = kf(t, [[s1 - .1, 417], [s1 + .6, 300, E], [s2 - .1, 300], [s2 + .6, 420, E], [s3 - .1, 420], [s3 + .6, 415, E], [s4 - .1, 415], [s4 + .6, 416, E]]);
    const fy = kf(t, [[s1 - .1, 640], [s1 + .6, 120, E], [s2 - .1, 120], [s2 + .6, 650, E], [s3 - .1, 650], [s3 + .6, 800, E], [s4 - .1, 800], [s4 + .6, 930, E]]);
    const z = kf(t, [[s1 - .1, 0.74], [s1 + .6, 1.9, E], [s2 - .1, 1.9], [s2 + .6, 1.15, E], [s3 - .1, 1.15], [s3 + .6, 1.2, E], [s4 - .1, 1.2], [s4 + .6, 1.7, E]]);
    // viewport
    const VX = 60, VY = 170, VW = 960, VH = 1010;
    X.save(); X.shadowColor = 'rgba(0,0,0,.5)'; X.shadowBlur = 50; X.shadowOffsetY = 20;
    X.fillStyle = '#EEF1F5'; L.rr(X, VX, VY, VW, VH, 40); X.fill(); X.restore();
    X.save(); L.rr(X, VX, VY, VW, VH, 40); X.clip();
    const map = L.cam(X, img, fx, fy, z, 540, 675);
    const w = (id, i) => ctx.wordTime(id, i).s;
    const K = (a, d = 0.5) => at(t, a, a + d, 'cubicOut');
    // flag 1 — sender name
    L.ring(ctx, map, [40, 32, 295, 100], K(w('l4', 2), .6), { seed: 1 });
    { const [x, y] = map(300, 66); L.tag(ctx, 'شركة أجنبية!', Math.min(x + 210, 860), y + 6, K(w('l4', 5), .3), { rot: -0.04 }); }
    { const [x, y] = map(167, 140); L.tag(ctx, 'مو المحافظة', x + 40, y + 70, K(w('l4', 10), .3), { rot: 0.03, bg: '#13253F' }); }
    // flag 2 — no real name
    L.rect(ctx, map, [712, 552, 792, 584], K(w('l5', 4), .5));
    L.rect(ctx, map, [40, 706, 172, 744], K(w('l5', 5), .5));
    L.rect(ctx, map, [598, 586, 792, 620], K(w('l5', 10), .5), { color: '#F2B33D' });
    { const [x, y] = map(598, 603); L.tag(ctx, 'إيميلك', x - 110, y + 4, K(w('l5', 10), .3), { bg: '#F2B33D', color: '#13253F', size: 36 }); }
    { const a = map(700, 600), b = map(160, 712); ctx.drawPath(X, [[a[0], a[1] + 30], [(a[0] + b[0]) / 2, a[1] + 80], [b[0] + 30, b[1] - 40]], K(w('l5', 11), .6), { width: 8, color: '#F2B33D', tip: { r: 10, color: '#F2B33D' } }); }
    // flag 3 — urgency text
    { const k1 = K(w('l6', 2), .6), k2 = K(w('l6', 6), .6);
      X.save(); X.globalCompositeOperation = 'multiply'; X.fillStyle = 'rgba(227,38,60,0.28)';
      const a = map(44, 762), b = map(44 + 740 * k1, 796); if (k1 > 0) X.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
      const c = map(44, 798), d = map(44 + 620 * k2, 830); if (k2 > 0) X.fillRect(c[0], c[1], d[0] - c[0], d[1] - c[1]);
      X.restore(); }
    // flag 4 — button
    const kb = K(w('l7', 2), .6); L.ring(ctx, map, [271, 928, 561, 988], kb, { seed: 4 });
    { const ka = at(t, w('l7', 3), w('l7', 7) + .2, 'cubicInOut'), [bx, by] = map(416, 958);
      if (ka > 0) { const cx = ctx.lerp(bx + 360, bx + 40, ka), cy = ctx.lerp(by + 300, by + 30, ka);
        X.save(); X.translate(cx, cy); X.fillStyle = '#fff'; X.strokeStyle = '#111'; X.lineWidth = 5;
        X.beginPath(); X.moveTo(0, 0); X.lineTo(0, 78); X.lineTo(20, 60); X.lineTo(36, 94); X.lineTo(50, 87); X.lineTo(34, 54); X.lineTo(60, 54); X.closePath(); X.fill(); X.stroke(); X.restore(); }
      // fishing hook on «الفخ»
      const kh = at(t, w('l7', 9) - .1, w('l7', 10) + .4, 'expoOut');
      if (kh > 0) { const hy = ctx.lerp(VY - 40, by - 70, kh);
        X.save(); X.strokeStyle = '#13253F'; X.lineWidth = 5; X.beginPath(); X.moveTo(bx + 150, VY); X.lineTo(bx + 150, hy); X.stroke();
        X.strokeStyle = P.acc; X.lineWidth = 14; X.lineCap = 'round'; X.beginPath(); X.moveTo(bx + 150, hy); X.lineTo(bx + 150, hy + 70);
        X.arc(bx + 120, hy + 70, 30, 0, Math.PI, false); X.lineTo(bx + 82, hy + 52); X.stroke(); X.restore(); }
    }
    X.restore();
    // caption card
    const flags = [
      ['l4', 'اسم جهة غريب', 'GRUPOVANNUCCI — لا علاقة لها بالمحافظة'],
      ['l5', 'ما يعرف اسمك', '«Dear Support» مأخوذة من إيميلك'],
      ['l6', 'فضول واستعجال', '«راتبك تعدّل… أكّد بسرعة»'],
      ['l7', 'زر داخل ملف PDF', 'وهنا يبدأ الفخ'],
    ];
    L.card(ctx, 60, 1215, 960, 270, at(lt, 0.1, 0.5, 'expoOut'), { fill: 'rgba(255,255,255,0.08)', stroke: 'rgba(255,255,255,0.12)' });
    flags.forEach(([id, title, sub], i) => {
      const s = ctx.lineSpan(id).s, e = i < 3 ? ctx.lineSpan(flags[i + 1][0]).s - 0.15 : 1e9;
      const kin = at(t, s - 0.1, s + 0.35, 'expoOut'), kout = at(t, e - 0.2, e, 'cubicIn');
      const a = kin * (1 - kout); if (a <= 0) return;
      X.save(); X.globalAlpha = a;
      L.badge(ctx, i + 1, 880, 1300, kin);
      ctx.text(X, 'علامة ' + (i + 1) + ' من 4', 810, 1290, { family: 'body', weight: 700, size: 34, color: P.mut, align: 'right' });
      ctx.text(X, title, 810, 1365 + (1 - kin) * 30, { family: 'display', weight: 900, size: 74, color: '#fff', align: 'right', maxWidth: 720 });
      ctx.text(X, sub, 810, 1440, { family: 'body', weight: 700, size: 40, color: '#FF8A97', align: 'right', maxWidth: 720, alpha: at(t, s + 0.6, s + 1, 'cubicOut') });
      X.restore();
    });
  } });
