'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { renderLayer } from '../../lib/canvas/renderer';
import { ZoomIn, ZoomOut, Maximize2, Move, Eye } from 'lucide-react';

export const CanvasViewport: React.FC = () => {
  const {
    canvas,
    layers,
    selectedLayerId,
    selectLayer,
    updateSelectedLayer,
    zoom,
    setZoom,
    updateCanvas,
  } = useAppStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [layerStartTransform, setLayerStartTransform] = useState({ x: 0, y: 0 });
  const [isNearCenterX, setIsNearCenterX] = useState(false);
  const [isNearCenterY, setIsNearCenterY] = useState(false);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  // Render main canvas view
  const renderCanvas = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render all visible layers
    layers.forEach((layer) => {
      renderLayer(ctx, layer, canvas.width, canvas.height);
    });

    // Render center alignment guidelines if enabled and snapping
    if (canvas.showGuides) {
      if (isNearCenterX || isNearCenterY) {
        ctx.save();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        if (isNearCenterX) {
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2, 0);
          ctx.lineTo(canvas.width / 2, canvas.height);
          ctx.stroke();
        }

        if (isNearCenterY) {
          ctx.beginPath();
          ctx.moveTo(0, canvas.height / 2);
          ctx.lineTo(canvas.width, canvas.height / 2);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }, [canvas, layers, isNearCenterX, isNearCenterY]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Handle Drag / Move Layer
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedLayer || selectedLayer.locked) return;

    const cvs = canvasRef.current;
    if (!cvs) return;

    const rect = cvs.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / zoom;
    const clickY = (e.clientY - rect.top) / zoom;

    setIsDragging(true);
    setDragStart({ x: clickX, y: clickY });
    setLayerStartTransform({
      x: selectedLayer.transform.x,
      y: selectedLayer.transform.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedLayer || selectedLayer.locked) return;

    const cvs = canvasRef.current;
    if (!cvs) return;

    const rect = cvs.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) / zoom;
    const currentY = (e.clientY - rect.top) / zoom;

    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;

    let newX = layerStartTransform.x + deltaX;
    let newY = layerStartTransform.y + deltaY;

    // Center guide snap logic (within 10px threshold)
    const SNAP_THRESHOLD = 12;
    let nearX = false;
    let nearY = false;

    if (Math.abs(newX) < SNAP_THRESHOLD) {
      newX = 0;
      nearX = true;
    }
    if (Math.abs(newY) < SNAP_THRESHOLD) {
      newY = 0;
      nearY = true;
    }

    setIsNearCenterX(nearX);
    setIsNearCenterY(nearY);

    updateSelectedLayer({
      transform: {
        ...selectedLayer.transform,
        x: Math.round(newX),
        y: Math.round(newY),
      },
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsNearCenterX(false);
    setIsNearCenterY(false);
  };

  // Wheel zoom with Ctrl/Cmd key or pinch
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      const newZoom = Math.min(2.0, Math.max(0.25, parseFloat((zoom + delta).toFixed(2))));
      setZoom(newZoom);
    }
  };

  const handleFit = () => {
    if (!containerRef.current) return;
    const containerW = containerRef.current.clientWidth - 80;
    const containerH = containerRef.current.clientHeight - 80;

    const scaleW = containerW / canvas.width;
    const scaleH = containerH / canvas.height;
    const fitScale = Math.min(scaleW, scaleH, 1.5);
    setZoom(parseFloat(fitScale.toFixed(2)));
  };

  // Background Preview style class
  const getBgPreviewStyle = () => {
    switch (canvas.bgPreview) {
      case 'white':
        return { backgroundColor: '#ffffff' };
      case 'black':
        return { backgroundColor: '#000000' };
      case 'gray':
        return { backgroundColor: '#64748b' };
      case 'custom':
        return { backgroundColor: canvas.customBgColor || '#1e293b' };
      case 'transparent':
      default:
        return {};
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className="flex-1 relative flex flex-col items-center justify-center overflow-auto bg-slate-100 dark:bg-slate-950/80 p-6 select-none"
    >
      {/* Canvas Wrapper */}
      <div
        className={`relative shadow-2xl transition-all duration-150 rounded-lg overflow-hidden border border-slate-300/60 dark:border-slate-800 ${
          canvas.bgPreview === 'transparent' ? 'checkerboard-bg' : ''
        }`}
        style={{
          width: canvas.width * zoom,
          height: canvas.height * zoom,
          ...getBgPreviewStyle(),
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvas.width}
          height={canvas.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            width: '100%',
            height: '100%',
            cursor: isDragging ? 'grabbing' : selectedLayer ? 'grab' : 'default',
          }}
        />
      </div>

      {/* Floating Bottom Control Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 rounded-full flex items-center gap-4 text-xs z-20 border border-slate-200/60 dark:border-slate-800/60 shadow-lg">
        {/* Canvas Size */}
        <span className="text-slate-500 font-medium">
          {canvas.width} × {canvas.height} px
        </span>

        <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom(Math.max(0.25, parseFloat((zoom - 0.25).toFixed(2))))}
            className="p-1 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300"
            title="ズームアウト"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="w-12 text-center font-semibold text-slate-700 dark:text-slate-200">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(2.0, parseFloat((zoom + 0.25).toFixed(2))))}
            className="p-1 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300"
            title="ズームイン"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleFit}
            className="p-1 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 ml-1"
            title="画面に合わせる"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />

        {/* Background Preview Picker */}
        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={canvas.bgPreview}
            onChange={(e) => updateCanvas({ bgPreview: e.target.value as any })}
            className="bg-transparent border border-slate-300/60 dark:border-slate-700 text-xs rounded px-1.5 py-0.5 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="transparent">透過 (市松模様)</option>
            <option value="white">白背景</option>
            <option value="black">黒背景</option>
            <option value="gray">グレー背景</option>            <option value="custom">カスタム色</option>
          </select>
          {canvas.bgPreview === 'custom' && (
            <input
              type="color"
              value={canvas.customBgColor}
              onChange={(e) => updateCanvas({ customBgColor: e.target.value })}
              className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
            />
          )}
        </div>
      </div>
    </div>
  );
};
