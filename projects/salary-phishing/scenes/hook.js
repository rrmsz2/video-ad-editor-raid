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
MOTION.scene({ id: 'hook',
  draw(t, lt, ctx) {
    const { X, P, at, lerp } = ctx;
    L.bg(ctx, t);
    const stop = ctx.wordTime('l2', 0).s, no = ctx.wordTime('l2', 1).s;
    const kd = at(t, stop - 0.05, stop + 0.35, 'expoOut');
    // notification banner
    const kin = at(t, 0.12, 0.7, 'expoOut');
    const shake = t > 1.84 && t < stop ? Math.sin(t * 60) * 6 * Math.exp(-(t - 1.84) * 3) : 0;
    const by = lerp(-260, 600, kin) - kd * 140, bx = 70 + shake;
    X.save(); X.globalAlpha = kin;
    X.shadowColor = 'rgba(0,0,0,.45)'; X.shadowBlur = 50; X.shadowOffsetY = 18;
    X.fillStyle = '#F7F8FB'; L.rr(X, bx, by, 940, 230, 44); X.fill(); X.shadowColor = 'transparent';
    // envelope icon (right side, RTL)
    const ix = bx + 790, iy = by + 45;
    X.fillStyle = P.acc; L.rr(X, ix, iy, 120, 120, 28); X.fill();
    X.strokeStyle = '#fff'; X.lineWidth = 7; X.lineJoin = 'round';
    L.rr(X, ix + 24, iy + 34, 72, 52, 6); X.stroke();
    X.beginPath(); X.moveTo(ix + 26, iy + 38); X.lineTo(ix + 60, iy + 64); X.lineTo(ix + 94, iy + 38); X.stroke();
    ctx.text(X, 'Payroll Services Department', bx + 755, by + 80, { family: 'num', weight: 500, size: 34, color: '#5B6B80', align: 'right', dir: 'ltr' });
    ctx.text(X, 'Salary Adjustment Notice', bx + 755, by + 138, { family: 'num', weight: 800, size: 48, color: '#13253F', align: 'right', dir: 'ltr' });
    ctx.text(X, 'Updated_HR_Salary_Review.pdf', bx + 755, by + 188, { family: 'num', weight: 500, size: 30, color: '#8A97A8', align: 'right', dir: 'ltr' });
    // unread dot pulse
    X.fillStyle = P.acc; X.beginPath(); X.arc(bx + 50, by + 115, 14 + 4 * ctx.beatPulse(t, 6), 0, 6.283); X.fill();
    X.restore();
    // headline (l1)
    X.save(); X.globalAlpha = 1 - kd;
    L.say(ctx, t, 'l1', 'وصلك إيميل يقول', 540, 380, { size: 80, to: 2 });
    L.say(ctx, t, 'l1', 'إن راتبك تعدّل؟', 540, 1120, { size: 150, weight: 900, from: 3, to: 5, hot: [2] });
    X.restore();
    // l2: STOP
    if (t > stop - 0.1) {
      X.save(); X.globalAlpha = 0.55 * kd; X.fillStyle = '#050D18'; X.fillRect(0, 0, 1080, 1920); X.restore();
      const ks = at(t, stop - 0.05, stop + 0.3, 'expoOut');
      ctx.text(X, 'لحظة!', 540, 1000 + (1 - ks) * 40, { family: 'display', weight: 900, size: 230 * (0.94 + 0.06 * ks), color: P.acc, alpha: ks });
      L.say(ctx, t, 'l2', 'لا تضغط على شي', 540, 1240, { size: 96, weight: 900, from: 1 });
      // stop sign over banner
      const ko = at(t, no, no + 0.5, 'cubicOut');
      const cx = 540, cy = 600 - 140 + 115;
      ctx.drawPath(X, L.ellipse(cx, cy, 500, 175, 2), ko, { width: 14, color: P.acc });
      ctx.drawPath(X, [[cx - 330, cy + 120], [cx + 330, cy - 120]], at(t, no + 0.4, no + 0.7, 'cubicOut'), { width: 14, color: P.acc });
    }
  } });
