// ---------- 這題錯在哪 No.003 v8(新美術規範母版):113 會考數學 抽球題(小宇 × 誠誠老師)----------
const XY = { yc: true, hat: 'tuft', belt: false };
const TC = { yc: true, shirt: true, hat: 'teacher', belt: false, glasses: true };
const C = (base, extra) => Object.assign({}, base, extra);
const walkLegs = (t, sp = 9, amp = .5) => ({ L: [Math.sin(t * sp) * amp + .05, -Math.max(0, Math.sin(t * sp + 1)) * .7], R: [-Math.sin(t * sp) * amp + .05, -Math.max(0, -Math.sin(t * sp + 1)) * .7] });
const walkArms = (t, sp = 9, amp = .5) => ({ L: [.3 - Math.sin(t * sp) * amp, -.3], R: [.3 + Math.sin(t * sp) * amp, -.3] });
const Ls = i => LINES[i].s, Le = i => LINES[i].e;
const PUNC = /[，。！？、：；「」…\s]/;
function tAt(i, sub) {
  const s = LINES[i].text, k = s.indexOf(sub); if (k < 0) return Ls(i);
  const cnt = str => [...str].filter(c => !PUNC.test(c)).length;
  return Ls(i) + (Le(i) - Ls(i)) * cnt(s.slice(0, k)) / Math.max(cnt(s), 1);
}
const aimAt = (cx, cy, s, flip, X, Y) => ({ ik: [(X - cx) / s * flip, (Y - cy) / s], bend: -1 });
const lin = x => x;

// 角色共用的「活著」動作:呼吸、眨眼、依音量開合嘴巴、講話時微微點頭(o.still 可關掉)
const _drawStick = drawStick;
drawStick = function (ctx, o) {
  const t = window.CUR_T || 0, who = o.hat === 'teacher' ? '老師' : '小宇', ph = who === '老師' ? 1.3 : 0;
  if (!o.still) {
    o = Object.assign({}, o); const f = o.face = Object.assign({}, o.face || {});
    o.bob = (o.bob || 0) + Math.sin(t * 2.3 + ph) * .004;
    if ((t + ph) % 3.7 < .12) f.blink = 1;
    const ln = LINES.find(l => t >= l.s - .05 && t < l.e && l.who === who);
    if (ln && typeof ENV !== 'undefined') {
      const amp = Math.max(ENV[Math.round(t * 30)] || 0, (ENV[Math.round(t * 30) + 1] || 0) * .7);
      if (amp > .1) { f.mouth = 'talk'; f.open = Math.min(1, amp * 1.15); }
      o.headTilt = (o.headTilt || 0) + Math.sin(t * 8) * .025 * amp;
    }
  }
  _drawStick(ctx, o);
};
// 關鍵字彈出(畫面上,非白板):粗黑體 + 白邊
function popText(ctx, str, x, y, size, col, t0, t, hold = 99) {
  const k = kf(t, [[t0, 0], [t0 + .28, 1, backOut], [t0 + hold, 1], [t0 + hold + .2, 0]]); if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(-.04);
  text(ctx, str, 0, 0, size, col, '#fff', size * .16, SANS, 900); text(ctx, str, 0, 0, size, col, '#fff', 0, SANS, 900); ctx.restore();
}
// 白板上的重點數字:黃色螢光筆底 + 粗黑體,統一的彈出動畫
function popB(ctx, str, x, y, size, col, t0, t, mark = true) {
  const k = kf(t, [[t0, 0], [t0 + .3, 1, backOut]]); if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  if (mark) marker(ctx, 0, 0, boardW(ctx, str, size) + size * .35, size * 1.08, 1, -.02);
  text(ctx, str, 0, size * .03, size, col, NAVY, 0, SANS, 900); ctx.restore();
}
function qMark(ctx, x, y, s, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; text(ctx, '?', x, y, s, BLUE, '#fff', s * .14, SANS, 900); text(ctx, '?', x, y, s, BLUE, '#fff', 0, SANS, 900); ctx.restore(); }
function nameTag(ctx, name, x, y, col, t0, t, hold = 2.2) {
  const k = kf(t, [[t0, 0], [t0 + .25, 1, backOut], [t0 + hold, 1], [t0 + hold + .25, 0]]); if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.font = `900 44px ${SANS}`; const w = ctx.measureText(name).width + 52;
  rrect(ctx, -w / 2, -34, w, 68, 34); ctx.fillStyle = col; ctx.fill(); ctx.beginPath(); ctx.moveTo(-13, 32); ctx.lineTo(0, 50); ctx.lineTo(13, 32); ctx.closePath(); ctx.fill();
  text(ctx, name, 0, 2, 44, '#fff', NAVY, 0, SANS, 900); ctx.restore();
}

