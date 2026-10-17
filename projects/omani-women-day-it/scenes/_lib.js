/* _lib.js — أدوات مشتركة بين مشاهد فيلم «يوم المرأة العمانية»: أيقونات خطّية، بطاقة موظفة، شعار مولّد، شبكة نقاط، شريط العلم */

const TAU = Math.PI * 2;

/* ── أيقونات خطّية (كلها مرسومة حول الصفر داخل صندوق 100×100، بالـstroke الحالي) ── */
export const ICON = {
  headset(X) {
    X.beginPath(); X.arc(0, 4, 38, Math.PI, TAU); X.stroke();
    X.beginPath(); X.roundRect(-50, 2, 18, 32, 7); X.stroke();
    X.beginPath(); X.roundRect(32, 2, 18, 32, 7); X.stroke();
    X.beginPath(); X.moveTo(41, 36); X.quadraticCurveTo(41, 56, 14, 56); X.stroke();
    X.beginPath(); X.arc(10, 56, 5, 0, TAU); X.fill();
  },
  shield(X) {
    X.beginPath(); X.moveTo(0, -46); X.lineTo(40, -32); X.lineTo(40, 2); X.quadraticCurveTo(40, 34, 0, 50); X.quadraticCurveTo(-40, 34, -40, 2); X.lineTo(-40, -32); X.closePath(); X.stroke();
    X.beginPath(); X.moveTo(-16, 2); X.lineTo(-4, 14); X.lineTo(18, -10); X.stroke();
  },
  wrench(X) {
    X.save(); X.rotate(-Math.PI / 4);
    X.beginPath(); X.arc(0, -28, 17, Math.PI * 0.2, Math.PI * 1.8); X.stroke();
    X.beginPath(); X.roundRect(-9, -14, 18, 60, 6); X.stroke();
    X.restore();
  },
  laptop(X) {
    X.beginPath(); X.roundRect(-40, -32, 80, 52, 6); X.stroke();
    X.beginPath(); X.moveTo(-52, 32); X.lineTo(52, 32); X.stroke();
    X.beginPath(); X.moveTo(-12, 32); X.lineTo(12, 32); X.stroke();
  },
  server(X) {
    for (let i = 0; i < 3; i++) { const y = -42 + i * 29; X.beginPath(); X.roundRect(-40, y, 80, 24, 5); X.stroke(); X.beginPath(); X.arc(-26, y + 12, 3.5, 0, TAU); X.fill(); X.beginPath(); X.moveTo(-10, y + 12); X.lineTo(26, y + 12); X.stroke(); }
  },
  code(X) {
    X.beginPath(); X.moveTo(-18, -24); X.lineTo(-42, 0); X.lineTo(-18, 24); X.stroke();
    X.beginPath(); X.moveTo(18, -24); X.lineTo(42, 0); X.lineTo(18, 24); X.stroke();
    X.beginPath(); X.moveTo(8, -34); X.lineTo(-8, 34); X.stroke();
  },
  network(X) {
    const pts = [[0, -40], [40, 20], [-40, 20]];
    for (const p of pts) { X.beginPath(); X.moveTo(0, 0); X.lineTo(p[0], p[1]); X.stroke(); }
    X.beginPath(); X.arc(0, 0, 12, 0, TAU); X.fill();
    for (const p of pts) { X.beginPath(); X.arc(p[0], p[1], 9, 0, TAU); X.stroke(); }
  },
  pin(X) {
    X.beginPath(); X.moveTo(0, 48); X.quadraticCurveTo(-36, 4, -36, -14); X.arc(0, -14, 36, Math.PI, TAU); X.quadraticCurveTo(36, 4, 0, 48); X.stroke();
    X.beginPath(); X.arc(0, -14, 13, 0, TAU); X.stroke();
  },
  layers(X) {
    for (let i = 0; i < 3; i++) { const y = -24 + i * 22; X.beginPath(); X.moveTo(0, y - 18); X.lineTo(44, y); X.lineTo(0, y + 18); X.lineTo(-44, y); X.closePath(); X.stroke(); }
  },
  globe(X) {
    X.beginPath(); X.arc(0, 0, 42, 0, TAU); X.stroke();
    X.beginPath(); X.ellipse(0, 0, 18, 42, 0, 0, TAU); X.stroke();
    X.beginPath(); X.moveTo(-42, 0); X.lineTo(42, 0); X.stroke();
    X.beginPath(); X.moveTo(-36, -20); X.lineTo(36, -20); X.stroke();
    X.beginPath(); X.moveTo(-36, 20); X.lineTo(36, 20); X.stroke();
  },
  satellite(X) {
    X.save(); X.rotate(Math.PI / 4);
    X.beginPath(); X.roundRect(-12, -12, 24, 24, 4); X.stroke();
    X.beginPath(); X.roundRect(-50, -9, 30, 18, 3); X.stroke();
    X.beginPath(); X.roundRect(20, -9, 30, 18, 3); X.stroke();
    X.beginPath(); X.moveTo(-20, 0); X.lineTo(-12, 0); X.moveTo(12, 0); X.lineTo(20, 0); X.stroke();
    X.restore();
    X.beginPath(); X.arc(0, 0, 34, Math.PI * 1.15, Math.PI * 1.45); X.stroke();
    X.beginPath(); X.arc(0, 0, 48, Math.PI * 1.18, Math.PI * 1.42); X.stroke();
  },
  router(X) {
    X.beginPath(); X.roundRect(-44, 6, 88, 30, 8); X.stroke();
    X.beginPath(); X.arc(-26, 21, 4, 0, TAU); X.fill(); X.beginPath(); X.arc(-10, 21, 4, 0, TAU); X.fill();
    X.beginPath(); X.moveTo(24, 6); X.lineTo(24, -30); X.stroke();
    X.beginPath(); X.arc(24, -30, 14, Math.PI * 1.15, Math.PI * 1.85); X.stroke();
    X.beginPath(); X.arc(24, -30, 26, Math.PI * 1.2, Math.PI * 1.8); X.stroke();
  },
  db(X) {
    X.beginPath(); X.ellipse(0, -30, 38, 13, 0, 0, TAU); X.stroke();
    X.beginPath(); X.moveTo(-38, -30); X.lineTo(-38, 30); X.ellipse(0, 30, 38, 13, 0, Math.PI, 0, true); X.lineTo(38, -30); X.stroke();
    X.beginPath(); X.ellipse(0, 0, 38, 13, 0, 0, Math.PI); X.stroke();
  },
  check(X) { X.beginPath(); X.moveTo(-26, 2); X.lineTo(-8, 20); X.lineTo(30, -20); X.stroke(); },
};

