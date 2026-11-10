// ---------- 這題錯在哪 No.003:113 會考數學第 6 題(小宇 × 宇誠老師)----------
const XY = { yc: true, hat: 'tuft', belt: false };                                                     // 小宇:設定圖款細線身體
const TC = { yc: true, shirt: true, hat: 'teacher', belt: false, glasses: true };                     // 老師:白襯衫紅領帶
const C = (base, extra) => Object.assign({}, base, extra);
const walkLegs = (t, sp = 9, amp = .5) => ({ L: [Math.sin(t * sp) * amp + .05, -Math.max(0, Math.sin(t * sp + 1)) * .7], R: [-Math.sin(t * sp) * amp + .05, -Math.max(0, -Math.sin(t * sp + 1)) * .7] });
const walkArms = (t, sp = 9, amp = .5) => ({ L: [.3 - Math.sin(t * sp) * amp, -.3], R: [.3 + Math.sin(t * sp) * amp, -.3] });
const handheld = (t, a = 4) => shake(t * .35, a, 1, 2);
const Ls = i => LINES[i].s, Le = i => LINES[i].e;
// 角色手臂指向畫面上某點(ik 目標換成角色座標)
const aimAt = (cx, cy, s, flip, X, Y) => ({ ik: [(X - cx) / s * flip, (Y - cy) / s], bend: -1 });

// 白板內容(各鏡共用):題目五行 + 依時間出現的算式
const QL = ['箱內有 50 顆白球和 10 顆紅球，', '抽球 31 次，每次抽一球。', '白球放回，紅球不放回。', '前 30 次抽出紅球 4 次，', '第 31 次抽出紅球的機率為何？'];
const QX = BOARD.x + 40, QY = BOARD.y + 100, QH = 92, QS = 56;
function boardContent(ctx, t) {
  boardText(ctx, '這題錯在哪？', QX, QY - 10, 64, '#d8312b', 1);
  QL.forEach((s, i) => boardText(ctx, s, QX, QY + 80 + i * QH, QS, '#1f2a44', kf(t, [[.3 + i * .35, 0], [.7 + i * .35, 1]], x => x)));
  // 小宇的錯誤算法
  const wy = QY + 80 + 5 * QH + 40;
  const w1 = '10 ÷ 60 = 1/6  選 (B)';
  boardText(ctx, w1, QX, wy, 60, '#2f63c9', kf(t, [[Ls(1) + .6, 0], [Ls(1) + 3.6, 1]], x => x));
  redCross(ctx, QX + boardW(ctx, w1, 60) + 60, wy - 20, 34, kf(t, [[Ls(2) + .2, 0], [Ls(2) + .5, 1]], x => x));
  // 第三行紅底線
  redUnderline(ctx, QX, QX + boardW(ctx, QL[2], QS) - 20, QY + 80 + 2 * QH + 16, kf(t, [[Ls(2) + 1.3, 0], [Ls(2) + 2.0, 1]], x => x));
}

