/* قسم الدعم الفني (16 ث): نافذة طرفية تُحلّ فيها التذاكر واحدة واحدة، ثم تنفتح على بطاقتي عائشة وهدى */
import { backdrop, card, deptTag, icon, makeDust, tagline, TAU } from './_lib.js';

const TICKETS = [
  ['#1047', 'الطابعة لا تعمل'], ['#1048', 'نسيت كلمة المرور'], ['#1049', 'الجهاز لا يُقلع'], ['#1050', 'البريد لا يفتح'],
  ['#1051', 'الشاشة سوداء'], ['#1052', 'الشبكة بطيئة'], ['#1053', 'تثبيت برنامج'], ['#1054', 'الماسح الضوئي'], ['#1055', 'تحديث النظام'],
];
// توقيت ظهور كل تذكرة (ثوانٍ من بداية المشهد) — يبدأ هادئاً ثم يتسارع
const T0 = [.7, 1.9, 3.0, 3.9, 4.6, 5.1, 5.5, 5.85, 6.15];

MOTION.scene({
  id: 'support',
  setup(ctx) {
    this.dust = makeDust(ctx, { count: 40, seed: 21, glow: 2 });
    this.sparks = ctx.particles2D({ count: 70, seed: 5, gravity: [0, 900], spawn: (i, r) => ({ x: 540, y: 980, vx: r.gauss() * 520, vy: -r.range(300, 900), r: r.range(4, 9), color: r.pick([ctx.P.acc, ctx.P.hi, ctx.P.ink]), delay: 10.3, life: 1.1, shape: r.pick(['circle', 'rect', 'tri']) }) });
  },
  draw(t, lt, ctx) {
    const { X, P, E, at, kf, clamp } = ctx;
    backdrop(X, ctx, t, { glowY: 900, glowColor: 'rgba(0,179,122,.14)' });
    this.dust.draw(X, lt, .6);

    const out = 1 - at(lt, 14.7, 15.5, 'quadIn');   // كل شيء يذوب قبل نقطة الضوء
    /* ── النافذة الطرفية ── */
    const kw = at(lt, 0, .7, 'expoOut');
    const win = kf(lt, [[10.2, [90, 420, 900, 1060]], [10.9, [170, 300, 740, 300], 'expoInOut']]);   // [x,y,w,h]: تصغر وتصعد لتفسح للبطاقات
    const [wx, wy, ww, wh] = win, closing = at(lt, 10.2, 10.9);
    X.save(); X.globalAlpha = kw * out; X.translate(wx + ww / 2, wy + wh / 2); X.scale(.9 + .1 * E.backOut(kw), .9 + .1 * E.backOut(kw)); X.translate(-(wx + ww / 2), -(wy + wh / 2));
    X.shadowColor = 'rgba(0,0,0,.5)'; X.shadowBlur = 50; X.shadowOffsetY = 20;
    X.fillStyle = '#06111D'; X.beginPath(); X.roundRect(wx, wy, ww, wh, 26); X.fill(); X.shadowColor = 'transparent';
    X.strokeStyle = 'rgba(0,179,122,.45)'; X.lineWidth = 2; X.stroke();
    // شريط العنوان
    X.fillStyle = 'rgba(255,255,255,.05)'; X.beginPath(); X.roundRect(wx, wy, ww, 64, [26, 26, 0, 0]); X.fill();
    [P.clay, '#F2B33D', P.acc].forEach((c, i) => { X.fillStyle = c; X.beginPath(); X.arc(wx + 34 + i * 30, wy + 32, 9, 0, TAU); X.fill(); });
    ctx.text(X, 'support@dhahirah-it : ~', wx + ww / 2, wy + 42, { family: 'num', weight: 600, size: 26, color: P.mut, dir: 'ltr' });
    // محتوى النافذة (مقصوص)
    X.save(); X.beginPath(); X.rect(wx, wy + 64, ww, wh - 64); X.clip();
    const lineH = 86, lineW = 34, rightX = wx + ww - 40, leftX = wx + 40, baseY = wy + 64 + 70;
    // تمرير لأعلى عندما تتراكم التذاكر
    const visible = TICKETS.filter((_, i) => lt >= T0[i]).length, extraRows = (lt > 7.4 ? 1 : 0) + (lt > 8.6 ? 1 : 0);
    const rows = visible + extraRows, maxRows = 10, scroll = Math.max(0, rows - maxRows) * lineH * E.expoOut(clamp((lt - T0[Math.min(8, Math.max(0, maxRows - 1 - extraRows))]) * 3));
    const vy = (row) => baseY + row * lineH - scroll;
    // التذاكر
    TICKETS.forEach(([no, msg], i) => {
      const s = T0[i]; if (lt < s) return;
      const y = vy(i), ktype = at(lt, s, s + .55), kres = at(lt, s + .6, s + .85, 'backOut');
      const alphaRow = closing > 0 ? 1 - closing : 1;
      X.globalAlpha = alphaRow;
      ctx.text(X, ctx.text.typeSub('> ticket ' + no, ktype), leftX, y, { family: 'num', weight: 500, size: lineW, color: P.hi, dir: 'ltr', align: 'left' });
      ctx.text(X, ctx.text.typeSub('«' + msg + '»', ktype), rightX, y, { family: 'body', weight: 700, size: lineW + 2, color: P.ink, align: 'right' });
      if (kres > 0) {
        X.save(); X.translate(leftX + 110, y + 34); X.scale(kres, kres);
        X.fillStyle = 'rgba(0,179,122,.18)'; X.beginPath(); X.roundRect(0, -20, 232, 40, 20); X.fill();
        ctx.text(X, 'RESOLVED', 44, 11, { family: 'num', weight: 700, size: 24, color: P.acc, dir: 'ltr', align: 'left' });
        icon(X, 'check', 24, 0, 24, P.acc, 5); X.restore();
      }
    });
    // السؤال وسطر التحميل
    if (lt > 7.4) {
      const y = vy(visible);
      X.globalAlpha = closing > 0 ? 1 - closing : 1;
      ctx.text(X, ctx.text.typeSub('> who resolved all of this ?', at(lt, 7.4, 8.3)), leftX, y, { family: 'num', weight: 500, size: lineW, color: '#F2B33D', dir: 'ltr', align: 'left' });
    }
    if (lt > 8.6) {
      const y = vy(visible + 1), kl = at(lt, 8.6, 9.3), kb = at(lt, 9.2, 10.2, 'expoInOut');
      X.globalAlpha = closing > 0 ? 1 - closing : 1;
      ctx.text(X, ctx.text.typeSub('> loading team.technical_support', kl), leftX, y, { family: 'num', weight: 500, size: lineW, color: P.hi, dir: 'ltr', align: 'left' });
      if (kl >= 1) { X.fillStyle = 'rgba(255,255,255,.1)'; X.beginPath(); X.roundRect(leftX, y + 24, ww - 80, 14, 7); X.fill(); X.fillStyle = P.acc; X.beginPath(); X.roundRect(leftX, y + 24, (ww - 80) * kb, 14, 7); X.fill(); }
    }
    // المؤشر الوامض
    if (closing <= 0) { const row = visible + extraRows; X.globalAlpha = Math.floor(t * 2.4) % 2 ? 1 : .15; X.fillStyle = P.hi; X.fillRect(leftX + (lt > 8.6 ? 0 : 0), vy(row) - 28, 16, 38); }
    X.restore(); // clip
    X.restore(); // window

    /* ── الانفجار إلى البطاقات ── */
    ctx.MK.burst(t, { s: ctx.scene.start + 10.3, cx: 540, cy: 980, spread: 420, n: 32 });
    this.sparks.draw(X, lt);
    X.save(); X.globalAlpha = out;
    deptTag(X, ctx, 'قسم الدعم الفني', 700, at(lt, 10.7, 11.3), P.acc);
    card(X, ctx, { y: 790, k: at(lt, 10.9, 12.0), name: 'عائشة العبري', role: 'رئيسة قسم الدعم الفني', icons: ['headset', 'shield'] });
    card(X, ctx, { y: 1040, k: at(lt, 11.3, 12.4), name: 'هدى الوائلي', role: 'فنية حاسب آلي', icons: ['laptop', 'wrench'] });
    tagline(X, ctx, 'أول من يُجيب… وآخر من يترك المشكلة', 1400, 12.9, lt, { size: 56, weight: 700, color: P.hi });
    X.restore();

    /* ── نقطة الضوء الأخيرة: علامة ✓ تكبر وتتحول لنقطة يبدأ منها المشهد التالي ── */
    const kd = at(lt, 14.9, 16.0, 'expoIn');
    if (kd > 0) {
      X.save(); X.globalAlpha = clamp(kd * 3);
      X.shadowColor = P.acc; X.shadowBlur = 60 * kd; X.fillStyle = P.acc; X.beginPath(); X.arc(540, 700, 8 + 40 * kd, 0, TAU); X.fill();
      X.restore();
    }
  },
});
