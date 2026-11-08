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
MOTION.scene({ id: 'reveal',
  draw(t, lt, ctx) {
    const { X, P, at, lerp } = ctx;
    L.bg(ctx, t);
    const img = ctx.img('email'), z = 0.84, w = img.width * z, h = img.height * z;
    const k = at(lt, 0.0, 0.9, 'expoOut');
    // chip
    const kc = at(t, ctx.wordTime('l3', 0).s - 0.1, ctx.wordTime('l3', 0).s + 0.3, 'expoOut');
    const kc2 = at(t, ctx.wordTime('l3', 6).s - 0.1, ctx.wordTime('l3', 6).s + 0.2, 'cubicOut');
    X.save(); X.globalAlpha = 1 - kc2;
    L.say(ctx, t, 'l3', 'رسالة حقيقية وصلت اليوم', 540, 255, { size: 70, to: 5, hot: [1] });
    X.restore();
    L.say(ctx, t, 'l3', 'خلّنا نكشفها', 540, 255, { size: 80, from: 6, to: 7, hot: [1] });
    // paper
    const x0 = 540 - w / 2, y0 = 330 + (1 - k) * 260;
    X.save(); X.globalAlpha = k;
    X.translate(540, y0 + h / 2); X.rotate((1 - k) * -0.12 + Math.sin(lt * 0.8) * 0.006); X.translate(-540, -(y0 + h / 2));
    X.shadowColor = 'rgba(0,0,0,.5)'; X.shadowBlur = 60; X.shadowOffsetY = 24;
    X.fillStyle = '#fff'; L.rr(X, x0, y0, w, h, 22); X.fill(); X.shadowColor = 'transparent';
    X.save(); L.rr(X, x0, y0, w, h, 22); X.clip(); X.drawImage(img, x0, y0, w, h); X.restore();
    X.restore();
    // magnifier sweep on «نكشفها»
    const ws = ctx.wordTime('l3', 7).s, km = at(t, ws - 0.2, ws + 1.4, 'sineInOut');
    if (km > 0 && k >= 1) {
      const mx = lerp(840, 260, km), my = lerp(430, 1120, km) + Math.sin(km * 6.28) * 60, r = 150, mz = 2;
      const fx = (mx - x0) / z, fy = (my - y0) / z;
      X.save(); X.beginPath(); X.arc(mx, my, r, 0, 6.283); X.clip();
      X.fillStyle = '#fff'; X.fillRect(mx - r, my - r, 2 * r, 2 * r);
      X.drawImage(img, mx - fx * z * mz, my - fy * z * mz, img.width * z * mz, img.height * z * mz);
      X.restore();
      X.save(); X.lineWidth = 16; X.strokeStyle = '#13253F'; X.beginPath(); X.arc(mx, my, r, 0, 6.283); X.stroke();
      X.lineCap = 'round'; X.lineWidth = 34; X.beginPath(); X.moveTo(mx + r * .72, my + r * .72); X.lineTo(mx + r * 1.35, my + r * 1.35); X.stroke(); X.restore();
    }
  } });
