/* قسم نظم المعلومات والشبكات (14 ث): من نقطة ضوء تمتد شبكة عقد، حزم تتنقل، عقدة تتعطّل فيُعاد توجيه المسار،
   ثم تضيء العقدة المركزية ببطاقة علياء، وفي الختام تتحوّل الخطوط إلى حدود خريطة الظاهرة */
import { backdrop, card, deptTag, icon, makeDust, tagline, MAP, TAU } from './_lib.js';

const NODES = [
  { id: 'C', p: [540, 700], ic: 'server', r: 58 },
  { id: 'n1', p: [300, 440], ic: 'router', r: 40 }, { id: 'n2', p: [780, 440], ic: 'db', r: 40 },
  { id: 'n3', p: [170, 660], ic: 'laptop', r: 36 }, { id: 'n4', p: [910, 660], ic: 'laptop', r: 36 },
  { id: 'n5', p: [330, 900], ic: 'server', r: 40 }, { id: 'n6', p: [750, 900], ic: 'router', r: 40 },
  { id: 'n7', p: [130, 880], ic: 'db', r: 30 }, { id: 'n8', p: [950, 880], ic: 'db', r: 30 },
  { id: 'n9', p: [540, 380], ic: 'globe', r: 40 },
  { id: 'n10', p: [410, 560], ic: 'laptop', r: 26 }, { id: 'n11', p: [670, 560], ic: 'laptop', r: 26 },
];
const EDGES = [
  ['C', 'n1', 0], ['C', 'n2', 0], ['C', 'n3', 1], ['C', 'n4', 1], ['C', 'n5', 1], ['C', 'n6', 1], ['C', 'n9', 0], ['C', 'n10', 2], ['C', 'n11', 2],
  ['n1', 'n9', 2], ['n2', 'n9', 2], ['n1', 'n3', 3], ['n2', 'n4', 3], ['n3', 'n7', 4], ['n4', 'n8', 4], ['n5', 'n7', 4], ['n6', 'n8', 4], ['n5', 'n6', 3],
  ['n2', 'n8', 5, 'alt'],   // مسار بديل يضيء عند تعطّل n4
];
const FAIL = 'n4', FAIL_T = [5.3, 7.1];

