export function drawSol07Banner(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  title: string,
  detail: string
): void {
  const bannerHeight = Math.max(36, Math.min(58, height * 0.16));
  ctx.save();
  ctx.fillStyle = "rgba(71, 25, 29, 0.94)";
  ctx.fillRect(0, 0, width, bannerHeight);
  ctx.strokeStyle = "#ef6f65";
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, width - 4, bannerHeight - 4);
  ctx.fillStyle = "#ff9483";
  ctx.font = `bold ${Math.max(12, Math.floor(width / 58))}px monospace`;
  ctx.fillText(title, 12, Math.max(17, bannerHeight * 0.43));
  ctx.fillStyle = "#f0d8cf";
  ctx.font = `${Math.max(9, Math.floor(width / 86))}px monospace`;
  ctx.fillText(detail, 12, bannerHeight * 0.76);
  ctx.restore();
}

export function isSol07StormPresentationActive(state: any): boolean {
  return Boolean(state?.currentDay === 7 && state?.sol7StormEnded !== true);
}

export function renderSol07UnitScreen(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  unit: string,
  state: any
): boolean {
  if (!isSol07StormPresentationActive(state)) return false;
  return false;
}