/* يرسم أيقونة باسمها عند (x,y) بحجم s (نسبة إلى 100) */
export function icon(X, name, x, y, s, color, width = 6, alpha = 1) {
  X.save(); X.translate(x, y); X.scale(s / 100, s / 100);
  X.strokeStyle = color; X.fillStyle = color; X.lineWidth = width / (s / 100); X.lineCap = 'round'; X.lineJoin = 'round'; X.globalAlpha *= alpha;
  ICON[name](X); X.restore();
}

/* ── خلفية: شبكة نقاط خفيفة + توهّج خافت ── */
export function backdrop(X, ctx, t, { glowY = 760, glowR = 900, glowColor = null, dots = 1 } = {}) {
  const { W, H, P } = ctx;
  X.fillStyle = P.bg; X.fillRect(0, 0, W, H);
  const g = X.createRadialGradient(540, glowY, 0, 540, glowY, glowR);
  g.addColorStop(0, glowColor || 'rgba(0,179,122,.16)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  X.fillStyle = g; X.fillRect(0, 0, W, H);
  if (dots > 0) {
    X.fillStyle = `rgba(141,162,191,${0.16 * dots})`;
    const step = 60, off = (t * 12) % step;
    for (let y = -step + off; y < H + step; y += step) for (let x = 30; x < W; x += step) { X.beginPath(); X.arc(x, y, 1.6, 0, TAU); X.fill(); }
  }
}

/* ── شريط العلم العماني (أبيض · أحمر · أخضر) يرسم من اليمين إلى اليسار بـk ── */
export function flagBar(X, ctx, x, y, w, h, k) {
  if (k <= 0) return;
  const cols = ['#F5F7FA', ctx.P.clay, ctx.P.acc], seg = w / 3, kk = ctx.E.expoOut(k);
  X.save();
  for (let i = 0; i < 3; i++) {
    const a = ctx.clamp(kk * 3 - i); if (a <= 0) break;
    const sx = x + w - (i + 1) * seg;   // من اليمين
    X.fillStyle = cols[i]; X.beginPath(); X.roundRect(sx + seg * (1 - a), y, seg * a, h, h / 2); X.fill();
  }
  X.restore();
}

/* ── شعار مولّد: سداسي بدوائر عقد + حلقة داخلية + حرفا «ت م» — k رسم الخط (0..1)، pulse نبضة ── */
export function emblem(X, ctx, cx, cy, r, k, pulse = 0, alpha = 1) {
  if (k <= 0) return;
  const { P, E } = ctx;
  X.save(); X.translate(cx, cy); X.globalAlpha *= alpha; X.scale(1 + pulse * .04, 1 + pulse * .04);
  const hex = []; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + i * TAU / 6; hex.push([Math.cos(a) * r, Math.sin(a) * r]); } hex.push(hex[0]);
  // توهّج تحت الشعار
  const g = X.createRadialGradient(0, 0, r * .2, 0, 0, r * 1.5); g.addColorStop(0, 'rgba(94,234,212,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  X.fillStyle = g; X.globalAlpha *= ctx.clamp(k * 2); X.beginPath(); X.arc(0, 0, r * 1.5, 0, TAU); X.fill(); X.globalAlpha = alpha;
  // الشعار المرفوع: السداسي يُرسم خطاً ثم تظهر الوردة داخله (السداسي في الصورة: المركز 626,610 ونصف القطر 575 من 1254)
  const logo = ctx.img('logo');
  if (logo) {
    const kh = E.expoOut(ctx.clamp(k * 1.6)), kl = E.cubicOut(ctx.clamp(k * 1.6 - .45));
    if (kl < 1) { X.save(); X.globalAlpha *= 1 - kl; ctx.drawPath(X, hex, kh, { width: 6, color: P.hi, smooth: false, glow: 18, glowColor: P.hi, tip: { r: 7, color: '#fff', glow: 20 } }); X.restore(); }
    if (kl > 0) {
      const s = r / 575 * (.94 + .06 * kl);
      X.save(); X.globalAlpha = alpha * kl;
      X.beginPath(); hex.forEach(([x, y], i) => i ? X.lineTo(x * 1.035, y * 1.035) : X.moveTo(x * 1.035, y * 1.035)); X.clip();
      X.drawImage(logo, -626 * s, -610 * s, 1254 * s, 1254 * s);
      // لمعة تمر قطرياً بعد الظهور
      const ks = ctx.clamp(k * 1.6 - 1.05) * 1.4;
      if (ks > 0 && ks < 1) { const gx = -r * 1.4 + ks * r * 2.8, g2 = X.createLinearGradient(gx - 90, -r, gx + 90, r); g2.addColorStop(0, 'rgba(255,255,255,0)'); g2.addColorStop(.5, 'rgba(255,255,255,.22)'); g2.addColorStop(1, 'rgba(255,255,255,0)'); X.globalCompositeOperation = 'screen'; X.fillStyle = g2; X.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4); }
      X.restore();
    }
    X.restore(); return;
  }
  // السداسي (رسم خط)
  ctx.drawPath(X, hex, E.expoOut(ctx.clamp(k * 1.2)), { width: 7, color: P.hi, smooth: false, glow: 18, glowColor: P.hi, tip: { r: 7, color: '#fff', glow: 20 } });
  // عقد على الرؤوس
  for (let i = 0; i < 6; i++) { const kk = E.backOut(ctx.clamp(k * 1.6 - .2 - i * .12)); if (kk <= 0) continue; X.fillStyle = i % 2 ? P.acc : P.ink; X.beginPath(); X.arc(hex[i][0], hex[i][1], 9 * kk, 0, TAU); X.fill(); }
  // الحلقة الداخلية (قوسان متقابلان)
  const ki = E.expoOut(ctx.clamp(k * 1.5 - .4));
  if (ki > 0) { X.strokeStyle = P.acc; X.lineWidth = 5; X.lineCap = 'round'; for (let s = 0; s < 2; s++) { X.beginPath(); X.arc(0, 0, r * .62, s * Math.PI + .25, s * Math.PI + .25 + (Math.PI - .5) * ki); X.stroke(); } }
  // مسارات دائرة إلكترونية صغيرة من الحلقة للرؤوس
  const kc = ctx.clamp(k * 1.5 - .6);
  if (kc > 0) { X.strokeStyle = 'rgba(245,247,250,.45)'; X.lineWidth = 3; for (let i = 0; i < 6; i += 2) { const a = -Math.PI / 2 + i * TAU / 6; X.beginPath(); X.moveTo(Math.cos(a) * r * .66, Math.sin(a) * r * .66); X.lineTo(Math.cos(a) * r * .66 * (1 + .3 * kc), Math.sin(a) * r * .66 * (1 + .3 * kc)); X.stroke(); } }
  // الحرفان
  const kt = E.backOut(ctx.clamp(k * 1.5 - .5));
  if (kt > 0) { X.save(); X.scale(kt, kt); ctx.text(X, 'ت م', 0, r * .19, { family: 'display', weight: 900, size: r * .56, color: P.ink }); X.restore(); }
  X.restore();
}