const SHOTS = [];
// A — 開場:題目寫上白板,小宇走進來「這題我會!」
SHOTS.push({ start: 0, end: Ls(1) - .1, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3); const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1 + lt * .02, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, .8); boardContent(ctx, t); applyCam(ctx, cam, 1);
  const walkK = inv(.4, 2.2, lt); const x = lerp(-150, 330, easeOut(walkK)); const walking = walkK < 1;
  const arms = walking ? walkArms(lt) : { L: [.3, -.1], R: aimAt(x, FLOOR_Y, 560, 1, 600, 500) };
  drawStick(ctx, C(XY, { x, y: FLOOR_Y, s: 560, bob: walking ? -Math.abs(Math.sin(lt * 9)) * .02 : 0, lean: walking ? .06 : 0,
    legs: walking ? walkLegs(lt) : POSE.idle.legs, arms, face: { eyes: 'normal', mouth: walking ? 'smile' : 'grin', look: [.6, -.3], browAng: walking ? 0 : .25 } }));
} });
// B — 小宇在白板寫錯誤算法,舉雙手很得意
SHOTS.push({ start: Ls(1) - .1, end: Ls(2) - .05, tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 3); const cam = { x: 500 + hh[0], y: 1000 + hh[1], z: 1.08 + lt * .015, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, .8); boardContent(ctx, t); applyCam(ctx, cam, 1);
  const done = t > Ls(1) + 3.6; const writeArm = Math.sin(lt * 16) * .15;
  drawStick(ctx, C(XY, { x: 330, y: FLOOR_Y, s: 560, bob: done ? -Math.abs(Math.sin(lt * 7)) * .03 : 0,
    arms: done ? POSE.handsUp.arms : { L: [.3, -.1], R: aimAt(330, FLOOR_Y, 560, 1, 520 + writeArm * 200, 860) },
    face: { eyes: done ? 'happy' : 'normal', mouth: done ? 'grin' : 'smile', look: [.5, -.4], browAng: .3 } }));
  if (done) { const a = kf(lt, [[3.7, 0], [3.9, 1], [4.6, 0]]); sparkle(ctx, 470, 1000, 60 * a, a); sparkle(ctx, 200, 980, 45 * a, a); }
} });
// C — 老師走進來:「等一下!」紅叉、第三行畫紅線
SHOTS.push({ start: Ls(2) - .05, end: Ls(3) - .1, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 4); const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .015, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, .8); boardContent(ctx, t); applyCam(ctx, cam, 1);
  const k = inv(0, 1.1, lt); const tx = lerp(1250, 800, easeOut(k)); const walking = k < 1;
  const scared = lt > .25;
  drawStick(ctx, C(XY, { x: 300, y: FLOOR_Y, s: 560, bob: scared ? -Math.abs(Math.sin((lt - .25) * 14)) * .04 * clamp(1 - (lt - .25) * 2) : 0,
    arms: { L: [.5, -.4], R: [.5, -.4] }, face: { eyes: scared ? 'wide' : 'normal', mouth: scared ? 'o' : 'grin', browUp: scared ? 1 : 0, look: [.7, 0] } }));
  if (scared) sweat(ctx, 390, 1010, 26, clamp((lt - .3) * 4));
  const aim = !walking;
  drawStick(ctx, C(TC, { x: tx, y: FLOOR_Y, s: 640, flip: -1, bob: walking ? -Math.abs(Math.sin(lt * 9)) * .02 : 0,
    legs: walking ? walkLegs(lt) : POSE.idle.legs,
    arms: aim ? { L: [.3, -.1], R: aimAt(tx, FLOOR_Y, 640, -1, QX + 330, QY + 80 + 2 * QH) } : walkArms(lt),
    prop: aim ? pointerProp(.95) : null,
    face: { eyes: 'normal', mouth: walking ? 'o' : 'smile', look: [-.6, -.2], browAng: -.15 } }));
  // 「!」
  const ex = kf(lt, [[.15, 0], [.35, 1, backOut], [1.4, 1], [1.6, 0]]);
  if (ex > 0) { ctx.save(); ctx.translate(880, 900); ctx.scale(ex, ex); burst(ctx, 0, 0, 80, 11, '#ffd23a'); text(ctx, '!', 0, 4, 90, '#d8312b', INK, 0, '"Noto Sans CJK TC"', 900); ctx.restore(); }
} });
// D — 白板特寫:紅球被抽走 4 顆、沒放回
SHOTS.push({ start: Ls(3) - .1, end: Ls(4) - .1, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3); const cam = { x: 540 + hh[0], y: 620 + hh[1], z: 1.12 + lt * .02, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, .8);
  boardText(ctx, '紅球', 150, 330, 80, '#d8312b'); boardText(ctx, '拿走了，沒放回！', 330, 330, 72, '#1f2a44', kf(lt, [[.2, 0], [1.0, 1]], x => x));
  const bx = 130, by = 420, bw = 520, bh = 300;
  rrect(ctx, bx, by, bw, bh, 16); fillStroke(ctx, '#f6e7c8', 8);
  boardText(ctx, '箱子', bx + 20, by + bh + 60, 48, '#8a5a2c');
  rrect(ctx, 720, 520, 240, 200, 16); fillStroke(ctx, '#ffffff', 6); boardText(ctx, '拿出來', 760, 770, 48, '#8a5a2c');
  let out = 0;
  for (let i = 0; i < 10; i++) {
    const col = i % 5, row = Math.floor(i / 5); let x = bx + 70 + col * 95, y = by + 90 + row * 120;
    const jt = 1.2 + i * .55;
    if (i < 4) { const k = clamp((lt - jt) / .45); if (k >= 1) out++; if (k > 0) { x = lerp(x, 780 + (i % 2) * 110, easeOut(k)); y = lerp(y, 580 + Math.floor(i / 2) * 90, k) - Math.sin(k * Math.PI) * 200; } }
    ball(ctx, x, y, 38, true);
  }
  const n = 10 - out, pop = clamp((lt - (1.2 + (out - 1) * .55 + .45)) / .2);
  ctx.save(); ctx.translate(390, 880); const sc = out ? 1 + .15 * (1 - pop) : 1; ctx.scale(sc, sc);
  boardText(ctx, `紅球剩 ${n} 顆`, 0, 0, 84, '#d8312b', 1, 'center'); ctx.restore();
} });
// E — 算出 3/28,圈 (D)
SHOTS.push({ start: Ls(4) - .1, end: Ls(5) - .1, tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 3); const cam = { x: 540 + hh[0], y: 900 + hh[1], z: 1.05 + lt * .012, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, .8);
  boardText(ctx, '紅球：10 - 4 = 6', QX, QY + 40, 66, '#d8312b', kf(lt, [[.1, 0], [1.2, 1]], x => x));
  boardText(ctx, '總數：50 + 6 = 56', QX, QY + 160, 66, '#1f2a44', kf(lt, [[1.4, 0], [2.6, 1]], x => x));
  boardText(ctx, '6/56 = 3/28', QX, QY + 300, 96, '#1f2a44', kf(lt, [[3.0, 0], [4.6, 1]], x => x));
  const opts = ['(A) 1/5', '(B) 1/6', '(C) 5/12', '(D) 3/28'];
  opts.forEach((s, i) => boardText(ctx, s, QX + (i % 2) * 430, QY + 440 + Math.floor(i / 2) * 100, 60, '#1f2a44', 1));
  redCircle(ctx, QX + 430 + 120, QY + 540 - 20, 150, 56, kf(lt, [[5.0, 0], [5.6, 1]], x => x));
  redCross(ctx, QX + 430 + 280, QY + 440 - 20, 26, 1);
  applyCam(ctx, cam, 1);
  drawStick(ctx, C(TC, { x: 820, y: FLOOR_Y, s: 640, flip: -1,
    arms: { L: [.3, -.1], R: aimAt(820, FLOOR_Y, 640, -1, lt < 4.8 ? QX + 400 : QX + 600, lt < 4.8 ? QY + 250 : QY + 520) }, prop: pointerProp(.62),
    face: { eyes: 'normal', mouth: 'smile', look: [-.6, -.3] } }));
  drawStick(ctx, C(XY, { x: 280, y: FLOOR_Y, s: 520, arms: { L: [.3, -.1], R: [.9, -2.2] }, face: { eyes: 'normal', mouth: 'flat', look: [.7, -.5], browAng: -.1 } }));
} });
// F — 小宇懂了,開心跳起來
SHOTS.push({ start: Ls(5) - .1, end: Ls(6) - .1, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3); const cam = { x: 420 + hh[0], y: 1150 + hh[1], z: 1.45 - lt * .03, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, 1);
  const jump = Math.abs(Math.sin(lt * 5)) * .12;
  drawStick(ctx, C(XY, { x: 400, y: FLOOR_Y, s: 600, bob: -jump, squash: 1 - jump * .3, arms: POSE.handsUp.arms, legs: { L: [.3, -.6 * jump * 6], R: [.3, -.6 * jump * 6] },
    face: { eyes: 'happy', mouth: 'grin', blush: true } }));
  const a = .5 + .5 * Math.sin(lt * 6); sparkle(ctx, 640, 900, 60 * a, a); sparkle(ctx, 180, 950, 50 * (1 - a), 1 - a);
} });
// G — 口訣卡
SHOTS.push({ start: Ls(6) - .1, end: Ls(7) - .1, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 2); const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, 1);
  ctx.save(); ctx.fillStyle = 'rgba(20,20,40,.25)'; ctx.fillRect(-600, -600, 2280, 3200); ctx.restore();
  const k = kf(lt, [[0, 0], [.45, 1, backOut]]);
  ctx.save(); ctx.translate(540, 760); ctx.rotate(-.03); ctx.scale(k, k);
  rrect(ctx, -420, -330, 840, 660, 26); fillStroke(ctx, '#fffaf0', 10);
  boardText(ctx, '記住這句', 0, -200, 84, '#d8312b', 1, 'center');
  boardText(ctx, '紅球不放回，', 0, -40, 84, '#1f2a44', kf(lt, [[.6, 0], [1.6, 1]], x => x), 'center');
  boardText(ctx, '紅球數和總數', 0, 90, 84, '#1f2a44', kf(lt, [[1.6, 0], [2.6, 1]], x => x), 'center');
  boardText(ctx, '都要一起減！', 0, 220, 84, '#d8312b', kf(lt, [[2.6, 0], [3.5, 1]], x => x), 'center');
  ctx.restore();
} });
// H — 結尾 CTA:留言「考卷」+ 品牌標語,兩人揮手
SHOTS.push({ start: Ls(7) - .1, end: Le(7) + 1.2, tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 2); const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0, r: 0 };
  classBG(ctx, cam, t); applyCam(ctx, cam, .8);
  boardText(ctx, '考完的考卷，', 540, BOARD.y + 150, 70, '#1f2a44', kf(lt, [[0, 0], [.8, 1]], x => x), 'center');
  boardText(ctx, '想知道錯在哪？', 540, BOARD.y + 260, 70, '#1f2a44', kf(lt, [[.8, 0], [1.6, 1]], x => x), 'center');
  const k = kf(lt, [[2.0, 0], [2.4, 1, backOut]]);
  ctx.save(); ctx.translate(540, BOARD.y + 440); ctx.scale(k, k); boardText(ctx, '留言「考卷」', 0, 30, 130, '#d8312b', 1, 'center'); ctx.restore();
  redCircle(ctx, 540, BOARD.y + 420, 380, 110, kf(lt, [[2.5, 0], [3.1, 1]], x => x));
  boardText(ctx, '我們免費幫你分析', 540, BOARD.y + 640, 64, '#1f2a44', kf(lt, [[3.2, 0], [4.0, 1]], x => x), 'center');
  applyCam(ctx, cam, 1);
  const wave = Math.sin(lt * 8) * .35;
  drawStick(ctx, C(XY, { x: 280, y: FLOOR_Y, s: 540, arms: { L: [.3, -.1], R: [2.6 + wave, .3] }, face: { eyes: 'happy', mouth: 'grin' } }));
  drawStick(ctx, C(TC, { x: 800, y: FLOOR_Y, s: 640, flip: -1, arms: { L: [.3, -.1], R: [2.5 - wave, .3] }, face: { eyes: 'normal', mouth: 'smile', look: [-.3, 0] } }));
  const b = kf(lt, [[4.2, 0], [4.6, 1]]);
  if (b > 0) { ctx.save(); ctx.globalAlpha = b; rrect(ctx, 140, 1700, 800, 110, 26); fillStroke(ctx, '#17253d', 0); text(ctx, '宇誠文理｜孩子的專屬家教團隊', 540, 1755, 50, '#ffd23a', INK, 0, '"Noto Sans CJK TC"', 900); ctx.restore(); }
} });