// 白板固定元素:系列名(手寫,品牌識別)+ 集數
const QX = BOARD.x + 50;
function header(ctx) {
  boardText(ctx, '這題錯在哪？', QX, 300, 60, CORAL, 1, 'left', 'hand');
  boardText(ctx, 'No.003', BOARD.x + BOARD.w - 50 - boardW(ctx, 'No.003', 46, 'hand'), 300, 46, '#8a93a0', 1, 'left', 'hand');
}
const QL = ['箱內有 50 顆白球、10 顆紅球，', '抽球 31 次，每次抽一球。', '白球放回，紅球不放回。', '前 30 次抽出紅球 4 次，', '第 31 次抽出紅球的機率？'];
const QY = 410, QH = 84, QS = 50, WRONG = '10 ÷ 60 = 1/6', WY = QY + 5 * QH + 26;
function boardQ(ctx, t, opt = {}) {
  header(ctx);
  // 開場鉤子:小宇開始算之前擦掉,換成題目
  const tQ = tAt(0, '十除以') - .45, wipe = clamp((t - tQ) / .3);
  if (wipe < 1) {
    ctx.save(); ctx.beginPath(); ctx.rect(BOARD.x + BOARD.w * wipe, 330, BOARD.w, BOARD.h); ctx.clip();
    boardText(ctx, '抽走 4 顆紅球', 540, 505, 96, NAVY, 1, 'center');
    marker(ctx, 700, 690, 330, 210, kf(t, [[.05, 0], [.4, 1]], lin));
    boardText(ctx, '機率還是', 330, 722, 88, NAVY, 1, 'center');
    boardText(ctx, '1/6', 700, 760, 190, BLUE, 1, 'center');
    boardText(ctx, '？', 930, 735, 130, CORAL, kf(t, [[.3, 0], [.5, 1]], lin), 'center');
    ctx.restore();
  }
  // 第三行重點:黃色螢光筆刷過「紅球不放回」
  const pre = boardW(ctx, '白球放回，', QS, 700), kw = boardW(ctx, '紅球不放回', QS, 700);
  const km = kf(t, [[tAt(1, '第三行'), 0], [tAt(1, '第三行') + .5, 1]], lin);
  if (t > tQ + .2) marker(ctx, QX + pre + kw / 2, QY + 2 * QH - 18, kw + 24, 64, km, 0);
  QL.forEach((s, i) => boardText(ctx, s, QX, QY + i * QH, QS, NAVY, kf(t, [[tQ + .2 + i * .1, 0], [tQ + .45 + i * .1, 1]], lin), 'left', 700));
  boardText(ctx, WRONG, QX, WY, 72, BLUE, kf(t, [[tAt(0, '十除以'), 0], [tAt(0, '六分之一') + .5, 1]], lin));
  if (opt.circle) redCircle(ctx, QX + pre + boardW(ctx, '紅球', QS, 700) + boardW(ctx, '不放回', QS, 700) / 2, QY + 2 * QH - 18, boardW(ctx, '不放回', QS, 700) / 2 + 22, 44, kf(t, [[opt.circle, 0], [opt.circle + .4, 1]], lin));
}
const SHOTS = [];
const cut = (i, d = .08) => Ls(i) - d;
const still = { x: 540, y: 960, z: 1, r: 0 };

