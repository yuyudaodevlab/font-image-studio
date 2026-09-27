'use client';

import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { renderToOffscreenCanvas } from '../../lib/canvas/renderer';
import { Download, Copy, Check, X, ShieldAlert } from 'lucide-react';

export const ExportModal: React.FC = () => {
  const {
    isExportModalOpen,
    setExportModalOpen,
    exportSettings,
    setExportSettings,
    canvas,
    layers,
    updateCanvas,
    showToast,
  } = useAppStore();

  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isExportModalOpen) return null;

  const estimatedWidth = Math.round(canvas.width * exportSettings.scale);
  const estimatedHeight = Math.round(canvas.height * exportSettings.scale);

  const handleDownload = () => {
    try {
      setIsExporting(true);
      const renderedCanvas = renderToOffscreenCanvas(layers, canvas.width, canvas.height, {
        scale: exportSettings.scale,
        autoCrop: canvas.autoCrop,
        padding: canvas.cropPadding,
      });

      const dataUrl = renderedCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = exportSettings.fileName || 'text-image.png';
      a.click();
      showToast('PNG画像をダウンロードしました');
      setExportModalOpen(false);
    } catch (err) {
      showToast('PNG生成に失敗しました。解像度を下げてお試しください。');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!navigator.clipboard || !window.ClipboardItem) {
      showToast('お使いのブラウザはクリップボードへの画像コピーに対応していません。');
      return;
    }

    try {
      setIsExporting(true);
      const renderedCanvas = renderToOffscreenCanvas(layers, canvas.width, canvas.height, {
        scale: exportSettings.scale,
        autoCrop: canvas.autoCrop,
        padding: canvas.cropPadding,
      });

      renderedCanvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('画像生成に失敗しました');
          setIsExporting(false);
          return;
        }

        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          setCopied(true);
          showToast('クリップボードにPNG画像をコピーしました！');
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          showToast('クリップボードの書き込み権限が拒否されました。');
        } finally {
          setIsExporting(false);
        }
      }, 'image/png');
    } catch (err) {
      showToast('コピーに失敗しました');
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-md glass-panel p-6 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-5 relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-500" />
            <span>PNG Export 設定</span>
          </h3>
          <button
            onClick={() => setExportModalOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Export Settings Form */}
        <div className="space-y-4 text-xs">
          {/* File Name */}
          <div className="space-y-1">
            <label className="text-slate-600 dark:text-slate-400 font-medium">ファイル名</label>
            <input
              type="text"
              value={exportSettings.fileName}
              onChange={(e) => setExportSettings({ fileName: e.target.value })}
              className="w-full glass-input p-2 font-mono text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>

          {/* Scale Resolution */}
          <div className="space-y-1.5">
            <label className="text-slate-600 dark:text-slate-400 font-medium">
              Export Scale / 解像度 ({exportSettings.scale}x)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((scale) => (
                <button
                  key={scale}
                  onClick={() => setExportSettings({ scale })}
                  className={`py-2 rounded-lg font-semibold border transition-all ${
                    exportSettings.scale === scale
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'glass-button text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {scale}x
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-1">
              書き出し想定サイズ: approx. {estimatedWidth} × {estimatedHeight} px
            </p>
          </div>

          {/* Auto Crop & Padding */}
          <div className="p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">Auto Crop</span>
                <span className="text-[10px] text-slate-500">文字の外側の透過余白を自動カット</span>
              </div>
              <input
                type="checkbox"
                checked={canvas.autoCrop}
                onChange={(e) => updateCanvas({ autoCrop: e.target.checked })}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {canvas.autoCrop && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
                <span className="text-slate-600 dark:text-slate-400">Padding (余白)</span>
                <select
                  value={canvas.cropPadding}
                  onChange={(e) => updateCanvas({ cropPadding: Number(e.target.value) })}
                  className="glass-input px-2 py-1 font-mono text-xs focus:outline-none"
                >
                  <option value={0}>0 px</option>
                  <option value={8}>8 px</option>
                  <option value={16}>16 px</option>
                  <option value={32}>32 px</option>
                  <option value={64}>64 px</option>
                </select>
              </div>
            )}
          </div>

          {/* Transparent Background Notice */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-[11px] border border-emerald-500/20">
            <span>✨ 背景は完全透過（Alpha Translucent）としてPNG出力されます。</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
          <button
            onClick={handleCopyToClipboard}
            disabled={isExporting}
            className="flex-1 glass-button py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 hover:border-blue-500/50 disabled:opacity-50"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-blue-500" />}
            <span>クリップボードにコピー</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>PNGを保存</span>
          </button>
        </div>
      </div>
    </div>
  );
};