/* ── بطاقة موظفة: {x,y,w,h,k,name,role,icons:[a,b],accent} ── */
export function card(X, ctx, o) {
  const k = ctx.clamp(o.k); if (k <= 0) return;
  const { P, E } = ctx, s = E.springK(k), w = o.w || 860, h = o.h || 210, x = o.x ?? (540 - w / 2), y = o.y, acc = o.accent || P.acc;
  X.save(); X.globalAlpha *= ctx.clamp(k * 3);
  X.translate(x + w / 2, y + h / 2); X.scale(.88 + .12 * s, .88 + .12 * s); X.translate(-(x + w / 2), -(y + h / 2) + (1 - s) * 50);
  // الزجاج
  const g = X.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, 'rgba(255,255,255,.09)'); g.addColorStop(1, 'rgba(255,255,255,.035)');
  X.shadowColor = 'rgba(0,0,0,.45)'; X.shadowBlur = 40; X.shadowOffsetY = 18;
  X.fillStyle = g; X.beginPath(); X.roundRect(x, y, w, h, 28); X.fill(); X.shadowColor = 'transparent';
  X.strokeStyle = 'rgba(255,255,255,.16)'; X.lineWidth = 1.5; X.stroke();
  // شريط التمييز (يمين)
  X.fillStyle = acc; X.beginPath(); X.roundRect(x + w - 14, y + 28, 8, h - 56, 4); X.fill();
  // دائرة الأيقونة
  const ix = x + w - 120, iy = y + h / 2;
  const gi = X.createRadialGradient(ix, iy, 10, ix, iy, 72); gi.addColorStop(0, acc + '55'); gi.addColorStop(1, acc + '00');
  X.fillStyle = gi; X.beginPath(); X.arc(ix, iy, 72, 0, TAU); X.fill();
  X.strokeStyle = acc + '88'; X.lineWidth = 2; X.beginPath(); X.arc(ix, iy, 64, 0, TAU); X.stroke();
  const ic = o.icons || [];
  if (ic.length === 1) icon(X, ic[0], ix, iy, 64, P.ink, 5.5);
  else { icon(X, ic[0], ix - 16, iy - 10, 54, P.ink, 5.5); icon(X, ic[1], ix + 22, iy + 22, 40, acc, 5); }
  // الاسم والمسمّى (يمين ← يسار)
  const tx = x + w - 214;
  ctx.text(X, o.name, tx, y + h * .47, { family: 'display', weight: 800, size: o.nameSize || 66, color: P.ink, align: 'right', maxWidth: w - 260 });
  ctx.text(X, o.role, tx, y + h * .80, { family: 'body', weight: 700, size: o.roleSize || 38, color: P.hi, align: 'right', maxWidth: w - 260 });
  X.restore();
}

