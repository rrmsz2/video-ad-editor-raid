MOTION.scene({ id: 'outro',
  draw(t, lt, ctx) {
    const { X, P, at } = ctx;
    X.fillStyle = '#F4F6FA'; X.fillRect(0, 0, 1080, 1920);
    L.say(ctx, t, 'l14', 'ضغطة وحدة', 540, 400, { size: 130, weight: 900, to: 1, color: '#0A1A2F' });
    L.say(ctx, t, 'l14', 'ممكن تكلّف وايد', 540, 560, { size: 100, weight: 900, from: 2, to: 4, color: P.acc });
    const logo = ctx.img('logo'), kl = at(t, ctx.wordTime('l14', 5).s - .3, ctx.wordTime('l14', 5).s + .5, 'expoOut');
    if (kl > 0) { const s = 0.62 * (0.95 + 0.05 * kl), w = logo.width * s, h = logo.height * s;
      X.save(); X.globalAlpha = kl; X.drawImage(logo, 540 - w / 2, 690 + (1 - kl) * 30, w, h); X.restore(); }
    const kp = at(t, ctx.wordTime('l14', 5).s - .05, ctx.wordTime('l14', 5).s + .35, 'expoOut');
    if (kp > 0) { X.save(); X.globalAlpha = kp; X.translate(540, 1330); X.scale(.94 + .06 * kp, .94 + .06 * kp);
      X.fillStyle = '#0A1A2F'; L.rr(X, -280, -85, 560, 150, 75); X.fill();
      ctx.text(X, 'خلّك واعي', 0, 22, { family: 'display', weight: 900, size: 86, color: '#fff' }); X.restore(); }
  } });