// A — 鉤子 → 小宇自信解題:「送分題啦!」寫下 1/6、「收工!」
SHOTS.push({ start: 0, end: cut(1), tr: 'cut', draw(ctx, lt, t) {
  const cam = { x: 540, y: 960, z: 1 + lt * .008, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, .8); boardQ(ctx, t); applyCam(ctx, cam, 1);
  const tw0 = tAt(0, '十除以'), tw1 = tAt(0, '六分之一') + .5, tDone = tAt(0, '收工');
  const writing = t > tw0 && t < tw1, done = t > tDone; const wr = Math.sin(lt * 18) * .12;
  const arms = done ? { L: [.9, -2.2], R: [2.6 + Math.sin(lt * 10) * .15, .2] }
    : writing ? { L: [.3, -.1], R: aimAt(300, FLOOR_Y, 700, 1, 300 + (t - tw0) / (tw1 - tw0) * 300 + wr * 60, 960) }
    : { L: [.9, -2.2], R: [.9, -2.2] };
  const ant = kf(t, [[tDone - .12, 0], [tDone, 1], [tDone + .18, 0]]);   // 「收工」前先蹲一下再彈起
  drawStick(ctx, C(XY, { x: 300, y: FLOOR_Y, s: 700, squash: 1 - ant * .06, bob: done ? -Math.abs(Math.sin((t - tDone) * 9)) * .02 : 0, lean: done ? -.05 : 0, arms,
    face: { eyes: done ? 'happy' : 'normal', mouth: done ? 'grin' : (writing ? 'smirk' : 'grin'), look: writing ? [.7, -.6] : [.3, -.1], browAng: .25 } }));
  nameTag(ctx, '小宇', 300, 880, BLUE, .15, t, 2.0);
  popText(ctx, '送分題！', 760, 1150, 112, CORAL, tAt(0, '送分題'), t, tAt(0, '十除以') - tAt(0, '送分題') - .1);
  popText(ctx, '1/6', 780, 1150, 170, BLUE, tAt(0, '六分之一'), t, tDone - tAt(0, '六分之一'));
  if (done) { const a = kf(t, [[tDone, 0], [tDone + .15, 1], [Le(0) + .2, 1]]); sparkle(ctx, 560, 1040, 64 * a, a); sparkle(ctx, 90, 1090, 46 * a, a); }
} });
// B — 誠誠老師冷冷出現,抬手比第三行;小宇僵住
SHOTS.push({ start: cut(1), end: cut(2), tr: 'cut', draw(ctx, lt, t) {
  classBG(ctx, still, t); applyCam(ctx, still, .8); boardQ(ctx, t); applyCam(ctx, still, 1);
  const k = inv(0, .5, lt); const tx = lerp(1350, 810, backOut(k)); const aim = k >= 1;
  drawStick(ctx, C(XY, { x: 280, y: FLOOR_Y, s: 680, arms: { L: [2.6, .2], R: [2.6, .2] },
    face: { eyes: lt > .6 ? 'wide' : 'happy', mouth: lt > .6 ? 'flat' : 'grin', look: [.8, 0] } }));
  if (lt > .8) sweat(ctx, 410, 1010, 26, clamp((lt - .8) * 4));
  drawStick(ctx, C(TC, { x: tx, y: FLOOR_Y, s: 760, flip: -1, legs: k < 1 ? walkLegs(lt, 14) : POSE.idle.legs,
    arms: aim ? { L: [.3, -.1], R: aimAt(tx, FLOOR_Y, 760, -1, 690, 960) } : walkArms(lt, 14),
    face: { eyes: 'half', mouth: 'flat', look: [-.6, -.2] } }));
  nameTag(ctx, '誠誠老師', 850, 800, CORAL, Ls(1) + .45, t, 2.0);
} });
// C — 白板特寫第三行;小宇唸完攤手「然後呢?」
SHOTS.push({ start: cut(2), end: cut(3), tr: 'whip', draw(ctx, lt, t) {
  const cam = { x: 500, y: 790, z: 1.2 + lt * .012, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, .8); boardQ(ctx, t); applyCam(ctx, cam, 1);
  const shrug = t > tAt(2, '然後呢');
  drawStick(ctx, C(XY, { x: 270, y: FLOOR_Y + 60, s: 680, arms: shrug ? { L: [1.6, -.9], R: [1.6, -.9] } : { L: [.3, -.1], R: [.9, -2.2] },
    headTilt: shrug ? .18 : 0, face: { eyes: 'normal', mouth: shrug ? 'o' : 'flat', look: shrug ? [0, 0] : [.6, -.6], browUp: shrug ? 1 : 0 } }));
  if (shrug) { const a = clamp((t - tAt(2, '然後呢')) * 4); qMark(ctx, 420, 1010 - a * 20, 96, a); qMark(ctx, 120, 1050 - a * 30, 68, a); }
} });
// D — 抽球動畫:白球抽出又彈回、紅球被抽走 4 顆
SHOTS.push({ start: cut(3), end: cut(4), tr: 'whip', draw(ctx, lt, t) {
  classBG(ctx, still, t); applyCam(ctx, still, .8); header(ctx);
  const bx = 110, by = 345, bw = 560, bh = 420;
  rrect(ctx, bx, by, bw, bh, 22); fillStroke(ctx, '#fbf6ea', 8, NAVY);
  rrect(ctx, 720, 400, 250, 365, 22); fillStroke(ctx, '#ffffff', 8, NAVY);
  boardText(ctx, '拿走', 845, 385, 46, CORAL, 1, 'center');
  const seq = 'WRWWRWRWR', dt = (Le(3) - Ls(3) - .2) / seq.length, t0 = .25; let rOut = 0;
  for (let i = 0; i < 18; i++) { const c = i % 6, r = Math.floor(i / 6); ball(ctx, bx + 75 + c * 82, by + 62 + r * 70, 29, false); }
  seq.split('').forEach((ch, j) => {
    const p = (lt - t0 - j * dt) / dt; if (ch === 'R' && p >= 1) rOut++;
    if (p <= 0 || p >= 1 || ch !== 'W') return;
    const sx = bx + bw - 60, y = by + 20 - Math.sin(p * Math.PI) * 70; ball(ctx, sx, y, 30, false);
    if (p > .55) text(ctx, '放回', sx, y - 62, 38, '#2e9b62', '#fff', 8, SANS, 900), text(ctx, '放回', sx, y - 62, 38, '#2e9b62', '#fff', 0, SANS, 900);
  });
  for (let i = 0; i < 10; i++) {
    const c = i % 5, r = Math.floor(i / 5); let x = bx + 85 + c * 95, y = by + 280 + r * 78;
    if (i < 4) {
      let j = -1, n = 0; for (let q = 0; q < seq.length; q++) if (seq[q] === 'R') { if (n === i) { j = q; break; } n++; }
      const p = clamp((lt - t0 - j * dt) / dt);
      if (p > 0) { const tx = 790 + (i % 2) * 110, ty = 500 + Math.floor(i / 2) * 130; x = lerp(x, tx, easeOut(p)); y = lerp(y, ty, p) - Math.sin(p * Math.PI) * 200; }
    }
    ball(ctx, x, y, 33, true);
  }
  boardText(ctx, '白 ×50', bx + 10, 860, 56, NAVY);
  // 紅球數每少一顆就彈一下
  const lastR = [1, 4, 6, 8].filter(j => lt - t0 - (j + 1) * dt >= 0).pop(); const pulse = lastR == null ? 0 : clamp(1 - (lt - t0 - (lastR + 1) * dt) / .25);
  ctx.save(); ctx.translate(bx + 400, 842); ctx.scale(1 + pulse * .25, 1 + pulse * .25);
  if (rOut) marker(ctx, 0, 0, 250, 78, 1, -.02); text(ctx, `紅 ×${10 - rOut}`, 0, 2, 64, CORAL, NAVY, 0, SANS, 900); ctx.restore();
  const n30 = Math.max(1, Math.min(30, Math.floor(clamp((lt - t0) / (seq.length * dt)) * 30)));
  boardText(ctx, `第 ${n30} 次`, 845, 858, 46, '#6b7480', 1, 'center', 700);
  applyCam(ctx, still, 1);
  drawStick(ctx, C(TC, { x: 880, y: FLOOR_Y, s: 660, flip: -1, arms: { L: [.3, -.1], R: aimAt(880, FLOOR_Y, 660, -1, 780, 1010) }, face: { eyes: 'half', mouth: 'flat', look: [-.5, -.4] } }));
  drawStick(ctx, C(XY, { x: 230, y: FLOOR_Y, s: 620, arms: { L: [.3, -.1], R: [.9, -2.2] }, face: { eyes: 'wide', mouth: 'flat', look: [.5, -.7], browUp: .5 } }));
} });
// E — 「蛤?誠誠老師,那它們去哪了?」小宇大特寫東張西望
SHOTS.push({ start: cut(4), end: cut(5), tr: 'cut', draw(ctx, lt, t) {
  const sk = lt < .35 ? shake(lt * 4, 14, 1, 3) : [0, 0];
  const cam = { x: 360 + sk[0], y: 1180 + sk[1], z: 2.0 - lt * .02, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, 1);
  drawStick(ctx, C(XY, { x: 360, y: FLOOR_Y, s: 600, arms: { L: [2.2, -.6], R: [2.2, -.6] }, headTilt: Math.sin(lt * 5) * .12,
    face: { eyes: 'wide', mouth: 'o', look: [Math.sin(lt * 5) * .9, -.2], browUp: 1 } }));
  if (lt < .6) { const a = kf(lt, [[0, 0], [.15, 1, backOut], [.45, 1], [.6, 0]]); ctx.save(); ctx.translate(565, 955); ctx.scale(a, a); burst(ctx, 0, 0, 86, 11, YEL); text(ctx, '蛤', 0, 4, 78, CORAL, NAVY, 0, SANS, 900); ctx.restore(); }
} });
// F — 誠誠老師冷面:「跟你的零用錢一樣」→ 錢幣飛走、小宇石化
SHOTS.push({ start: cut(5), end: cut(6), tr: 'cut', draw(ctx, lt, t) {
  const tz = tAt(5, '零用錢'); const stone = t > tz + .35; const sk = stone && t < tz + .7 ? shake(t * 5, 10, 1, 4) : [0, 0];
  const cam = { x: 560 + sk[0], y: 1090 + sk[1], z: 1.2, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, 1);
  drawStick(ctx, C(TC, { x: 800, y: FLOOR_Y, s: 720, flip: -1, arms: { L: [.3, -.1], R: [.9, -2.2] }, face: { eyes: 'half', mouth: t > tz ? 'smirk' : 'flat', look: [-.6, 0] } }));
  ctx.save(); if (stone) ctx.filter = 'grayscale(1) contrast(.8) brightness(.96)';
  drawStick(ctx, C(XY, { x: 330, y: FLOOR_Y, s: 660, still: stone, arms: stone ? { L: [.5, -.6], R: [.5, -.6] } : { L: [.3, -.1], R: [.3, -.1] },
    face: { eyes: stone || t > tz ? 'wide' : 'normal', mouth: stone ? 'o' : 'flat', look: [.6, 0], browUp: t > tz ? 1 : 0 } }));
  ctx.restore();
  if (stone) {
    const a = clamp((t - tz - .35) * 6);
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#555'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(300, 1000); ctx.lineTo(330, 1050); ctx.lineTo(305, 1090); ctx.lineTo(340, 1130); ctx.moveTo(318, 1240); ctx.lineTo(338, 1290); ctx.lineTo(322, 1330); ctx.stroke(); ctx.restore();
    for (let i = 0; i < 5; i++) { const p = ((t - tz - .4) * 1.2 + i * .23) % 1; if (t - tz - .4 > i * .15) { circle(ctx, 240 + i * 42, 1250 + p * 300, 9 + (i % 3) * 3); fillStroke(ctx, '#a3a3a3', 4, '#555'); } }
    popText(ctx, '石化', 330, 870, 100, '#6b6b6b', tz + .4, t);
  }
  if (t > tz) { const p = clamp((t - tz) / 1.3); for (let i = 0; i < 3; i++) { const k = clamp(p * 1.15 - i * .1), x = lerp(430, 1150, easeIn(k)) + i * 20, y = lerp(1230, 700, k) - i * 46; circle(ctx, x, y, 30); fillStroke(ctx, YEL, 6, NAVY); text(ctx, '$', x, y + 2, 36, NAVY, NAVY, 0, SANS, 900); } }
} });
// G — 小宇恢復、扳手指:紅剩 6、全部剩 56
SHOTS.push({ start: cut(6), end: cut(7), tr: 'whip', draw(ctx, lt, t) {
  classBG(ctx, still, t); applyCam(ctx, still, .8); header(ctx);
  const s1 = '紅球  10 − 4 =', s2 = '全部  60 − 4 =', w1 = boardW(ctx, s1, 80), w2 = boardW(ctx, s2, 80);
  boardText(ctx, s1, QX, 490, 80, NAVY, kf(t, [[tAt(6, '紅球剩') - .2, 0], [tAt(6, '紅球剩') + .6, 1]], lin));
  popB(ctx, '6', QX + w1 + 90, 462, 130, CORAL, tAt(6, '六顆'), t);
  boardText(ctx, s2, QX, 720, 80, NAVY, kf(t, [[tAt(6, '全部') - .2, 0], [tAt(6, '全部') + .6, 1]], lin));
  popB(ctx, '56', QX + w2 + 130, 692, 130, CORAL, tAt(6, '五十六'), t);
  applyCam(ctx, still, 1);
  const cnt = Math.sin(lt * 7) * .2;
  drawStick(ctx, C(XY, { x: 280, y: FLOOR_Y, s: 680, arms: { L: [1.2 + cnt, -1.4], R: [1.2 - cnt, -1.4] }, face: { eyes: 'normal', mouth: 'flat', look: [.3, .4], browAng: -.15 } }));
  drawStick(ctx, C(TC, { x: 830, y: FLOOR_Y, s: 740, flip: -1, arms: { L: [.3, -.1], R: [.9, -2.2] }, face: { eyes: 'normal', mouth: 'smile', look: [-.6, 0] } }));
} });
// H — 誠誠老師:6 ÷ 56 = 3/28,舊答案 1/6 打叉
SHOTS.push({ start: cut(7), end: cut(8), tr: 'cut', draw(ctx, lt, t) {
  const cam = { x: 540, y: 960, z: 1 + lt * .008, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, .8); header(ctx);
  const t3 = tAt(7, '二十八分之三');
  boardText(ctx, '6 ÷ 56 =', 540, 470, 110, NAVY, kf(t, [[Ls(7), 0], [tAt(7, '等於') + .1, 1]], lin), 'center');
  popB(ctx, '3/28', 540, 660, 220, CORAL, t3, t);
  boardText(ctx, '1/6', QX + 10, 860, 64, BLUE); redCross(ctx, QX + 62, 838, 38, kf(t, [[t3 + .9, 0], [t3 + 1.2, 1]], lin));
  applyCam(ctx, cam, 1);
  const up = t > t3;
  drawStick(ctx, C(TC, { x: 840, y: FLOOR_Y, s: 760, flip: -1, arms: { L: [.3, -.1], R: up ? aimAt(840, FLOOR_Y, 760, -1, 760, 950) : [.9, -2.2] }, face: { eyes: 'normal', mouth: 'smile', look: [-.6, -.3] } }));
  drawStick(ctx, C(XY, { x: 250, y: FLOOR_Y, s: 660, bob: up ? -Math.abs(Math.sin((t - t3) * 12)) * .03 * clamp(1 - (t - t3) * 1.5) : 0, arms: up ? { L: [.5, -.6], R: [.5, -.6] } : { L: [.3, -.1], R: [.3, -.1] },
    face: { eyes: up ? 'wide' : 'normal', mouth: up ? 'o' : 'flat', look: [.7, -.6], browUp: up ? 1 : 0 } }));
  if (up) { const a = kf(t, [[t3, 0], [t3 + .2, 1], [t3 + 1.2, 0]]); sparkle(ctx, 250, 520, 60 * a, a); sparkle(ctx, 850, 760, 50 * a, a); }
} });
// I — 「我的分數……跟零用錢一起被抽走了」小宇蹲角落、烏雲,1/6 紙條和錢幣飛走
SHOTS.push({ start: cut(8), end: cut(9), tr: 'whip', draw(ctx, lt, t) {
  const cam = { x: 330, y: 1270, z: 1.55, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, 1);
  ctx.save(); ctx.fillStyle = 'rgba(23,37,61,.12)'; ctx.fillRect(-1500, -1500, 4080, 4920); ctx.restore();
  drawStick(ctx, C(XY, { x: 250, y: FLOOR_Y, s: 560, bob: .14, lean: .15, legs: { L: [1.3, -2.4], R: [1.2, -2.3] }, arms: { L: [1.0, -1.3], R: [1.1, -1.2] },
    headTilt: .25, face: { eyes: 'half', mouth: 'frown', look: [.2, .6], browAng: -.3 } }));
  ctx.save(); ctx.globalAlpha = clamp(lt * 3); cloudShape(ctx, 262, 1062 + Math.sin(lt * 2) * 5, 56, 3); fillStroke(ctx, '#9aa3ae', 6, NAVY);
  for (let i = 0; i < 7; i++) { const p = (lt * 1.6 + i * .37) % 1; line(ctx, 208 + i * 17, 1100 + p * 70, 204 + i * 17, 1116 + p * 70, 5, BLUE); }
  ctx.restore();
  const tf = tAt(8, '跟零用錢'), q = clamp((t - tf) / 2.0);
  const nx = lerp(400, 800, easeIn(q)), ny = lerp(1440, 1040, q) - Math.sin(q * Math.PI) * 60;
  ctx.save(); ctx.translate(nx, ny); ctx.rotate(-.2 + q * 2.5); rrect(ctx, -58, -38, 116, 76, 10); fillStroke(ctx, '#ffffff', 6, NAVY); text(ctx, '1/6', 0, 2, 44, BLUE, NAVY, 0, SANS, 900); ctx.restore();
  if (q > 0) for (let i = 0; i < 3; i++) { const k = clamp(q * 1.1 - i * .08), x = lerp(420, 860, easeIn(k)) + i * 40, y = lerp(1300, 940, k) - i * 30; circle(ctx, x, y, 24); fillStroke(ctx, YEL, 5, NAVY); text(ctx, '$', x, y + 2, 30, NAVY, NAVY, 0, SANS, 900); }
} });
// J — 片尾(固定樣式):留言「考卷」+ 品牌標語;小宇舉 IG 卡,誠誠老師抬手
SHOTS.push({ start: cut(9), end: Le(9) + 2.4, tr: 'cut', draw(ctx, lt, t) {
  classBG(ctx, still, t); applyCam(ctx, still, .8); header(ctx);
  boardText(ctx, '你的考卷也有這種陷阱嗎？', 540, 430, 58, NAVY, kf(t, [[Ls(9), 0], [Ls(9) + .9, 1]], lin), 'center', 700);
  popB(ctx, '留言「考卷」', 540, 570, 128, CORAL, tAt(9, '留言'), t);
  boardText(ctx, '誠誠老師免費幫你抓陷阱', 540, 745, 54, NAVY, kf(t, [[tAt(9, '我們免費'), 0], [tAt(9, '我們免費') + 1.0, 1]], lin), 'center', 700);
  const ks = kf(t, [[Le(9) - .2, 0], [Le(9) + .8, 1]], lin);
  if (ks > 0) {
    const a = '宇誠文理', b = '孩子的專屬家教團隊', wa = boardW(ctx, a, 56, 'hand'), wb = boardW(ctx, b, 40, 700), x0 = 540 - (wa + wb + 30) / 2;
    boardText(ctx, a, x0, 852, 56, CORAL, clamp(ks * 2.5), 'left', 'hand');
    boardText(ctx, b, x0 + wa + 30, 846, 40, NAVY, clamp(ks * 1.6 - .5), 'left', 700);
  }
  applyCam(ctx, still, 1);
  const up = kf(t, [[Le(9) + .1, 0], [Le(9) + .5, 1, backOut]]); const bob = Math.sin(lt * 6) * 5, X = 300, S = 640;
  drawStick(ctx, C(XY, { x: X, y: FLOOR_Y, s: S, arms: up > .05 ? { L: { ik: [.2, -.42], bend: 1 }, R: { ik: [.2, -.42], bend: -1 } } : { L: [.3, -.1], R: [2.6 + Math.sin(lt * 8) * .35, .3] }, face: { eyes: 'happy', mouth: 'grin' } }));
  if (up > 0) {
    ctx.save(); ctx.translate(X, lerp(1560, FLOOR_Y - .42 * S - 52, up) + bob); ctx.rotate(-.04);
    rrect(ctx, -255, -64, 510, 128, 22); fillStroke(ctx, '#ffffff', 8, NAVY);
    text(ctx, 'IG', -200, 4, 54, CORAL, NAVY, 0, SANS, 900); text(ctx, '@yuchengtutoring', 48, 2, 38, NAVY, NAVY, 0, 'Poppins', 700);
    for (const hx of [-128, 128]) { circle(ctx, hx, 58, 19); fillStroke(ctx, '#ffffff', 7, NAVY); }
    ctx.restore();
  }
  drawStick(ctx, C(TC, { x: 830, y: FLOOR_Y, s: 740, flip: -1, arms: { L: [.3, -.1], R: [2.5 - Math.sin(lt * 7) * .3, .3] }, face: { eyes: 'normal', mouth: 'smile', look: [-.3, 0] } }));
} });
