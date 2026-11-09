MOTION.scene({ id: 'tips',
  draw(t, lt, ctx) {
    const { X, P, at } = ctx;
    L.bg(ctx, t, { glow: 'rgba(39,179,106,0.16)' });
    const kt = at(t, ctx.lineSpan('l11').s - .1, ctx.lineSpan('l11').s + .4, 'expoOut');
    ctx.text(X, 'تذكّر', 540, 330 + (1 - kt) * 40, { family: 'display', weight: 900, size: 150, color: '#fff', alpha: kt });
    ctx.drawPath(X, [[380, 375], [540, 385], [700, 372]], at(t, ctx.lineSpan('l11').s + .2, ctx.lineSpan('l11').s + .6), { width: 12, color: P.hi });
    const items = [
      ['l11', 'افحص الرابط قبل لا تضغط', 'تأكّد إنه ينتهي بـ dhr.gov.om', 'mag'],
      ['l12', 'كلمة المرور فقط في الموقع الرسمي', 'لا تكتبها في صفحة جت من رابط', 'lock'],
      ['l13', 'شكّيت؟ بلّغ فورًا', 'دائرة تقنية المعلومات', 'mega'],
    ];
    items.forEach(([id, title, sub, icon], i) => {
      const s = ctx.lineSpan(id).s, k = at(t, s - .15, s + .35, 'expoOut'); if (k <= 0) return;
      const next = i < 2 ? ctx.lineSpan(items[i + 1][0]).s : 1e9, dim = 1 - 0.35 * at(t, next - .1, next + .3, 'cubicOut');
      const y = 480 + i * 320;
      X.save(); X.globalAlpha = dim;
      L.card(ctx, 60, y, 960, 270, k, { fill: 'rgba(255,255,255,0.08)', stroke: i === 2 ? 'rgba(39,179,106,.5)' : 'rgba(255,255,255,.12)' });
      X.save(); X.globalAlpha *= k; X.translate(0, (1 - k) * 40);
      // icon disc
      const cx = 870, cy = y + 135;
      X.fillStyle = P.hi; X.beginPath(); X.arc(cx, cy, 78, 0, 6.283); X.fill();
      X.strokeStyle = '#fff'; X.fillStyle = '#fff'; X.lineWidth = 11; X.lineCap = 'round'; X.lineJoin = 'round';
      if (icon === 'mag') { X.beginPath(); X.arc(cx - 8, cy - 8, 28, 0, 6.283); X.stroke(); X.beginPath(); X.moveTo(cx + 13, cy + 13); X.lineTo(cx + 36, cy + 36); X.stroke(); }
      if (icon === 'lock') { X.beginPath(); X.arc(cx, cy - 12, 22, Math.PI, 0); X.stroke(); L.rr(X, cx - 34, cy - 12, 68, 50, 8); X.fill(); X.fillStyle = P.hi; X.beginPath(); X.arc(cx, cy + 12, 7, 0, 6.283); X.fill(); }
      if (icon === 'mega') { X.beginPath(); X.moveTo(cx + 30, cy - 34); X.lineTo(cx + 30, cy + 34); X.lineTo(cx - 10, cy + 14); X.lineTo(cx - 30, cy + 14); X.lineTo(cx - 30, cy - 14); X.lineTo(cx - 10, cy - 14); X.closePath(); X.fill();
        X.lineWidth = 7; X.beginPath(); X.arc(cx + 30, cy, 18, -1, 1); X.stroke(); }
      ctx.text(X, title, 760, y + 125, { family: 'display', weight: 900, size: 58, color: '#fff', align: 'right', maxWidth: 660 });
      ctx.text(X, sub, 760, y + 200, { family: 'body', weight: 700, size: 40, color: '#9BE7BE', align: 'right', maxWidth: 660, alpha: at(t, s + .4, s + .8) });
      X.restore(); X.restore();
    });
  } });
