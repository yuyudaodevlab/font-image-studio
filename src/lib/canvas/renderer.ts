import { TextLayer, FillStyle } from '../../types';

export interface RenderOptions {
  scale?: number; // Output scaling factor (1x, 2x, 3x, 4x)
  autoCrop?: boolean;
  padding?: number;
  drawGuides?: boolean;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export function createFillStyle(
  ctx: CanvasRenderingContext2D,
  fill: FillStyle,
  textWidth: number,
  textHeight: number,
  x: number,
  y: number
): string | CanvasGradient {
  if (fill.type === 'solid') {
    return fill.color || '#ffffff';
  }

  if (fill.type === 'linear-gradient') {
    const angleRad = ((fill.gradientAngle || 0) * Math.PI) / 180;
    const halfW = textWidth / 2;
    const halfH = textHeight / 2;

    const x0 = x - Math.cos(angleRad) * halfW;
    const y0 = y - Math.sin(angleRad) * halfH;
    const x1 = x + Math.cos(angleRad) * halfW;
    const y1 = y + Math.sin(angleRad) * halfH;

    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    const stops = fill.stops && fill.stops.length > 0 ? fill.stops : [
      { id: '1', color: '#3b82f6', offset: 0 },
      { id: '2', color: '#8b5cf6', offset: 1 },
    ];
    stops.forEach((stop) => {
      gradient.addColorStop(Math.min(1, Math.max(0, stop.offset)), stop.color);
    });
    return gradient;
  }

  if (fill.type === 'radial-gradient') {
    const radius = Math.max(textWidth, textHeight) / 2 || 50;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    const stops = fill.stops && fill.stops.length > 0 ? fill.stops : [
      { id: '1', color: '#3b82f6', offset: 0 },
      { id: '2', color: '#8b5cf6', offset: 1 },
    ];
    stops.forEach((stop) => {
      gradient.addColorStop(Math.min(1, Math.max(0, stop.offset)), stop.color);
    });
    return gradient;
  }

  return fill.color || '#ffffff';
}

/**
 * Draws a single text layer onto a canvas context.
 */
export function renderLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  canvasWidth: number,
  canvasHeight: number
) {
  if (!layer.visible) return;

  ctx.save();

  // Calculate position (Center of canvas by default + transform offset)
  const centerX = canvasWidth / 2 + layer.transform.x;
  const centerY = canvasHeight / 2 + layer.transform.y;

  ctx.translate(centerX, centerY);
  ctx.rotate((layer.transform.rotation * Math.PI) / 180);
  ctx.scale(layer.transform.scaleX, layer.transform.scaleY);

  const fontStyle = layer.fontStyle || 'normal';
  const fontWeight = layer.fontWeight || 'normal';
  const fontSize = layer.fontSize || 100;
  const fontFamily = layer.fontFamily || 'sans-serif';

  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
  ctx.textAlign = layer.align || 'center';
  ctx.textBaseline = 'middle';

  const lines = (layer.text || '').split('\n');
  const lineSpacingPx = fontSize * (layer.lineHeight || 1.2);

  // Measure text dimensions for gradient fills
  let maxLineWidth = 0;
  lines.forEach((line) => {
    const metrics = ctx.measureText(line);
    if (metrics.width > maxLineWidth) {
      maxLineWidth = metrics.width;
    }
  });

  if (layer.letterSpacing && layer.letterSpacing !== 0) {
    if ('letterSpacing' in ctx) {
      (ctx as unknown as Record<string, string>).letterSpacing = `${layer.letterSpacing}px`;
    }
  } else if ('letterSpacing' in ctx) {
    (ctx as unknown as Record<string, string>).letterSpacing = '0px';
  }

  const fillStylePattern = createFillStyle(
    ctx,
    layer.fill,
    maxLineWidth,
    lines.length * lineSpacingPx,
    0,
    0
  );

  // Render Glow if enabled
  if (layer.glow && layer.glow.enabled && layer.glow.strength > 0) {
    ctx.save();
    ctx.shadowColor = layer.glow.color || '#00f0ff';
    ctx.shadowBlur = layer.glow.blur || 20;

    for (let i = 0; i < layer.glow.strength; i++) {
      ctx.fillStyle = fillStylePattern;
      renderTextLines(ctx, lines, lineSpacingPx, layer.writingMode);
    }
    ctx.restore();
  }

  // Render Shadow if enabled
  if (layer.shadow && layer.shadow.enabled) {
    ctx.save();
    ctx.shadowColor = layer.shadow.color || '#000000';
    ctx.shadowOffsetX = layer.shadow.offsetX || 4;
    ctx.shadowOffsetY = layer.shadow.offsetY || 4;
    ctx.shadowBlur = layer.shadow.blur || 8;
    ctx.globalAlpha = layer.shadow.opacity !== undefined ? layer.shadow.opacity : 0.5;

    ctx.fillStyle = fillStylePattern;
    renderTextLines(ctx, lines, lineSpacingPx, layer.writingMode);
    ctx.restore();
  }

  // Render Stroke / Border if enabled
  if (layer.stroke && layer.stroke.enabled && layer.stroke.width > 0) {
    ctx.save();
    ctx.strokeStyle = layer.stroke.color || '#000000';
    ctx.lineWidth = layer.stroke.width;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.globalAlpha = layer.stroke.opacity !== undefined ? layer.stroke.opacity : 1;

    renderTextLinesStroke(ctx, lines, lineSpacingPx, layer.writingMode);
    ctx.restore();
  }

  // Render Main Fill Text
  ctx.fillStyle = fillStylePattern;
  renderTextLines(ctx, lines, lineSpacingPx, layer.writingMode);

  ctx.restore();
}

function renderTextLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  lineSpacingPx: number,
  writingMode: 'horizontal' | 'vertical'
) {
  if (writingMode === 'vertical') {
    renderVerticalTextLines(ctx, lines, lineSpacingPx, 'fill');
    return;
  }

  const totalHeight = (lines.length - 1) * lineSpacingPx;
  const startY = -totalHeight / 2;

  lines.forEach((line, index) => {
    const y = startY + index * lineSpacingPx;
    ctx.fillText(line, 0, y);
  });
}

function renderTextLinesStroke(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  lineSpacingPx: number,
  writingMode: 'horizontal' | 'vertical'
) {
  if (writingMode === 'vertical') {
    renderVerticalTextLines(ctx, lines, lineSpacingPx, 'stroke');
    return;
  }

  const totalHeight = (lines.length - 1) * lineSpacingPx;
  const startY = -totalHeight / 2;

  lines.forEach((line, index) => {
    const y = startY + index * lineSpacingPx;
    ctx.strokeText(line, 0, y);
  });
}

function renderVerticalTextLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  lineSpacingPx: number,
  mode: 'fill' | 'stroke'
) {
  const columnWidth = lineSpacingPx;
  const totalWidth = (lines.length - 1) * columnWidth;
  const startX = totalWidth / 2;

  lines.forEach((line, colIndex) => {
    const x = startX - colIndex * columnWidth;
    const chars = Array.from(line);
    const fontSize = parseFloat(ctx.font) || 50;
    const totalCharHeight = (chars.length - 1) * fontSize * 1.1;
    const startY = -totalCharHeight / 2;

    chars.forEach((char, charIndex) => {
      const y = startY + charIndex * fontSize * 1.1;
      if (mode === 'fill') {
        ctx.fillText(char, x, y);
      } else {
        ctx.strokeText(char, x, y);
      }
    });
  });
}

/**
 * Calculates non-transparent pixel bounding box for Auto-Crop functionality.
 */
export function getCanvasBoundingBox(ctx: CanvasRenderingContext2D, width: number, height: number): BoundingBox {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 0) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!found) {
    return { minX: 0, minY: 0, maxX: width, maxY: height, width, height };
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

/**
 * Renders full scene to offscreen canvas at high resolution scale with optional auto-crop.
 */
export function renderToOffscreenCanvas(
  layers: TextLayer[],
  width: number,
  height: number,
  options: RenderOptions = {}
): HTMLCanvasElement {
  const scale = options.scale || 1;
  const autoCrop = options.autoCrop || false;
  const padding = options.padding || 0;

  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context');

  ctx.scale(scale, scale);

  // Render all layers
  layers.forEach((layer) => {
    renderLayer(ctx, layer, width, height);
  });

  if (!autoCrop) {
    return canvas;
  }

  // Calculate bounding box on full size target canvas
  const bbox = getCanvasBoundingBox(ctx, targetWidth, targetHeight);
  const padPx = Math.round(padding * scale);

  const cropX = Math.max(0, bbox.minX - padPx);
  const cropY = Math.max(0, bbox.minY - padPx);
  const cropW = Math.min(targetWidth - cropX, bbox.width + padPx * 2);
  const cropH = Math.min(targetHeight - cropY, bbox.height + padPx * 2);

  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = Math.max(1, cropW);
  croppedCanvas.height = Math.max(1, cropH);
  const cropCtx = croppedCanvas.getContext('2d');
  if (!cropCtx) return canvas;

  cropCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  return croppedCanvas;
}
