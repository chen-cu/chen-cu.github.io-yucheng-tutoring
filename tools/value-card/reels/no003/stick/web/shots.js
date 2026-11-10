// ---------- 這題錯在哪 No.003 v2(搞笑對話版):113 會考數學 抽球題(小宇 × 宇誠老師)----------
const XY = { yc: true, hat: 'tuft', belt: false };
const TC = { yc: true, shirt: true, hat: 'teacher', belt: false, glasses: true };
const C = (base, extra) => Object.assign({}, base, extra);
const walkLegs = (t, sp = 9, amp = .5) => ({ L: [Math.sin(t * sp) * amp + .05, -Math.max(0, Math.sin(t * sp + 1)) * .7], R: [-Math.sin(t * sp) * amp + .05, -Math.max(0, -Math.sin(t * sp + 1)) * .7] });
const walkArms = (t, sp = 9, amp = .5) => ({ L: [.3 - Math.sin(t * sp) * amp, -.3], R: [.3 + Math.sin(t * sp) * amp, -.3] });
const handheld = (t, a = 4) => shake(t * .35, a, 1, 2);
const Ls = i => LINES[i].s, Le = i => LINES[i].e;
const PUNC = /[，。！？、：；「」…\s]/;
// 台詞中某個詞開始唸的時間(依字數比例估)
function tAt(i, sub) {
  const s = LINES[i].text, k = s.indexOf(sub); if (k < 0) return Ls(i);
  const cnt = str => [...str].filter(c => !PUNC.test(c)).length;
  return Ls(i) + (Le(i) - Ls(i)) * cnt(s.slice(0, k)) / Math.max(cnt(s), 1);
}
const aimAt = (cx, cy, s, flip, X, Y) => ({ ik: [(X - cx) / s * flip, (Y - cy) / s], bend: -1 });
const lin = x => x;
// 大字彈出(關鍵數字用)
function popText(ctx, str, x, y, size, col, t0, t, hold = 99) {
  const k = kf(t, [[t0, 0], [t0 + .28, 1, backOut], [t0 + hold, 1], [t0 + hold + .2, 0]]); if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(-.04);
  text(ctx, str, 0, 0, size, col, '#fff', size * .16, '"Noto Sans CJK TC"', 900);
  text(ctx, str, 0, 0, size, col, '#fff', 0, '"Noto Sans CJK TC"', 900); ctx.restore();
}
function qMark(ctx, x, y, s, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; text(ctx, '?', x, y, s, '#2f63c9', '#fff', s * .14, '"Noto Sans CJK TC"', 900); text(ctx, '?', x, y, s, '#2f63c9', '#fff', 0, '"Noto Sans CJK TC"', 900); ctx.restore(); }

// 題目(白板)
const QL = ['箱內有 50 顆白球、10 顆紅球，', '抽球 31 次，每次抽一球。', '白球放回，紅球不放回。', '前 30 次抽出紅球 4 次，', '第 31 次抽出紅球的機率？'];
const QX = BOARD.x + 40, QY = BOARD.y + 100, QH = 88, QS = 54;
const WRONG = '10 ÷ 60 = 1/6';
function boardQ(ctx, t, opt = {}) {
  boardText(ctx, '這題錯在哪？', QX, QY - 10, 64, '#d8312b', 1);
  QL.forEach((s, i) => boardText(ctx, s, QX, QY + 76 + i * QH, QS, i === 2 && opt.hl ? '#d8312b' : '#1f2a44', kf(t, [[i * .1, 0], [.15 + i * .1, 1]], lin)));
  const wy = QY + 76 + 5 * QH + 40;
  boardText(ctx, WRONG, QX, wy, 66, '#2f63c9', kf(t, [[tAt(0, '十除以'), 0], [tAt(0, '六分之一') + .5, 1]], lin));
  if (opt.cross) redCross(ctx, QX + boardW(ctx, WRONG, 66) + 60, wy - 22, 36, kf(t, [[opt.cross, 0], [opt.cross + .35, 1]], lin));
  redUnderline(ctx, QX, QX + boardW(ctx, QL[2], QS) - 10, QY + 76 + 2 * QH + 16, kf(t, [[tAt(1, '第三行'), 0], [tAt(1, '第三行') + .6, 1]], lin));
}
// 角色名牌(首次出場、結尾):小宇 藍、誠誠老師 紅
function nameTag(ctx, name, x, y, col, t0, t, hold = 2.2) {
  const k = kf(t, [[t0, 0], [t0 + .25, 1, backOut], [t0 + hold, 1], [t0 + hold + .25, 0]]); if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.font = '900 46px "Noto Sans CJK TC"'; const w = ctx.measureText(name).width + 56;
  rrect(ctx, -w / 2, -36, w, 72, 36); fillStroke(ctx, col, 5); ctx.beginPath(); ctx.moveTo(-14, 34); ctx.lineTo(0, 54); ctx.lineTo(14, 34); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  text(ctx, name, 0, 2, 46, '#fff', INK, 0, '"Noto Sans CJK TC"', 900); ctx.restore();
}
const SHOTS = [];
const cut = (i, d = .08) => Ls(i) - d;

