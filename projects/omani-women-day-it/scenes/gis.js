/* قسم نظم المعلومات الجغرافية (14 ث): خريطة الظاهرة تُبنى طبقة طبقة (حدود · طرق · مبانٍ · قمر صناعي)،
   تظهر الولايات، يسقط دبوسان، ومنهما بطاقتا شيخة ومي */
import { backdrop, card, deptTag, icon, makeDust, tagline, MAP, MAP_BOX, TOWNS, TAU } from './_lib.js';

const LAYERS = [['الحدود', .3], ['الطرق', 1.5], ['المباني', 2.6], ['قمر صناعي', 3.7]];
const ROADS = [
  [TOWNS.ibri.p, TOWNS.dank.p, TOWNS.yanqul.p, [MAP_BOX.x + .86 * MAP_BOX.w, MAP_BOX.y + .08 * MAP_BOX.h]],
  [[MAP_BOX.x + .02 * MAP_BOX.w, MAP_BOX.y + .55 * MAP_BOX.h], TOWNS.ibri.p, [MAP_BOX.x + .9 * MAP_BOX.w, MAP_BOX.y + .62 * MAP_BOX.h]],
  [TOWNS.ibri.p, [MAP_BOX.x + .40 * MAP_BOX.w, MAP_BOX.y + .80 * MAP_BOX.h], [MAP_BOX.x + .32 * MAP_BOX.w, MAP_BOX.y + .97 * MAP_BOX.h]],
  [TOWNS.dank.p, [MAP_BOX.x + .36 * MAP_BOX.w, MAP_BOX.y + .26 * MAP_BOX.h], [MAP_BOX.x + .31 * MAP_BOX.w, MAP_BOX.y + .02 * MAP_BOX.h]],
];