/* ── شارة القسم (كبسولة صغيرة فوق البطاقات) ── */
export function deptTag(X, ctx, label, y, k, accent) {
  if (k <= 0) return;
  const { P, E } = ctx, kk = E.expoOut(k), acc = accent || P.acc;
  X.save(); X.globalAlpha *= kk;
  X.font = ctx.font('body', 700, 34); const w = X.measureText(label).width + 90;
  X.translate(540, y); X.scale(.9 + .1 * kk, .9 + .1 * kk);
  X.fillStyle = acc + '22'; X.strokeStyle = acc; X.lineWidth = 2; X.beginPath(); X.roundRect(-w / 2, -30, w, 60, 30); X.fill(); X.stroke();
  X.fillStyle = acc; X.beginPath(); X.arc(w / 2 - 34, 0, 7, 0, TAU); X.fill();
  ctx.text(X, label, 8, 12, { family: 'body', weight: 700, size: 34, color: P.ink });
  X.restore();
}

/* ── عبارة المشهد: سطر كبير يظهر كلمة كلمة من اليمين ── */
export function tagline(X, ctx, str, y, t0, t, { size = 54, color = null, family = 'display', weight = 700, maxWidth = 920 } = {}) {
  if (t < t0) return;
  const L = ctx.text.layout(X, str, { family, weight, size, maxWidth });
  ctx.text.drawLayout(X, L, 540, y, { color: color || ctx.P.ink, perWord: i => { const k = ctx.at(t, t0 + i * .11, t0 + i * .11 + .42, 'expoOut'); return { clipUp: 1, dy: (1 - k) * 48, alpha: k > 0 ? 1 : 0 }; } });
}