MOTION.scene({
  id: 'network',
  setup(ctx) {
    this.dust = makeDust(ctx, { count: 45, seed: 31, glow: 2 });
    this.byId = Object.fromEntries(NODES.map(n => [n.id, n]));
    const r = ctx.rng(4);
    this.packets = EDGES.map((e, i) => [0, 1].map(j => ({ e: i, ph: r(), sp: r.range(.45, .8) * (j ? -1 : 1) })));
  },
  draw(t, lt, ctx) {
    const { X, P, E, at, clamp, lerp } = ctx;
    backdrop(X, ctx, t, { glowY: 700, glowColor: 'rgba(94,234,212,.16)' });
    this.dust.draw(X, lt, .6);
    const failing = lt >= FAIL_T[0] && lt < FAIL_T[1], fk = at(lt, FAIL_T[0], FAIL_T[0] + .25);
    const fade = 1 - at(lt, 12.2, 13.6, 'quadIn');   // الشبكة تذوب في الحدود بالنهاية
    const N = this.byId, posOf = id => N[id].p;

    X.save(); X.globalAlpha = fade;
    /* ── الخطوط تنمو من المركز ── */
    const edgeK = (e) => at(lt, .15 + e[2] * .42, .15 + e[2] * .42 + .55, 'expoOut');
    EDGES.forEach((e, i) => {
      const k = edgeK(e); if (k <= 0) return;
      const a = posOf(e[0]), b = posOf(e[1]), alt = e[3] === 'alt', dead = failing && (e[0] === FAIL || e[1] === FAIL);
      let alpha = dead ? .18 : .75, w = 4, col = P.hi;
      if (alt) { if (!failing && lt < FAIL_T[1] + .6) { alpha = .18; X.setLineDash([14, 14]); } else { col = P.acc; w = 6; alpha = .95; } }
      X.strokeStyle = col; X.globalAlpha = fade * alpha; X.lineWidth = w; X.lineCap = 'round';
      X.beginPath(); X.moveTo(a[0], a[1]); X.lineTo(lerp(a[0], b[0], k), lerp(a[1], b[1], k)); X.stroke(); X.setLineDash([]);
    });
    /* ── الحزم ── */
    X.globalAlpha = fade;
    this.packets.flat().forEach(pk => {
      const e = EDGES[pk.e]; if (edgeK(e) < 1) return;
      const dead = failing && (e[0] === FAIL || e[1] === FAIL), alt = e[3] === 'alt';
      if (dead || (alt && !failing && lt < FAIL_T[1] + .6)) return;
      const a = posOf(e[0]), b = posOf(e[1]), u = ctx.fract(pk.ph + lt * pk.sp), x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u);
      const g = X.createRadialGradient(x, y, 0, x, y, 16); g.addColorStop(0, alt ? P.acc : '#fff'); g.addColorStop(.35, alt ? P.acc : P.hi); g.addColorStop(1, 'rgba(0,0,0,0)');
      X.fillStyle = g; X.beginPath(); X.arc(x, y, 16, 0, TAU); X.fill();
    });
    /* ── العقد ── */
    NODES.forEach((n, i) => {
      const first = EDGES.find(e => e[0] === n.id || e[1] === n.id), k = n.id === 'C' ? at(lt, 0, .5, 'backOut') : E.backOut(at(lt, .55 + first[2] * .42, .95 + first[2] * .42));
      if (k <= 0) return;
      const [x, y] = n.p, isC = n.id === 'C', isFail = n.id === FAIL;
      let col = isC ? P.acc : P.hi, ring = isC ? P.acc : 'rgba(94,234,212,.5)';
      if (isFail && failing) { const flick = Math.floor(lt * 14) % 3 ? 1 : .25; col = `rgba(219,22,27,${flick})`; ring = col; }
      X.save(); X.translate(x, y); X.scale(k, k);
      // هالة
      const pulse = isC ? ctx.beatPulse(t, 6) : 0;
      const g = X.createRadialGradient(0, 0, n.r * .4, 0, 0, n.r * 2.2); g.addColorStop(0, (isFail && failing ? 'rgba(219,22,27,.35)' : isC ? 'rgba(0,179,122,.45)' : 'rgba(94,234,212,.22)')); g.addColorStop(1, 'rgba(0,0,0,0)');
      X.fillStyle = g; X.beginPath(); X.arc(0, 0, n.r * 2.2 * (1 + pulse * .25), 0, TAU); X.fill();
      // الجسم
      X.fillStyle = '#07131F'; X.strokeStyle = ring; X.lineWidth = isC ? 4 : 2.5;
      X.beginPath(); X.arc(0, 0, n.r, 0, TAU); X.fill(); X.stroke();
      icon(X, n.ic, 0, 0, n.r * 1.05, col, 5);
      // عودة العقدة: حلقة تتسع
      if (isFail) { const kr = at(lt, FAIL_T[1], FAIL_T[1] + .9); if (kr > 0 && kr < 1) { X.strokeStyle = P.acc; X.globalAlpha = 1 - kr; X.lineWidth = 6 * (1 - kr); X.beginPath(); X.arc(0, 0, n.r + 90 * E.expoOut(kr), 0, TAU); X.stroke(); } }
      // العقدة المركزية تتسع بحلقات عند لحظة البطاقة
      if (isC) for (let q = 0; q < 3; q++) { const kr = at(lt, 7.6 + q * .25, 8.8 + q * .25); if (kr > 0 && kr < 1) { X.strokeStyle = P.acc; X.globalAlpha = (1 - kr) * .8; X.lineWidth = 5; X.beginPath(); X.arc(0, 0, n.r + 260 * E.expoOut(kr), 0, TAU); X.stroke(); } }
      X.restore();
    });
    // تنبيه الخلل
    if (failing) {
      const [x, y] = posOf(FAIL); X.globalAlpha = fade * fk;
      ctx.text(X, 'انقطاع', x - 10, y - 70, { family: 'body', weight: 700, size: 30, color: '#FF6B6B', align: 'center' });
      const kr = at(lt, FAIL_T[0] + .5, FAIL_T[0] + 1.1, 'expoOut'); if (kr > 0) ctx.text(X, 'إعادة توجيه المسار ✓', 540, 1000, { family: 'body', weight: 700, size: 40, color: P.acc, alpha: kr });
    }
    X.restore();

    /* ── البطاقة ── */
    deptTag(X, ctx, 'قسم نظم المعلومات والشبكات', 1010, at(lt, 7.7, 8.3) * fade, P.hi);
    card(X, ctx, { y: 1070, k: at(lt, 7.9, 9.0) * fade, name: 'علياء الدرعي', role: 'أخصائية حاسب آلي', icons: ['server', 'code'], accent: P.hi });
    if (fade > 0) { X.save(); X.globalAlpha = fade; tagline(X, ctx, 'هي الشبكة التي لا تنقطع', 1420, 10.4, lt, { size: 62, weight: 800, color: P.ink }); X.restore(); }

    /* ── الخطوط تصير حدود الظاهرة ── */
    const km = at(lt, 12.0, 14.0, 'linear');
    if (km > 0) ctx.drawPath(X, MAP, km, { width: 6, color: P.hi, smooth: false, glow: 22, glowColor: P.hi, tip: { r: 8, color: '#fff', glow: 24 } });
  },
});
