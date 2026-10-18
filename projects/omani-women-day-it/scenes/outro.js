/* الختام (8 ث): ثلاث نوافذ مصغّرة (طرفية · شبكة · خريطة) تندمج في الشعار، الأسماء الخمسة، التهنئة، واسم الجهة */
import { backdrop, emblem, flagBar, icon, makeDust, tagline, TAU } from './_lib.js';

const NAMES = ['عائشة العبري', 'هدى الوائلي', 'علياء الدرعي', 'شيخة العلوي', 'مي البلوشي'];

MOTION.scene({
  id: 'outro',
  setup(ctx) { this.dust = makeDust(ctx, { count: 90, seed: 51, glow: 2.6 }); },
  draw(t, lt, ctx) {
    const { X, P, E, at, kf, clamp } = ctx;
    backdrop(X, ctx, t, { glowY: 600, glowColor: 'rgba(0,179,122,.16)' });
    this.dust.draw(X, lt, .85);

    /* ── ثلاث نوافذ تدخل ثم تندمج في المركز ── */
    const tiles = [['code', P.acc], ['network', P.hi], ['pin', P.clay]];
    const merge = at(lt, 1.6, 2.5, 'expoInOut');
    tiles.forEach(([ic, col], i) => {
      const kin = at(lt, .1 + i * .15, .8 + i * .15, 'expoOut'); if (kin <= 0 || merge >= 1) return;
      const x0 = 540 + (i - 1) * 320, x = ctx.lerp(x0, 540, merge), y = ctx.lerp(520 + (1 - kin) * 80, 520, merge), s = (1 - merge) * E.backOut(kin);
      X.save(); X.globalAlpha = (1 - merge) * kin; X.translate(x, y); X.scale(s, s);
      X.fillStyle = 'rgba(255,255,255,.07)'; X.strokeStyle = col; X.lineWidth = 3; X.beginPath(); X.roundRect(-120, -120, 240, 240, 36); X.fill(); X.stroke();
      icon(X, ic, 0, 0, 120, col, 7); X.restore();
    });
    emblem(X, ctx, 540, 500, 180, at(lt, 2.3, 3.4, 'linear'), ctx.beatPulse(t, 7));
    ctx.text(X, 'دائرة تقنية المعلومات', 540, 740, { family: 'body', weight: 700, size: 42, color: P.ink, alpha: at(lt, 3.2, 3.8) });
    ctx.text(X, 'محافظة الظاهرة', 540, 792, { family: 'body', weight: 400, size: 36, color: P.mut, alpha: at(lt, 3.3, 3.9) });

    /* ── الأسماء الخمسة في كبسولات (3 ثم 2) ── */
    NAMES.forEach((nm, i) => {
      const k = at(lt, 3.6 + i * .14, 4.2 + i * .14, 'backOut'); if (k <= 0) return;
      const row = i < 3 ? 0 : 1, col = i < 3 ? i : i - 3, n = row ? 2 : 3, w = 300, gap = 22;
      const x = 540 + (col - (n - 1) / 2) * (w + gap) * (row ? 1 : 1) * (1) * (i < 3 ? 1 : 1), y = 900 + row * 86;   // الصف الثاني مُوسّط
      X.save(); X.globalAlpha = clamp(k); X.translate(x, y); X.scale(.85 + .15 * k, .85 + .15 * k);
      X.fillStyle = 'rgba(255,255,255,.08)'; X.strokeStyle = 'rgba(94,234,212,.5)'; X.lineWidth = 2; X.beginPath(); X.roundRect(-w / 2, -32, w, 64, 32); X.fill(); X.stroke();
      ctx.text(X, nm, 0, 12, { family: 'display', weight: 700, size: 34, color: P.ink, maxWidth: w - 40 });
      X.restore();
    });

    /* ── التهنئة ── */
    tagline(X, ctx, 'كل عام والمرأة العمانية بخير', 1190, 4.6, lt, { size: 72, weight: 900, color: P.ink, maxWidth: 1000 });
    flagBar(X, ctx, 240, 1240, 600, 12, at(lt, 5.3, 6.2));
    const kd = at(lt, 5.6, 6.2, 'expoOut');
    if (kd > 0) {
      X.save(); X.globalAlpha = kd; X.translate(540, 1370); X.scale(.9 + .1 * E.backOut(kd), .9 + .1 * E.backOut(kd));
      X.fillStyle = 'rgba(255,255,255,.07)'; X.strokeStyle = 'rgba(255,255,255,.2)'; X.lineWidth = 2; X.beginPath(); X.roundRect(-330, -44, 660, 88, 44); X.fill(); X.stroke();
      ctx.text(X, 'يوم المرأة العمانية  ·  17 أكتوبر', 0, 15, { family: 'body', weight: 700, size: 40, color: P.hi });
      X.restore();
    }
  },
});
