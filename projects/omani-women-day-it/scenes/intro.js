/* الافتتاحية (0–8 ث): شعار مولّد يُرسم خطاً خطاً، ثم العنوان كلمة كلمة، ثم كبسولة المناسبة وشريط العلم */
import { backdrop, emblem, flagBar, makeDust, tagline } from './_lib.js';

MOTION.scene({
  id: 'intro',
  setup(ctx) { this.dust = makeDust(ctx, { count: 70, seed: 11 }); },
  draw(t, lt, ctx) {
    const { X, P, E, at, kf } = ctx;
    backdrop(X, ctx, t, { glowY: 700, glowColor: 'rgba(94,234,212,.14)' });
    this.dust.draw(X, lt, .75);

    // الشعار: يُرسم بالمنتصف ثم يصعد ويصغر ليفسح للعنوان
    const k = at(lt, .2, 2.2, 'linear');
    const [cy, r] = kf(lt, [[2.3, [880, 230]], [3.1, [520, 150], 'expoInOut']]);
    emblem(X, ctx, 540, cy, r, k, ctx.beatPulse(t, 7) * at(lt, 2.2, 2.4));
    // اسم الجهة تحت الشعار
    const kn = at(lt, 1.6, 2.3, 'expoOut');
    if (kn > 0) {
      const ny = kf(lt, [[2.3, 1190], [3.1, 720, 'expoInOut']]);
      ctx.text(X, 'دائرة تقنية المعلومات', 540, ny, { family: 'body', weight: 700, size: 44, color: P.ink, alpha: kn });
      ctx.text(X, 'محافظة الظاهرة', 540, ny + 56, { family: 'body', weight: 400, size: 38, color: P.mut, alpha: kn });
    }

    // العنوان
    tagline(X, ctx, 'بأيديهن…', 960, 3.2, lt, { size: 118, weight: 900, color: P.hi });
    tagline(X, ctx, 'تُدار التقنية في الظاهرة', 1100, 3.7, lt, { size: 92, weight: 800 });

    // كبسولة المناسبة + شريط العلم
    const kp = at(lt, 5.0, 5.7, 'expoOut');
    if (kp > 0) {
      X.save(); X.globalAlpha = kp; X.translate(540, 1290); X.scale(.9 + .1 * E.backOut(kp), .9 + .1 * E.backOut(kp));
      X.fillStyle = 'rgba(255,255,255,.07)'; X.strokeStyle = 'rgba(255,255,255,.2)'; X.lineWidth = 2;
      X.beginPath(); X.roundRect(-400, -46, 800, 92, 46); X.fill(); X.stroke();
      ctx.text(X, 'يوم المرأة العمانية  ·  17 أكتوبر', 0, 16, { family: 'body', weight: 700, size: 42, color: P.ink });
      X.restore();
    }
    flagBar(X, ctx, 240, 1380, 600, 12, at(lt, 5.6, 6.6));
  },
});
