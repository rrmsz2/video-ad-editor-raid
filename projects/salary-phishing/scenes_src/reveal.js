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
