// ---------- 教室場景:牆、白板、地板(宇誠 No.003) ----------
const BOARD = { x: 70, y: 190, w: 940, h: 760 };
const FLOOR_Y = 1560;
function classBG(ctx, cam, t) {
  applyCam(ctx, cam, .6);
  // 牆
  const g = ctx.createLinearGradient(0, -300, 0, FLOOR_Y);
  g.addColorStop(0, '#fdf4e3'); g.addColorStop(1, '#f3e2c4');
  ctx.fillStyle = g; ctx.fillRect(-900, -900, 2880, FLOOR_Y + 2400);
  // 腰牆
  ctx.fillStyle = '#9fc7e8'; ctx.fillRect(-900, FLOOR_Y - 260, 2880, 1600);
  line(ctx, -600, FLOOR_Y - 260, 1680, FLOOR_Y - 260, 8, '#6d9cc4');
  applyCam(ctx, cam, .8);
  // 白板(木框 + 白板面 + 筆槽)
  rrect(ctx, BOARD.x - 26, BOARD.y - 26, BOARD.w + 52, BOARD.h + 52, 18); fillStroke(ctx, '#c98d4e', 8);
  rrect(ctx, BOARD.x, BOARD.y, BOARD.w, BOARD.h, 8); fillStroke(ctx, '#ffffff', 6);
  ctx.save(); rrect(ctx, BOARD.x, BOARD.y, BOARD.w, BOARD.h, 8); ctx.clip();
  ctx.fillStyle = 'rgba(160,190,220,.12)'; ctx.beginPath(); ctx.moveTo(BOARD.x + 560, BOARD.y); ctx.lineTo(BOARD.x + 700, BOARD.y); ctx.lineTo(BOARD.x + 380, BOARD.y + BOARD.h); ctx.lineTo(BOARD.x + 240, BOARD.y + BOARD.h); ctx.fill();
  ctx.restore();
  rrect(ctx, BOARD.x + 120, BOARD.y + BOARD.h + 26, BOARD.w - 240, 26, 8); fillStroke(ctx, '#b07a40', 6);
  rrect(ctx, BOARD.x + 200, BOARD.y + BOARD.h + 12, 90, 18, 6); fillStroke(ctx, '#d8312b', 4);
  rrect(ctx, BOARD.x + 310, BOARD.y + BOARD.h + 12, 90, 18, 6); fillStroke(ctx, '#2f63c9', 4);
  applyCam(ctx, cam, 1);
  // 地板(木紋)
  ctx.fillStyle = '#e2b47c'; ctx.fillRect(-900, FLOOR_Y, 2880, 2400);
  for (let i = -8; i < 20; i++) line(ctx, 540 + i * 140, FLOOR_Y, 540 + i * 420 - 2400 * 0 , FLOOR_Y + 1400, 4, 'rgba(150,95,45,.35)');
  line(ctx, -600, FLOOR_Y, 1680, FLOOR_Y, 8, '#8a5a2c');
}
// 白板上的手寫字:k 從 0 到 1 由左往右寫出
function boardText(ctx, str, x, y, size, col = '#1f2a44', k = 1, align = 'left') {
  if (k <= 0) return;
  ctx.save(); ctx.font = `${size}px Hand`; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  const w = ctx.measureText(str).width; const x0 = align === 'center' ? x - w / 2 : x;
  ctx.beginPath(); ctx.rect(x0 - 10, y - size * 1.2, (w + 20) * clamp(k), size * 1.6); ctx.clip();
  ctx.fillStyle = col; ctx.fillText(str, x, y); ctx.restore();
  return w;
}
function boardW(ctx, str, size) { ctx.save(); ctx.font = `${size}px Hand`; const w = ctx.measureText(str).width; ctx.restore(); return w; }
// 手畫紅底線 / 紅叉 / 紅圈
function redUnderline(ctx, x0, x1, y, k) { if (k <= 0) return; ctx.beginPath(); for (let i = 0; i <= 30 * k; i++) { const x = lerp(x0, x1, i / 30), yy = y + Math.sin(i * .7) * 3; i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.lineWidth = 9; ctx.strokeStyle = '#d8312b'; ctx.lineCap = 'round'; ctx.stroke(); }
function redCross(ctx, x, y, r, k) { if (k <= 0) return; const a = clamp(k * 2), b = clamp(k * 2 - 1); line(ctx, x - r, y - r, x - r + 2 * r * a, y - r + 2 * r * a, 12, '#d8312b'); if (b > 0) line(ctx, x + r, y - r, x + r - 2 * r * b, y - r + 2 * r * b, 12, '#d8312b'); }
function redCircle(ctx, x, y, rx, ry, k) { if (k <= 0) return; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, -.08, -Math.PI * .6, -Math.PI * .6 + TAU * 1.05 * k); ctx.lineWidth = 9; ctx.strokeStyle = '#d8312b'; ctx.lineCap = 'round'; ctx.stroke(); }
// 一顆球
function ball(ctx, x, y, r, red) { circle(ctx, x, y, r); fillStroke(ctx, red ? '#e0392f' : '#ffffff', r * .18); circle(ctx, x - r * .35, y - r * .35, r * .25); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fill(); }
