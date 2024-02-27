import CanvasPainter from "zrender/lib/canvas/Painter";

export function CanvasRenderer(registers: any) {
  registers.registerPainter('canvas', CanvasPainter);
}