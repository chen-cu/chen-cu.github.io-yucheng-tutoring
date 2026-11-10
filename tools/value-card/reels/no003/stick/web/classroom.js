// ---------- 教室場景(2026-11-11 新美術規範:扁平、米白+深藍+珊瑚紅+亮黃,無紋理無漸層)----------
const NAVY = '#17253d', CREAM = '#f7f0e3', FLOORC = '#ecdcc0', CORAL = '#e2483d', YEL = '#ffd23a', BLUE = '#2f63c9';
const SANS = '"Noto Sans CJK TC"';
const BOARD = { x: 60, y: 210, w: 960, h: 690 };
const FLOOR_Y = 1560;
function classBG(ctx, cam, t) {
  applyCam(ctx, cam, .6);
  ctx.fillStyle = CREAM; ctx.fillRect(-1500, -1500, 4080, 4920);
  applyCam(ctx, cam, 1);
  ctx.fillStyle = FLOORC; ctx.fillRect(-1500, FLOOR_Y - 60, 4080, 3000);
  applyCam(ctx, cam, .8);
  ctx.fillStyle = 'rgba(23,37,61,.14)'; rrect(ctx, BOARD.x + 12, BOARD.y + 14, BOARD.w, BOARD.h, 30); ctx.fill();
  rrect(ctx, BOARD.x, BOARD.y, BOARD.w, BOARD.h, 30); fillStroke(ctx, '#ffffff', 8, NAVY);
  applyCam(ctx, cam, 1);
}
const bfont = (size, w) => w === 'hand' ? `${size}px Hand` : `${w} ${size}px ${SANS}`;
// 白板上的字:k 從 0 到 1 由左往右出現;w = 900 / 700 粗黑體,或 'hand' 手寫(只給系列名用)
function boardText(ctx, str, x, y, size, col = NAVY, k = 1, align = 'left', w = 900) {
  if (k <= 0) return;
  ctx.save(); ctx.font = bfont(size, w); ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  const tw = ctx.measureText(str).width; const x0 = align === 'center' ? x - tw / 2 : x;
  ctx.beginPath(); ctx.rect(x0 - 10, y - size * 1.2, (tw + 20) * clamp(k), size * 1.6); ctx.clip();
  ctx.fillStyle = col; ctx.fillText(str, x, y); ctx.restore();
  return tw;
}
function boardW(ctx, str, size, w = 900) { ctx.save(); ctx.font = bfont(size, w); const tw = ctx.measureText(str).width; ctx.restore(); return tw; }
// 黃色螢光筆底(只給真正的重點用);k 由左往右刷出
function marker(ctx, cx, cy, w, h, k = 1, r = -.02) { if (k <= 0) return; ctx.save(); ctx.translate(cx, cy); ctx.rotate(r); rrect(ctx, -w / 2, -h / 2, w * clamp(k), h, Math.min(h * .25, 40)); ctx.fillStyle = YEL; ctx.fill(); ctx.restore(); }
function redUnderline(ctx, x0, x1, y, k) { if (k <= 0) return; ctx.beginPath(); for (let i = 0; i <= 30 * k; i++) { const x = lerp(x0, x1, i / 30), yy = y + Math.sin(i * .7) * 3; i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.lineWidth = 9; ctx.strokeStyle = CORAL; ctx.lineCap = 'round'; ctx.stroke(); }
function redCross(ctx, x, y, r, k) { if (k <= 0) return; const a = clamp(k * 2), b = clamp(k * 2 - 1); line(ctx, x - r, y - r, x - r + 2 * r * a, y - r + 2 * r * a, 12, CORAL); if (b > 0) line(ctx, x + r, y - r, x + r - 2 * r * b, y - r + 2 * r * b, 12, CORAL); }
function redCircle(ctx, x, y, rx, ry, k) { if (k <= 0) return; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, -.08, -Math.PI * .6, -Math.PI * .6 + TAU * 1.05 * k); ctx.lineWidth = 8; ctx.strokeStyle = CORAL; ctx.lineCap = 'round'; ctx.stroke(); }
function ball(ctx, x, y, r, red) { circle(ctx, x, y, r); fillStroke(ctx, red ? CORAL : '#ffffff', 6, NAVY); }