// A — 小宇自信解題:「送分題啦!」寫下 1/6、「收工!」
SHOTS.push({ start: 0, end: cut(1), tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 3); const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.02 + lt * .012, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, .8); boardQ(ctx, t); applyCam(ctx, cam, 1);
  const tw0 = tAt(0, '十除以'), tw1 = tAt(0, '六分之一') + .5, tDone = tAt(0, '收工');
  const writing = t > tw0 && t < tw1, done = t > tDone;
  const wr = Math.sin(lt * 18) * .12;
  const arms = done ? { L: [.9, -2.2], R: [2.6 + Math.sin(lt * 10) * .15, .2] }
    : writing ? { L: [.3, -.1], R: aimAt(300, FLOOR_Y, 560, 1, 300 + (t - tw0) / (tw1 - tw0) * 420 + wr * 80, 900) }
    : { L: [.9, -2.2], R: [.9, -2.2] };
  drawStick(ctx, C(XY, { x: 300, y: FLOOR_Y, s: 560, bob: done ? -Math.abs(Math.sin(lt * 9)) * .02 : 0, lean: done ? -.06 : 0, arms,
    face: { eyes: done ? 'happy' : 'normal', mouth: done ? 'grin' : (writing ? 'smirk' : 'grin'), look: writing ? [.7, -.6] : [.3, -.1], browAng: .25 } }));
  popText(ctx, '送分題！', 760, 1180, 110, '#d8312b', tAt(0, '送分題'), t, tAt(0, '十除以') - tAt(0, '送分題'));
  nameTag(ctx, '小宇', 300, 980, '#2f63c9', .15, t, 2.0);
  popText(ctx, '1/6', 760, 1180, 150, '#2f63c9', tAt(0, '六分之一'), t, tDone - tAt(0, '六分之一'));
  if (done) { const a = kf(t, [[tDone, 0], [tDone + .15, 1], [Le(0) + .2, 1]]); sparkle(ctx, 520, 1020, 60 * a, a); sparkle(ctx, 120, 1060, 44 * a, a); }
} });
// B — 老師冷冷出現,指揮棒點第三行;小宇僵住
SHOTS.push({ start: cut(1), end: cut(2), tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 2); const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, .8); boardQ(ctx, t); applyCam(ctx, cam, 1);
  const k = inv(0, .5, lt); const tx = lerp(1300, 820, easeOut(k));
  const aim = k >= 1;
  drawStick(ctx, C(XY, { x: 300, y: FLOOR_Y, s: 560, arms: { L: [2.6, .2], R: [2.6, .2] },
    face: { eyes: lt > .6 ? 'wide' : 'happy', mouth: lt > .6 ? 'flat' : 'grin', look: [.8, 0] } }));
  if (lt > .8) sweat(ctx, 400, 1020, 24, clamp((lt - .8) * 4));
  drawStick(ctx, C(TC, { x: tx, y: FLOOR_Y, s: 640, flip: -1, legs: k < 1 ? walkLegs(lt, 14) : POSE.idle.legs,
    arms: aim ? { L: [.3, -.1], R: aimAt(tx, FLOOR_Y, 640, -1, QX + 340, QY + 76 + 2 * QH - 10) } : walkArms(lt, 14),
    prop: aim ? pointerProp(.95) : null, face: { eyes: 'half', mouth: 'flat', look: [-.6, -.2] } }));
  nameTag(ctx, '誠誠老師', 820, 900, '#d8312b', Ls(1) + .45, t, 2.3);
} });
// C — 白板特寫第三行;小宇唸完攤手「然後呢?」
SHOTS.push({ start: cut(2), end: cut(3), tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3); const cam = { x: 480 + hh[0], y: 780 + hh[1], z: 1.25 + lt * .02, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, .8); boardQ(ctx, t, { hl: true });
  // 圈「放回」「不放回」
  const y3 = QY + 76 + 2 * QH - 18;
  const wx = str => boardW(ctx, str, QS);
  const c1 = QX + wx('白球') + wx('放回') / 2, c2 = QX + wx('白球放回，紅球') + wx('不放回') / 2;
  redCircle(ctx, c1, y3, wx('放回') / 2 + 22, 40, kf(t, [[tAt(2, '白球放回'), 0], [tAt(2, '白球放回') + .4, 1]], lin));
  redCircle(ctx, c2, y3, wx('不放回') / 2 + 22, 40, kf(t, [[tAt(2, '紅球不放回'), 0], [tAt(2, '紅球不放回') + .4, 1]], lin));
  applyCam(ctx, cam, 1);
  const shrug = t > tAt(2, '然後呢');
  drawStick(ctx, C(XY, { x: 260, y: FLOOR_Y + 40, s: 560, arms: shrug ? { L: [1.6, -.9], R: [1.6, -.9] } : { L: [.3, -.1], R: [.9, -2.2] },
    headTilt: shrug ? .18 : 0, face: { eyes: 'normal', mouth: shrug ? 'o' : 'flat', look: shrug ? [0, 0] : [.6, -.6], browUp: shrug ? 1 : 0 } }));
  if (shrug) { const a = clamp((t - tAt(2, '然後呢')) * 4); qMark(ctx, 380, 1010 - a * 20, 90, a); qMark(ctx, 150, 1040 - a * 30, 64, a); }
} });
// D — 抽球動畫:白球抽出又彈回、紅球被抽走 4 顆
SHOTS.push({ start: cut(3), end: cut(4), tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 2); const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, .8);
  const bx = 120, by = 330, bw = 560, bh = 520;
  rrect(ctx, bx, by, bw, bh, 18); fillStroke(ctx, '#f6e7c8', 8);
  boardText(ctx, '箱子', bx + 20, by - 26, 52, '#8a5a2c');
  rrect(ctx, 740, 470, 220, 380, 18); fillStroke(ctx, '#ffffff', 6); boardText(ctx, '拿走', 795, 450, 52, '#d8312b');
  // 抽球順序:W=白(彈回) R=紅(拿走)
  const seq = 'WRWWRWRWR', dt = (Le(3) - Ls(3) - .2) / seq.length, t0 = .25;
  let rOut = 0; const outPos = [];
  // 白球(代表 50 顆)
  for (let i = 0; i < 18; i++) { const c = i % 6, r = Math.floor(i / 6); ball(ctx, bx + 70 + c * 82, by + 80 + r * 80, 32, false); }
  boardText(ctx, '白 ×50', bx + 380, by + bh - 30, 48, '#1f2a44');
  seq.split('').forEach((ch, j) => {
    const p = (lt - t0 - j * dt) / dt; if (ch === 'R' && p >= 1) rOut++;
    if (p <= 0 || p >= 1 && ch === 'W') return;
    const sx = bx + bw / 2, sy = by + 60;
    if (ch === 'W') { const y = sy + 40 - Math.sin(p * Math.PI) * 110; ball(ctx, sx, y, 34, false); if (p > .6) { text(ctx, '放回', sx + 90, y, 40, '#3fa35b', '#fff', 6, '"Noto Sans CJK TC"', 900); } }
  });
  // 紅球:10 顆,前幾顆依序飛到「拿走」
  let ri = 0;
  for (let i = 0; i < 10; i++) {
    const c = i % 5, r = Math.floor(i / 5); let x = bx + 80 + c * 95, y = by + 330 + r * 80;
    if (i < 4) {
      // 第 i 顆紅球對應 seq 中第 i 個 R
      let j = -1, n = 0; for (let q = 0; q < seq.length; q++) if (seq[q] === 'R') { if (n === i) { j = q; break; } n++; }
      const p = clamp((lt - t0 - j * dt) / dt);
      if (p > 0) { const tx = 805 + (i % 2) * 90, ty = 560 + Math.floor(i / 2) * 110; x = lerp(x, tx, easeOut(p)); y = lerp(y, ty, p) - Math.sin(p * Math.PI) * 240; }
    }
    ball(ctx, x, y, 36, true);
  }
  boardText(ctx, `紅 ×${10 - rOut}`, bx + 40, by + bh + 80, 72, '#d8312b');
  const n30 = Math.min(30, Math.floor(clamp((lt - t0) / (seq.length * dt)) * 30));
  boardText(ctx, `第 ${Math.max(n30, 1)} 次`, 740, 930, 60, '#8a5a2c');
  applyCam(ctx, cam, 1);
  drawStick(ctx, C(TC, { x: 860, y: FLOOR_Y, s: 600, flip: -1, arms: { L: [.3, -.1], R: aimAt(860, FLOOR_Y, 600, -1, 700, 900) }, prop: pointerProp(.5), face: { eyes: 'half', mouth: 'flat', look: [-.5, -.3] } }));
} });
// E — 「蛤?那它們去哪了?」小宇大特寫東張西望
SHOTS.push({ start: cut(4), end: cut(5), tr: 'cut', draw(ctx, lt, t) {
  const sk = lt < .35 ? shake(lt * 4, 14, 1, 3) : [0, 0];
  const cam = { x: 360 + sk[0], y: 1180 + sk[1], z: 2.0, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, 1);
  const lookX = Math.sin(lt * 5) * .9;
  drawStick(ctx, C(XY, { x: 360, y: FLOOR_Y, s: 560, arms: { L: [2.2, -.6], R: [2.2, -.6] }, headTilt: Math.sin(lt * 5) * .12,
    face: { eyes: 'wide', mouth: 'o', look: [lookX, -.2], browUp: 1 } }));
  if (lt < .5) { const a = kf(lt, [[0, 0], [.15, 1, backOut]]); ctx.save(); ctx.translate(560, 950); ctx.scale(a, a); burst(ctx, 0, 0, 90, 11, '#ffd23a'); text(ctx, '蛤', 0, 4, 80, '#d8312b', INK, 0, '"Noto Sans CJK TC"', 900); ctx.restore(); }
} });
// F — 老師冷面:「跟你的零用錢一樣」→ 小宇石化
SHOTS.push({ start: cut(5), end: cut(6), tr: 'cut', draw(ctx, lt, t) {
  const tz = tAt(5, '零用錢'); const stone = t > tz + .25; const sk = stone && t < tz + .6 ? shake(t * 5, 10, 1, 4) : [0, 0];
  const cam = { x: 560 + sk[0], y: 1060 + sk[1], z: 1.25, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, 1);
  drawStick(ctx, C(TC, { x: 800, y: FLOOR_Y, s: 640, flip: -1, arms: { L: [.3, -.1], R: [.9, -2.2] },
    face: { eyes: 'half', mouth: t > tz ? 'smirk' : 'flat', look: [-.6, 0] } }));
  ctx.save(); if (stone) ctx.filter = 'grayscale(1) contrast(.85) brightness(1.05)';
  drawStick(ctx, C(XY, { x: 330, y: FLOOR_Y, s: 560, arms: stone ? { L: [.5, -.6], R: [.5, -.6] } : { L: [.3, -.1], R: [.3, -.1] },
    face: { eyes: stone ? 'wide' : 'normal', mouth: stone ? 'o' : 'flat', look: [.6, 0], browUp: stone ? 1 : 0 } }));
  ctx.restore();
  if (stone) {
    const a = clamp((t - tz - .25) * 6);
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#555'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(300, 1120); ctx.lineTo(320, 1160); ctx.lineTo(305, 1200); ctx.lineTo(330, 1250); ctx.moveTo(360, 1300); ctx.lineTo(345, 1350); ctx.lineTo(365, 1390); ctx.stroke(); ctx.restore();
    // 碎石掉落
    for (let i = 0; i < 5; i++) { const p = ((t - tz - .3) * 1.2 + i * .23) % 1; if (t - tz - .3 > i * .15) { circle(ctx, 250 + i * 38, 1250 + p * 300, 9 + (i % 3) * 3); fillStroke(ctx, '#9a9a9a', 3); } }
    popText(ctx, '石化', 330, 900, 96, '#6b6b6b', tz + .3, t);
  }
  // 零用錢飛走(錢幣)
  if (t > tz) { const p = clamp((t - tz) / 1.2); for (let i = 0; i < 3; i++) { const x = 420 + p * 600 + i * 50, y = 1150 - p * 520 - i * 40; circle(ctx, x, y, 28); fillStroke(ctx, '#f2c230', 5); text(ctx, '$', x, y + 2, 34, '#9a6a00', INK, 0, '"Noto Sans CJK TC"', 900); } }
} });
// G — 小宇恢復、扳手指:紅剩 6、全部剩 56
SHOTS.push({ start: cut(6), end: cut(7), tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 2); const cam = { x: 540 + hh[0], y: 900 + hh[1], z: 1.05, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, .8);
  boardText(ctx, '紅球：10 − 4 = 6', QX, QY + 60, 70, '#d8312b', kf(t, [[tAt(6, '紅球剩'), 0], [tAt(6, '紅球剩') + 1, 1]], lin));
  boardText(ctx, '全部：60 − 4 =', QX, QY + 200, 70, '#1f2a44', kf(t, [[tAt(6, '全部'), 0], [tAt(6, '全部') + .8, 1]], lin));
  popText(ctx, '56', QX + 610, QY + 180, 140, '#d8312b', tAt(6, '五十六'), t);
  applyCam(ctx, cam, 1);
  const cnt = Math.sin(lt * 7) * .2;
  drawStick(ctx, C(XY, { x: 300, y: FLOOR_Y, s: 560, arms: { L: [1.2 + cnt, -1.4], R: [1.2 - cnt, -1.4] }, face: { eyes: 'normal', mouth: 'flat', look: [.3, .4], browAng: -.15 } }));
  drawStick(ctx, C(TC, { x: 840, y: FLOOR_Y, s: 640, flip: -1, arms: { L: [.3, -.1], R: [.9, -2.2] }, face: { eyes: 'normal', mouth: 'smile', look: [-.6, 0] } }));
} });
// H — 老師:6/56 = 3/28,1/6 被打叉
SHOTS.push({ start: cut(7), end: cut(8), tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 2); const cam = { x: 540 + hh[0], y: 900 + hh[1], z: 1.05 + lt * .01, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, .8);
  boardText(ctx, '紅球：10 − 4 = 6', QX, QY + 60, 70, '#d8312b');
  boardText(ctx, '全部：60 − 4 = 56', QX, QY + 200, 70, '#1f2a44');
  boardText(ctx, '6 ÷ 56 =', QX, QY + 380, 84, '#1f2a44', kf(t, [[Ls(7), 0], [tAt(7, '二十八') - .1, 1]], lin));
  popText(ctx, '3/28', QX + 600, QY + 350, 150, '#d8312b', tAt(7, '二十八分之三'), t);
  redCircle(ctx, QX + 600, QY + 352, 190, 95, kf(t, [[tAt(7, '二十八分之三') + .6, 0], [tAt(7, '二十八分之三') + 1.1, 1]], lin));
  boardText(ctx, '1/6', QX + 40, QY + 560, 70, '#2f63c9'); redCross(ctx, QX + 90, QY + 535, 40, kf(t, [[tAt(7, '二十八分之三') + 1.2, 0], [tAt(7, '二十八分之三') + 1.5, 1]], lin));
  applyCam(ctx, cam, 1);
  drawStick(ctx, C(TC, { x: 840, y: FLOOR_Y, s: 640, flip: -1, arms: { L: [.3, -.1], R: aimAt(840, FLOOR_Y, 640, -1, 760, 760) }, prop: pointerProp(.7), face: { eyes: 'normal', mouth: 'smile', look: [-.6, -.3] } }));
  drawStick(ctx, C(XY, { x: 260, y: FLOOR_Y, s: 540, arms: { L: [.3, -.1], R: [.3, -.1] }, face: { eyes: 'wide', mouth: 'o', look: [.7, -.6], browUp: 1 } }));
} });
// I — 「我的分數……跟零用錢一起被抽走了」小宇蹲角落、烏雲,1/6 紙條和錢幣飛走
SHOTS.push({ start: cut(8), end: cut(9), tr: 'whip', draw(ctx, lt, t) {
  const cam = { x: 300, y: 1250, z: 1.6, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, 1);
  ctx.save(); ctx.fillStyle = 'rgba(30,30,60,.18)'; ctx.fillRect(-600, -600, 2400, 3200); ctx.restore();
  drawStick(ctx, C(XY, { x: 230, y: FLOOR_Y, s: 520, bob: .14, lean: .15, legs: { L: [1.3, -2.4], R: [1.2, -2.3] }, arms: { L: [1.0, -1.3], R: [1.1, -1.2] },
    headTilt: .25, face: { eyes: 'half', mouth: 'frown', look: [.2, .6], browAng: -.3 } }));
  // 烏雲 + 雨
  ctx.save(); ctx.globalAlpha = clamp(lt * 3); cloudShape(ctx, 240, 1100 + Math.sin(lt * 2) * 5, 55, 3); fillStroke(ctx, '#8a93a0', 4);
  for (let i = 0; i < 7; i++) { const p = (lt * 1.6 + i * .37) % 1; line(ctx, 190 + i * 16, 1135 + p * 70, 186 + i * 16, 1150 + p * 70, 4, '#6fa8dc'); }
  ctx.restore();
  // 「1/6」紙條和錢幣一起飛走(呼應「抽走就不回來了」)
  const tf = tAt(8, '跟零用錢'), q = clamp((t - tf) / 2.0);
  const nx = lerp(330, 760, easeIn(q)), ny = lerp(1450, 1000, q) - Math.sin(q * Math.PI) * 60;
  ctx.save(); ctx.translate(nx, ny); ctx.rotate(-.2 + q * 2.5); rrect(ctx, -55, -36, 110, 72, 6); fillStroke(ctx, '#fffaf0', 4); text(ctx, '1/6', 0, 2, 42, '#2f63c9', INK, 0, '"Noto Sans CJK TC"', 900); ctx.restore();
  if (q > 0) for (let i = 0; i < 3; i++) { const k = clamp(q * 1.1 - i * .08), x = lerp(380, 820, easeIn(k)) + i * 40, y = lerp(1280, 900, k) - i * 30; circle(ctx, x, y, 24); fillStroke(ctx, '#f2c230', 4); text(ctx, '$', x, y + 2, 30, '#9a6a00', INK, 0, '"Noto Sans CJK TC"', 900); }
} });
// J — CTA:留言「考卷」+ logo + 標語(在 IG 安全區內)
SHOTS.push({ start: cut(9), end: Le(9) + 2.2, tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 2); const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, .8);
  boardText(ctx, '你的考卷也有陷阱嗎？', 540, BOARD.y + 140, 68, '#1f2a44', kf(t, [[Ls(9), 0], [Ls(9) + .9, 1]], lin), 'center');
  const k = kf(t, [[tAt(9, '留言'), 0], [tAt(9, '留言') + .35, 1, backOut]]);
  ctx.save(); ctx.translate(540, BOARD.y + 330); ctx.scale(k, k); boardText(ctx, '留言「考卷」', 0, 40, 140, '#d8312b', 1, 'center'); ctx.restore();
  redCircle(ctx, 540, BOARD.y + 320, 400, 120, kf(t, [[tAt(9, '留言') + .4, 0], [tAt(9, '留言') + 1.0, 1]], lin));
  boardText(ctx, '老師免費幫你抓陷阱', 540, BOARD.y + 560, 64, '#1f2a44', kf(t, [[tAt(9, '我們免費'), 0], [tAt(9, '我們免費') + .9, 1]], lin), 'center');
  // logo + 帳號
  const b = kf(t, [[Le(9) - .3, 0], [Le(9) + .1, 1]]);
  if (b > 0) { ctx.save(); ctx.globalAlpha = b; if (window.LOGO && LOGO.complete) { ctx.save(); circle(ctx, 230, BOARD.y + 690, 52); ctx.clip(); ctx.drawImage(LOGO, 178, BOARD.y + 638, 104, 104); ctx.restore(); }
    text(ctx, '@yuchengtutoring', 590, BOARD.y + 692, 58, '#17253d', INK, 0, 'Poppins', 700); ctx.restore(); }
  applyCam(ctx, cam, 1);
  const wave = Math.sin(lt * 8) * .35;
  drawStick(ctx, C(XY, { x: 270, y: FLOOR_Y, s: 520, arms: { L: [.3, -.1], R: [2.6 + wave, .3] }, face: { eyes: 'happy', mouth: 'grin' } }));
  drawStick(ctx, C(TC, { x: 820, y: FLOOR_Y, s: 620, flip: -1, arms: { L: [.3, -.1], R: [2.5 - wave, .3] }, face: { eyes: 'normal', mouth: 'smile', look: [-.3, 0] } }));
  const c = kf(t, [[Le(9), 0], [Le(9) + .4, 1]]);
  if (c > 0) { ctx.save(); ctx.globalAlpha = c; rrect(ctx, 120, 988, 840, 96, 26); fillStroke(ctx, '#17253d', 0); text(ctx, '宇誠文理｜孩子的專屬家教團隊', 540, 1037, 48, '#ffd23a', INK, 0, '"Noto Sans CJK TC"', 900); ctx.restore(); }
} });
window.LOGO = new Image(); LOGO.src = 'logo.png';
