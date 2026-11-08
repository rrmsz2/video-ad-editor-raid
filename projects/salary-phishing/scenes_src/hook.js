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