MOTION.scene({
  id: 'gis',
  setup(ctx) {
    this.dust = makeDust(ctx, { count: 40, seed: 41, glow: 2 });
    const r = ctx.rng(9); this.bld = [];
    for (const k of Object.keys(TOWNS)) { const [cx, cy] = TOWNS[k].p, n = k === 'ibri' ? 42 : 22; for (let i = 0; i < n; i++) this.bld.push({ x: cx + r.gauss() * (k === 'ibri' ? 60 : 38), y: cy + r.gauss() * (k === 'ibri' ? 44 : 30), s: r.range(5, 11), d: r() }); }
    this.mapPath = new Path2D(); MAP.forEach(([x, y], i) => i ? this.mapPath.lineTo(x, y) : this.mapPath.moveTo(x, y)); this.mapPath.closePath();
  },
  draw(t, lt, ctx) {
    const { X, P, E, at, clamp } = ctx;
    backdrop(X, ctx, t, { glowY: 600, glowColor: 'rgba(94,234,212,.12)', dots: 0 });
    this.dust.draw(X, lt, .5);
    const kL = LAYERS.map(([, s]) => at(lt, s, s + .7, 'expoOut'));

    /* ── شبكة إحداثيات ── */
    X.save(); X.globalAlpha = .9;
    X.strokeStyle = 'rgba(141,162,191,.16)'; X.lineWidth = 1;
    for (let x = 60; x < 1080; x += 60) { X.beginPath(); X.moveTo(x, 180); X.lineTo(x, 960); X.stroke(); }
    for (let y = 180; y < 960; y += 60) { X.beginPath(); X.moveTo(0, y); X.lineTo(1080, y); X.stroke(); }
    X.restore();

    /* ── طبقة الحدود: تعبئة ثم الخط ── */
    X.save();
    if (kL[0] > 0) { X.fillStyle = `rgba(0,179,122,${.10 * kL[0]})`; X.fill(this.mapPath); }
    ctx.drawPath(X, MAP, 1, { width: 6, color: P.hi, smooth: false, glow: 14 * (1 - kL[1] * .6), glowColor: P.hi });
    X.clip(this.mapPath);
    /* ── طبقة الطرق ── */
    if (kL[1] > 0) ROADS.forEach((rd, i) => ctx.drawPath(X, rd, at(lt, LAYERS[1][1] + i * .12, LAYERS[1][1] + i * .12 + .8, 'expoOut'), { width: 3.5, color: 'rgba(245,247,250,.7)', smooth: true }));
    /* ── طبقة المباني ── */
    if (kL[2] > 0) { X.fillStyle = P.ink; this.bld.forEach(b => { const k = E.backOut(at(lt, LAYERS[2][1] + b.d * .6, LAYERS[2][1] + b.d * .6 + .35)); if (k <= 0) return; X.globalAlpha = .85; X.fillRect(b.x - b.s * k / 2, b.y - b.s * k / 2, b.s * k, b.s * k); }); }
    /* ── طبقة القمر الصناعي: مسح ضوئي ينزل ── */
    if (kL[3] > 0 && lt < 7.5) {
      const sy = MAP_BOX.y + (MAP_BOX.h + 60) * ctx.fract((lt - LAYERS[3][1]) / 2.4) - 30;
      const g = X.createLinearGradient(0, sy - 120, 0, sy); g.addColorStop(0, 'rgba(94,234,212,0)'); g.addColorStop(1, 'rgba(94,234,212,.35)');
      X.globalAlpha = kL[3]; X.fillStyle = g; X.fillRect(0, sy - 120, 1080, 120); X.fillStyle = P.hi; X.fillRect(0, sy, 1080, 3);
    }
    X.restore();

    /* ── شريط الطبقات ── */
    LAYERS.forEach(([name, s], i) => {
      const k = at(lt, s - .3, s + .2, 'expoOut'); if (k <= 0) return;
      const bx = 1040 - i * 226, by = 215;
      X.save(); X.globalAlpha = k; X.translate(0, (1 - k) * -20);
      X.fillStyle = kL[i] > .5 ? 'rgba(0,179,122,.2)' : 'rgba(255,255,255,.06)'; X.strokeStyle = kL[i] > .5 ? P.acc : 'rgba(255,255,255,.2)'; X.lineWidth = 2;
      X.beginPath(); X.roundRect(bx - 216, by - 26, 216, 52, 26); X.fill(); X.stroke();
      X.strokeStyle = P.acc; X.fillStyle = P.acc; X.beginPath(); X.roundRect(bx - 44, by - 14, 28, 28, 7); X.stroke();
      if (kL[i] > .5) icon(X, 'check', bx - 30, by, 22, P.acc, 4);
      ctx.text(X, name, bx - 60, by + 11, { family: 'body', weight: 700, size: 30, color: P.ink, align: 'right' });
      X.restore();
    });
    icon(X, 'layers', 72, 215, 50, P.hi, 4.5, at(lt, 0, .5));

    /* ── الولايات ── */
    Object.values(TOWNS).forEach((tw, i) => {
      const k = E.backOut(at(lt, 4.6 + i * .25, 5.1 + i * .25)); if (k <= 0) return;
      const [x, y] = tw.p; X.save(); X.translate(x, y); X.scale(k, k);
      X.fillStyle = P.ink; X.beginPath(); X.arc(0, 0, 7, 0, TAU); X.fill(); X.strokeStyle = P.acc; X.lineWidth = 3; X.beginPath(); X.arc(0, 0, 14, 0, TAU); X.stroke();
      ctx.text(X, tw.name, 0, 54, { family: 'display', weight: 800, size: 38, color: P.ink, stroke: { width: 8, color: 'rgba(11,31,58,.9)' } });
      X.restore();
    });

    /* ── دبابيس تسقط (ينقل ثم عبري) ── */
    [[TOWNS.yanqul.p, 6.2, P.clay], [TOWNS.ibri.p, 6.8, P.acc]].forEach(([p, s, col]) => {
      const k = at(lt, s, s + .7, 'bounceOut'); if (k <= 0) return;
      const [x, y] = p, dy = (1 - k) * -520;
      const kr = at(lt, s + .55, s + 1.5); if (kr > 0 && kr < 1) { X.save(); X.strokeStyle = col; X.globalAlpha = 1 - kr; X.lineWidth = 4; X.beginPath(); X.ellipse(x, y, 70 * kr, 30 * kr, 0, 0, TAU); X.stroke(); X.restore(); }
      X.save(); X.translate(x, y - 46 + dy); X.shadowColor = col; X.shadowBlur = 24; icon(X, 'pin', 0, 0, 90, col, 7); X.fillStyle = col; X.beginPath(); X.arc(0, -13, 8, 0, TAU); X.fill(); X.restore();
    });

    /* ── البطاقات ── */
    deptTag(X, ctx, 'قسم نظم المعلومات الجغرافية', 960, at(lt, 7.2, 7.8), P.clay);
    card(X, ctx, { y: 1000, h: 200, k: at(lt, 7.5, 8.6), name: 'شيخة العلوية', role: 'فنية نظم معلومات جغرافية', icons: ['pin', 'layers'], accent: P.clay, nameSize: 62, roleSize: 36 });
    card(X, ctx, { y: 1230, h: 200, k: at(lt, 7.9, 9.0), name: 'مي البلوشية', role: 'فنية نظم معلومات جغرافية', icons: ['globe', 'satellite'], accent: P.acc, nameSize: 62, roleSize: 36 });
    tagline(X, ctx, 'ترسمان الظاهرة… طبقةً طبقة', 1500, 10.2, lt, { size: 58, weight: 800, color: P.hi });
  },
});