/* ── رقعة ثلاثية الأبعاد مشتركة: جسيمات متوهّجة تطفو ببطء خلف المشهد ── */
export function makeDust(ctx, { count = 55, seed = 11, glow = 2.2, spread = 9 } = {}) {
  const st = ctx.stage3D({ fov: 34, camera: [0, 0, 14], tone: 'neutral', bloom: { strength: .9, radius: .6, threshold: 1.3 } });
  const dust = ctx.particles3D({ count, seed, geometry: 'octa', glow, color: ctx.P.hi,
    spawn: (i, r) => ({ p: [r.range(-spread * .45, spread * .45), r.range(-spread, spread), r.range(-4, 2)], v: [r.gauss() * .08, r.range(.12, .4), 0], s: r.range(.018, .045), spin: [r.gauss(), r.gauss(), 0], delay: 0, life: 1e9 }) });
  st.add(dust.mesh);
  return { st, dust, draw(X, lt, alpha = .8) { dust.update(lt); st.orbit(Math.sin(lt * .12) * .06, .03, 14); st.draw(X, { alpha }); } };
}

export { TAU };

/* ── خريطة الظاهرة (شكل تقريبي مبسّط) داخل صندوق x 160..920 · y 270..900 ── */
const MAP_N = [[.30, 0], [.41, .015], [.52, .005], [.62, .02], [.70, .055], [.78, .10], [.85, .15], [.92, .22], [.89, .30], [.86, .40], [.91, .46], [.95, .52], [.88, .59], [.80, .66], [.76, .75], [.70, .84], [.63, .91], [.55, .98], [.43, .97], [.30, 1], [.20, .92], [.10, .80], [.04, .66], [0, .52], [.02, .38], [.06, .24], [.14, .12]];
export const MAP_BOX = { x: 160, y: 270, w: 760, h: 630 };
export const MAP = MAP_N.map(([u, v]) => [MAP_BOX.x + u * MAP_BOX.w, MAP_BOX.y + v * MAP_BOX.h]); MAP.push(MAP[0]);
export const TOWNS = { ibri: { name: 'عبري', p: [MAP_BOX.x + .50 * MAP_BOX.w, MAP_BOX.y + .58 * MAP_BOX.h] }, yanqul: { name: 'ينقل', p: [MAP_BOX.x + .72 * MAP_BOX.w, MAP_BOX.y + .23 * MAP_BOX.h] }, dank: { name: 'ضنك', p: [MAP_BOX.x + .58 * MAP_BOX.w, MAP_BOX.y + .38 * MAP_BOX.h] } };
