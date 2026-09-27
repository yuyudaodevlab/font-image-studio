'use client';

import React from 'react';
import { useAppStore } from '../../stores/useAppStore';
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
} from 'lucide-react';

export const LayersPanel: React.FC = () => {
  const {
    layers,
    selectedLayerId,
    selectLayer,
    addLayer,
    deleteLayer,
    duplicateLayer,
    reorderLayers,
    toggleLayerVisibility,
    toggleLayerLock,
    updateLayer,
  } = useAppStore();

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      reorderLayers(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < layers.length - 1) {
      reorderLayers(index, index + 1);
    }
  };

  return (
    <aside className="w-64 glass-panel border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col h-full select-none">
      {/* Panel Header */}
      <div className="h-10 px-3 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          <span>レイヤー ({layers.length})</span>
        </div>
        <button
          onClick={addLayer}
          className="p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 transition-colors"
          title="新規レイヤー追加"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {layers.map((layer, idx) => {
          const isSelected = layer.id === selectedLayerId;

          return (
            <div
              key={layer.id}
              onClick={() => selectLayer(layer.id)}
              className={`p-2 rounded-lg border text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/80 dark:bg-blue-900/30 border-blue-500/50 text-blue-900 dark:text-blue-100 font-medium'
                  : 'bg-white/40 dark:bg-slate-800/40 border-slate-200/40 dark:border-slate-700/40 text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-800/70'
              }`}
            >
              {/* Layer Title & Inline Editing */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <input
                  type="text"
                  value={layer.name}
                  onChange={(e) => updateLayer(layer.id, { name: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 w-full truncate text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                {/* Visibility */}
                <button
                  onClick={() => toggleLayerVisibility(layer.id)}
                  className={`p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 ${
                    layer.visible ? 'text-slate-500 dark:text-slate-400' : 'text-slate-300 dark:text-slate-600'
                  }`}
                  title={layer.visible ? '非表示にする' : '表示する'}
                >
                  {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>

                {/* Lock */}
                <button
                  onClick={() => toggleLayerLock(layer.id)}
                  className={`p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 ${
                    layer.locked ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'
                  }`}
                  title={layer.locked ? 'ロック解除' : 'ロック'}
                >
                  {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                </button>

                {/* Up/Down Reorder */}
                <button
                  onClick={() => handleMoveUp(idx)}
                  disabled={idx === 0}
                  className="p-0.5 rounded text-slate-400 disabled:opacity-30 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                  title="上へ"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>

                <button
                  onClick={() => handleMoveDown(idx)}
                  disabled={idx === layers.length - 1}
                  className="p-0.5 rounded text-slate-400 disabled:opacity-30 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                  title="下へ"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Duplicate */}
                <button
                  onClick={() => duplicateLayer(layer.id)}
                  className="p-1 rounded text-slate-400 hover:text-blue-500 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                  title="複製"
                >
                  <Copy className="w-3 h-3" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteLayer(layer.id)}
                  disabled={layers.length <= 1}
                  className="p-1 rounded text-slate-400 hover:text-red-500 disabled:opacity-30 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                  title="削除"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Privacy Banner */}
      <div className="p-2 border-t border-slate-200/50 dark:border-slate-800/50 text-[10px] text-slate-400 dark:text-slate-500 text-center leading-tight">
        🔒 すべての処理はこのブラウザ内で行われます。サーバー送信はありません。
      </div>
    </aside>
  );
};
