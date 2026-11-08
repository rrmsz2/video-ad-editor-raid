MOTION.scene({ id: 'link',
  draw(t, lt, ctx) {
    const { X, P, at, kf, lerp } = ctx;
    L.bg(ctx, t, { glow: 'rgba(200,40,60,0.14)' });
    const img = ctx.img('browser');
    const w = (id, i) => ctx.wordTime(id, i).s;
    const s8 = ctx.lineSpan('l8').s, s9 = ctx.lineSpan('l9').s, s10 = ctx.lineSpan('l10').s, E = 'expoInOut';
    const fx = kf(t, [[s8 - .2, 562], [s8 + .5, 560, E], [s9 - .1, 560], [s9 + .6, 562, E], [s10 - .1, 562], [s10 + .6, 560, E]]);
    const fy = kf(t, [[s8 - .2, 1000], [s8 + .5, 60, E], [s9 - .1, 60], [s9 + .6, 1180, E], [s10 - .1, 1180], [s10 + .6, 1290, E]]);
    const z = kf(t, [[s8 - .2, 0.47], [s8 + .5, 1.6, E], [s9 - .1, 1.6], [s9 + .6, 0.95, E], [s10 - .1, 0.95], [s10 + .6, 1.75, E]]);
    const VX = 60, VY = 170, VW = 960, VH = 1010;
    X.save(); X.shadowColor = 'rgba(0,0,0,.6)'; X.shadowBlur = 50; X.shadowOffsetY = 20;
    X.fillStyle = '#1A1F26'; L.rr(X, VX - 14, VY - 14, VW + 28, VH + 28, 54); X.fill(); X.restore();
    X.save(); L.rr(X, VX, VY, VW, VH, 40); X.clip(); X.fillStyle = '#fff'; X.fillRect(VX, VY, VW, VH);
    const map = L.cam(X, img, fx, fy, z, 540, VY + (fy < 200 ? 300 : 505));
    const K = (a, d = 0.5) => at(t, a, a + d, 'cubicOut');
    // l8 — url
    L.ring(ctx, map, [380, 18, 740, 98], K(w('l8', 1), .6), { seed: 3, width: 11 });
    // l9 — fake "down" background, popup, prefilled email
    L.rect(ctx, map, [0, 830, 560, 1140], K(w('l9', 4), .6), { color: '#F2B33D', width: 8 });
    const kp = at(t, w('l9', 7) - .05, w('l9', 7) + .45, 'expoOut'), kpo = at(t, s10 - .1, s10 + .3, 'cubicOut');
    if (kp > 0) {
      const [x0, y0] = map(336, 992), [x1, y1] = map(778, 1490), s = 1 + 0.07 * kp * (1 - kpo), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      X.save(); X.translate(cx, cy - 20 * kp * (1 - kpo)); X.scale(s, s); X.translate(-cx, -cy);
      X.shadowColor = 'rgba(0,0,0,' + (.45 * kp * (1 - kpo)) + ')'; X.shadowBlur = 50; X.shadowOffsetY = 26;
      X.drawImage(img, 336, 992, 442, 498, x0, y0, x1 - x0, y1 - y0); X.shadowColor = 'transparent';
      X.lineWidth = 8; X.strokeStyle = P.acc; X.globalAlpha = 1 - kpo; L.rr(X, x0, y0, x1 - x0, y1 - y0, 14); X.stroke();
      X.restore();
    }
    L.rect(ctx, map, [375, 1190, 746, 1245], K(w('l9', 10), .5) * (1 - kpo), { color: '#F2B33D', width: 8 });
    // l10 — password typed then stolen
    const nd = 8, [px, py] = map(390, 1290), [px1] = map(746, 1290);
    for (let i = 0; i < nd; i++) {
      const ki = K(w('l10', 2) + i * 0.13, 0.08); if (ki <= 0) continue;
      const kf2 = at(t, w('l10', 5) + i * 0.04, w('l10', 5) + 0.7 + i * 0.04, 'cubicIn');
      const dx = px + 40 + i * 40, x = lerp(dx, 900, kf2), y = lerp(py, 230, kf2) - Math.sin(kf2 * 3.14) * 120;
      X.fillStyle = kf2 > 0 ? P.acc : '#222'; X.beginPath(); X.arc(x, y, 12, 0, 6.283); X.fill();
    }
    X.restore();
    // thief badge
    const kt = at(t, w('l10', 5) + .3, w('l10', 6) + .2, 'expoOut');
    if (kt > 0) { X.save(); X.globalAlpha = kt; X.translate(880, 250); X.scale(.9 + .1 * kt, .9 + .1 * kt);
      X.fillStyle = P.acc; L.rr(X, -80, -80, 160, 160, 36); X.fill();
      X.strokeStyle = '#fff'; X.lineWidth = 12; X.lineCap = 'round';
      X.beginPath(); X.arc(-12, -22, 30, Math.PI, 0); X.stroke();              // open shackle
      X.fillStyle = '#fff'; L.rr(X, -46, -10, 92, 66, 10); X.fill();
      X.fillStyle = P.acc; X.beginPath(); X.arc(0, 18, 9, 0, 6.283); X.fill(); X.restore(); }
    const kr = at(t, w('l10', 6), w('l10', 6) + .15, 'cubicOut') * (1 - at(t, w('l10', 6) + .2, w('l10', 6) + .8, 'cubicOut'));
    if (kr > 0) { X.save(); X.globalAlpha = kr * .35; X.fillStyle = P.acc; X.fillRect(0, 0, 1080, 1920); X.restore(); }
    // caption card
    L.card(ctx, 60, 1215, 960, 270, 1, { fill: 'rgba(255,255,255,0.08)', stroke: 'rgba(255,255,255,0.12)' });
    const seg = (a, b) => at(t, a - .1, a + .3, 'expoOut') * (1 - at(t, b - .2, b, 'cubicIn'));
    // l8
    { const a = seg(s8, s9 - .1); if (a > 0) { X.save(); X.globalAlpha = a;
      ctx.text(X, 'الرابط مو رابطنا', 540, 1300, { family: 'display', weight: 900, size: 64, color: '#fff' });
      const kc = K(w('l8', 3), .4);
      ctx.text(X, 'bromotec.com', 700, 1420, { family: 'num', weight: 800, size: 50, color: '#FF8A97', dir: 'ltr' });
      L.cross(ctx, 905, 1404, 20, K(w('l8', 2) + .3, .4), P.acc);
      ctx.text(X, 'dhr.gov.om', 330, 1420, { family: 'num', weight: 800, size: 50, color: '#7BE3A8', dir: 'ltr', alpha: kc });
      L.check(ctx, 150, 1404, 22, K(w('l8', 7), .4), P.hi);
      X.restore(); } }
    // l9
    { const a = seg(s9, s10 - .1); if (a > 0) { X.save(); X.globalAlpha = a;
      ctx.text(X, 'صفحة دخول مزيّفة', 540, 1300, { family: 'display', weight: 900, size: 64, color: '#fff' });
      const subs = [[w('l9', 0), 'تتظاهر إن موقعنا واقف'], [w('l9', 5), 'وتحط فوقه نافذة دخول'], [w('l9', 10), 'وإيميلك مكتوب فيها جاهز']];
      subs.forEach(([s, str], i) => { const e = i < 2 ? subs[i + 1][0] : 1e9; const b = seg(s, e);
        if (b > 0) ctx.text(X, str, 540, 1425 + (1 - at(t, s - .1, s + .3, 'expoOut')) * 24, { family: 'body', weight: 700, size: 46, color: '#F2B33D', alpha: b }); });
      X.restore(); } }
    // l10
    { const a = seg(s10, 1e9); if (a > 0) { X.save(); X.globalAlpha = a;
      ctx.text(X, 'أي كلمة مرور تكتبها هنا', 540, 1310, { family: 'display', weight: 900, size: 62, color: '#fff' });
      L.say(ctx, t, 'l10', 'توصل للمخترق على طول', 540, 1425, { size: 58, weight: 900, from: 5, color: '#FF8A97' });
      X.restore(); } }
  } });
