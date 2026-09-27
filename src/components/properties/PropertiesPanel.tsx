'use client';

import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { queryLocalFontsSupported, isLocalFontAccessSupported } from '../../lib/fonts/fontManager';
import {
  Type,
  Palette,
  Sparkles,
  Move,
  Maximize,
  Bookmark,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Plus,
  Trash2,
  HelpCircle,
} from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'style' | 'effects' | 'transform' | 'canvas' | 'presets'>('text');

  const {
    layers,
    selectedLayerId,
    updateSelectedLayer,
    fonts,
    addFont,
    canvas,
    updateCanvas,
    presets,
    saveCurrentStyleAsPreset,
    applyPresetToSelectedLayer,
    deletePreset,
    showToast,
  } = useAppStore();

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);
  const [newPresetName, setNewPresetName] = useState('');

  const handleLocalFontAccess = async () => {
    try {
      const localFonts = await queryLocalFontsSupported();
      localFonts.forEach((f) => addFont(f));
      showToast(`${localFonts.length} 個のPC内フォントを検出して読み込みました`);
    } catch (err) {
      showToast('PCフォントの取得に失敗しました。フォントファイルを直接読み込んでください。');
    }
  };

  if (!selectedLayer) {
    return (
      <aside className="w-80 glass-panel border-l border-slate-200/50 dark:border-slate-800/50 p-4 text-xs text-slate-400 text-center flex items-center justify-center">
        レイヤーが選択されていません
      </aside>
    );
  }

  return (
    <aside className="w-80 glass-panel border-l border-slate-200/50 dark:border-slate-800/50 flex flex-col h-full select-none">
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200/50 dark:border-slate-800/50 p-1 text-[11px] font-medium gap-0.5 bg-slate-50/50 dark:bg-slate-900/50 overflow-x-auto">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center gap-1 transition-all ${
            activeTab === 'text'
              ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>文字</span>
        </button>

        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center gap-1 transition-all ${
            activeTab === 'style'
              ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>カラー</span>
        </button>

        <button
          onClick={() => setActiveTab('effects')}
          className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center gap-1 transition-all ${
            activeTab === 'effects'
              ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>装飾</span>
        </button>

        <button
          onClick={() => setActiveTab('transform')}
          className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center gap-1 transition-all ${
            activeTab === 'transform'
              ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Move className="w-3.5 h-3.5" />
          <span>変形</span>
        </button>

        <button
          onClick={() => setActiveTab('canvas')}
          className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center gap-1 transition-all ${
            activeTab === 'canvas'
              ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Maximize className="w-3.5 h-3.5" />
          <span>サイズ</span>
        </button>

        <button
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center gap-1 transition-all ${
            activeTab === 'presets'
              ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>保存</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
        {/* TEXT TAB */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            {/* Multiline Textarea Input */}
            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 font-medium">テキスト入力</label>
              <textarea
                value={selectedLayer.text}
                onChange={(e) => updateSelectedLayer({ text: e.target.value })}
                rows={3}
                placeholder="文字を入力してください..."
                className="w-full glass-input p-2 text-sm text-slate-800 dark:text-slate-100 resize-none focus:outline-none"
              />
            </div>

            {/* Font Picker */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-600 dark:text-slate-400 font-medium">フォント選択</label>
                {isLocalFontAccessSupported() && (
                  <button
                    onClick={handleLocalFontAccess}
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    PCのフォントから選択
                  </button>
                )}
              </div>
              <select
                value={selectedLayer.fontFamily}
                onChange={(e) => updateSelectedLayer({ fontFamily: e.target.value })}
                className="w-full glass-input p-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <optgroup label="標準フォント">
                  <option value="sans-serif">Sans Serif</option>
                  <option value="serif">Serif</option>
                  <option value="monospace">Monospace</option>
                </optgroup>
                <optgroup label="インポート / システムフォント">
                  {fonts.map((f) => (
                    <option key={f.id} value={f.family}>
                      {f.family}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Font Size Slider + Number Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">フォントサイズ</span>
                <input
                  type="number"
                  min={10}
                  max={500}
                  value={selectedLayer.fontSize}
                  onChange={(e) => updateSelectedLayer({ fontSize: Number(e.target.value) || 12 })}
                  className="w-16 glass-input px-1.5 py-0.5 text-right font-mono text-xs"
                />
              </div>
              <input
                type="range"
                min={10}
                max={400}
                value={selectedLayer.fontSize}
                onChange={(e) => updateSelectedLayer({ fontSize: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Bold, Italic, Orientation, Alignment */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-slate-600 dark:text-slate-400 font-medium">スタイル</span>
                <div className="flex gap-1">
                  <button
                    onClick={() =>
                      updateSelectedLayer({
                        fontWeight: selectedLayer.fontWeight === 'bold' ? 'normal' : 'bold',
                      })
                    }
                    className={`flex-1 py-1.5 rounded flex items-center justify-center border ${
                      selectedLayer.fontWeight === 'bold'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'glass-button text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      updateSelectedLayer({
                        fontStyle: selectedLayer.fontStyle === 'italic' ? 'normal' : 'italic',
                      })
                    }
                    className={`flex-1 py-1.5 rounded flex items-center justify-center border ${
                      selectedLayer.fontStyle === 'italic'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'glass-button text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-600 dark:text-slate-400 font-medium">方向</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => updateSelectedLayer({ writingMode: 'horizontal' })}
                    className={`flex-1 py-1 rounded text-[11px] font-medium border ${
                      selectedLayer.writingMode === 'horizontal'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'glass-button text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    横書き
                  </button>
                  <button
                    onClick={() => updateSelectedLayer({ writingMode: 'vertical' })}
                    className={`flex-1 py-1 rounded text-[11px] font-medium border ${
                      selectedLayer.writingMode === 'vertical'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'glass-button text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    縦書き
                  </button>
                </div>
              </div>
            </div>

            {/* Alignment Buttons */}
            <div className="space-y-1">
              <span className="text-slate-600 dark:text-slate-400 font-medium">文字揃え</span>
              <div className="flex gap-1">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => updateSelectedLayer({ align })}
                    className={`flex-1 py-1.5 rounded flex items-center justify-center border ${
                      selectedLayer.align === align
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'glass-button text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                    {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                    {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Letter Spacing & Line Height */}
            <div className="space-y-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">文字間隔 (Letter Spacing)</span>
                  <input
                    type="number"
                    value={selectedLayer.letterSpacing}
                    onChange={(e) => updateSelectedLayer({ letterSpacing: Number(e.target.value) })}
                    className="w-16 glass-input px-1.5 py-0.5 text-right font-mono text-xs"
                  />
                </div>
                <input
                  type="range"
                  min={-20}
                  max={100}
                  value={selectedLayer.letterSpacing}
                  onChange={(e) => updateSelectedLayer({ letterSpacing: Number(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">行間 (Line Height)</span>
                  <input
                    type="number"
                    step={0.1}
                    value={selectedLayer.lineHeight}
                    onChange={(e) => updateSelectedLayer({ lineHeight: Number(e.target.value) })}
                    className="w-16 glass-input px-1.5 py-0.5 text-right font-mono text-xs"
                  />
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  value={selectedLayer.lineHeight}
                  onChange={(e) => updateSelectedLayer({ lineHeight: Number(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* STYLE / COLOR TAB */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* Fill Mode Switcher */}
            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 font-medium">塗りつぶしモード</label>
              <div className="flex gap-1">
                {(['solid', 'linear-gradient', 'radial-gradient'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      updateSelectedLayer({
                        fill: { ...selectedLayer.fill, type },
                      })
                    }
                    className={`flex-1 py-1 rounded text-[10px] font-medium border capitalize ${
                      selectedLayer.fill.type === type
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'glass-button text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {type === 'solid' ? '単色' : type === 'linear-gradient' ? '線形' : '円形'}
                  </button>
                ))}
              </div>
            </div>

            {/* Solid Color Picker */}
            {selectedLayer.fill.type === 'solid' && (
              <div className="space-y-2">
                <label className="text-slate-600 dark:text-slate-400 font-medium">文字色</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedLayer.fill.color || '#ffffff'}
                    onChange={(e) =>
                      updateSelectedLayer({
                        fill: { ...selectedLayer.fill, color: e.target.value },
                      })
                    }
                    className="w-10 h-10 rounded cursor-pointer border-none bg-transparent"
                  />
                  <input
                    type="text"
                    value={selectedLayer.fill.color}
                    onChange={(e) =>
                      updateSelectedLayer({
                        fill: { ...selectedLayer.fill, color: e.target.value },
                      })
                    }
                    className="flex-1 glass-input p-1.5 font-mono text-xs uppercase"
                  />
                </div>
              </div>
            )}

            {/* Gradient Controls */}
            {selectedLayer.fill.type !== 'solid' && (
              <div className="space-y-3">
                {selectedLayer.fill.type === 'linear-gradient' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">角度 ({selectedLayer.fill.gradientAngle}°)</span>
                      <input
                        type="number"
                        min={0}
                        max={360}
                        value={selectedLayer.fill.gradientAngle}
                        onChange={(e) =>
                          updateSelectedLayer({
                            fill: { ...selectedLayer.fill, gradientAngle: Number(e.target.value) },
                          })
                        }
                        className="w-16 glass-input px-1.5 py-0.5 text-right font-mono text-xs"
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={selectedLayer.fill.gradientAngle}
                      onChange={(e) =>
                        updateSelectedLayer({
                          fill: { ...selectedLayer.fill, gradientAngle: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-blue-600"
                    />
                  </div>
                )}

                {/* Color Stops List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">グラデーション分岐</span>
                    <button
                      onClick={() => {
                        const stops = [...(selectedLayer.fill.stops || [])];
                        stops.push({ id: `${Date.now()}`, color: '#ffffff', offset: 0.5 });
                        updateSelectedLayer({
                          fill: { ...selectedLayer.fill, stops },
                        });
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Plus className="w-3 h-3" /> 色を追加
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(selectedLayer.fill.stops || []).map((stop, idx) => (
                      <div key={stop.id} className="flex items-center gap-2">
                        <input
                          type="color"
                          value={stop.color}
                          onChange={(e) => {
                            const stops = [...selectedLayer.fill.stops];
                            stops[idx].color = e.target.value;
                            updateSelectedLayer({ fill: { ...selectedLayer.fill, stops } });
                          }}
                          className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                        />
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={stop.offset}
                          onChange={(e) => {
                            const stops = [...selectedLayer.fill.stops];
                            stops[idx].offset = Number(e.target.value);
                            updateSelectedLayer({ fill: { ...selectedLayer.fill, stops } });
                          }}
                          className="flex-1 accent-blue-600"
                        />
                        <span className="font-mono text-[10px] w-8 text-right">
                          {Math.round(stop.offset * 100)}%
                        </span>
                        {selectedLayer.fill.stops.length > 2 && (
                          <button
                            onClick={() => {
                              const stops = selectedLayer.fill.stops.filter((_, i) => i !== idx);
                              updateSelectedLayer({ fill: { ...selectedLayer.fill, stops } });
                            }}
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* EFFECTS TAB (STROKE, SHADOW, GLOW) */}
        {activeTab === 'effects' && (
          <div className="space-y-5">
            {/* STROKE / BORDER */}
            <div className="p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">縁取り (Stroke)</span>
                <input
                  type="checkbox"
                  checked={selectedLayer.stroke.enabled}
                  onChange={(e) =>
                    updateSelectedLayer({
                      stroke: { ...selectedLayer.stroke, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              {selectedLayer.stroke.enabled && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">枠線の色</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={selectedLayer.stroke.color}
                        onChange={(e) =>
                          updateSelectedLayer({
                            stroke: { ...selectedLayer.stroke, color: e.target.value },
                          })
                        }
                        className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                      />
                      <input
                        type="text"
                        value={selectedLayer.stroke.color}
                        onChange={(e) =>
                          updateSelectedLayer({
                            stroke: { ...selectedLayer.stroke, color: e.target.value },
                          })
                        }
                        className="w-20 glass-input px-1 py-0.5 font-mono text-[11px] uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">太さ (Width)</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={selectedLayer.stroke.width}
                        onChange={(e) =>
                          updateSelectedLayer({
                            stroke: { ...selectedLayer.stroke, width: Number(e.target.value) },
                          })
                        }
                        className="w-14 glass-input px-1 py-0.5 text-right font-mono text-xs"
                      />
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={60}
                      value={selectedLayer.stroke.width}
                      onChange={(e) =>
                        updateSelectedLayer({
                          stroke: { ...selectedLayer.stroke, width: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SHADOW */}
            <div className="p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">ドロップシードー (Shadow)</span>
                <input
                  type="checkbox"
                  checked={selectedLayer.shadow.enabled}
                  onChange={(e) =>
                    updateSelectedLayer({
                      shadow: { ...selectedLayer.shadow, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              {selectedLayer.shadow.enabled && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">影の色</span>
                    <input
                      type="color"
                      value={selectedLayer.shadow.color}
                      onChange={(e) =>
                        updateSelectedLayer({
                          shadow: { ...selectedLayer.shadow, color: e.target.value },
                        })
                      }
                      className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500">Offset X: {selectedLayer.shadow.offsetX}px</span>
                      <input
                        type="range"
                        min={-50}
                        max={50}
                        value={selectedLayer.shadow.offsetX}
                        onChange={(e) =>
                          updateSelectedLayer({
                            shadow: { ...selectedLayer.shadow, offsetX: Number(e.target.value) },
                          })
                        }
                        className="w-full accent-blue-600"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500">Offset Y: {selectedLayer.shadow.offsetY}px</span>
                      <input
                        type="range"
                        min={-50}
                        max={50}
                        value={selectedLayer.shadow.offsetY}
                        onChange={(e) =>
                          updateSelectedLayer({
                            shadow: { ...selectedLayer.shadow, offsetY: Number(e.target.value) },
                          })
                        }
                        className="w-full accent-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500">ぼかし (Blur): {selectedLayer.shadow.blur}px</span>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      value={selectedLayer.shadow.blur}
                      onChange={(e) =>
                        updateSelectedLayer({
                          shadow: { ...selectedLayer.shadow, blur: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* GLOW */}
            <div className="p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">発光 (Glow)</span>
                <input
                  type="checkbox"
                  checked={selectedLayer.glow.enabled}
                  onChange={(e) =>
                    updateSelectedLayer({
                      glow: { ...selectedLayer.glow, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              {selectedLayer.glow.enabled && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Glow Color</span>
                    <input
                      type="color"
                      value={selectedLayer.glow.color}
                      onChange={(e) =>
                        updateSelectedLayer({
                          glow: { ...selectedLayer.glow, color: e.target.value },
                        })
                      }
                      className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                    />
                  </div>

                  <div>
                    <span className="text-slate-500">Blur: {selectedLayer.glow.blur}px</span>
                    <input
                      type="range"
                      min={1}
                      max={60}
                      value={selectedLayer.glow.blur}
                      onChange={(e) =>
                        updateSelectedLayer({
                          glow: { ...selectedLayer.glow, blur: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <span className="text-slate-500">Strength: {selectedLayer.glow.strength}</span>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={selectedLayer.glow.strength}
                      onChange={(e) =>
                        updateSelectedLayer({
                          glow: { ...selectedLayer.glow, strength: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TRANSFORM TAB */}
        {activeTab === 'transform' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-slate-600 dark:text-slate-400 font-medium">位置 X (px)</span>
                <input
                  type="number"
                  value={selectedLayer.transform.x}
                  onChange={(e) =>
                    updateSelectedLayer({
                      transform: { ...selectedLayer.transform, x: Number(e.target.value) },
                    })
                  }
                  className="w-full glass-input p-1.5 font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <span className="text-slate-600 dark:text-slate-400 font-medium">位置 Y (px)</span>
                <input
                  type="number"
                  value={selectedLayer.transform.y}
                  onChange={(e) =>
                    updateSelectedLayer({
                      transform: { ...selectedLayer.transform, y: Number(e.target.value) },
                    })
                  }
                  className="w-full glass-input p-1.5 font-mono text-xs"
                />
              </div>
            </div>

            {/* Rotation */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">回転 (Rotation)</span>
                <span className="font-mono text-slate-500">{selectedLayer.transform.rotation}°</span>
              </div>
              <input
                type="range"
                min={-180}
                max={180}
                value={selectedLayer.transform.rotation}
                onChange={(e) =>
                  updateSelectedLayer({
                    transform: { ...selectedLayer.transform, rotation: Number(e.target.value) },
                  })
                }
                className="w-full accent-blue-600"
              />
            </div>

            {/* Scale X & Scale Y */}
            <div className="space-y-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Scale X</span>
                  <span className="font-mono text-slate-500">{selectedLayer.transform.scaleX}x</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={3.0}
                  step={0.1}
                  value={selectedLayer.transform.scaleX}
                  onChange={(e) =>
                    updateSelectedLayer({
                      transform: { ...selectedLayer.transform, scaleX: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Scale Y</span>
                  <span className="font-mono text-slate-500">{selectedLayer.transform.scaleY}x</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={3.0}
                  step={0.1}
                  value={selectedLayer.transform.scaleY}
                  onChange={(e) =>
                    updateSelectedLayer({
                      transform: { ...selectedLayer.transform, scaleY: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* CANVAS SIZE TAB */}
        {activeTab === 'canvas' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 font-medium">キャンバスプリセット</label>
              <select
                value={canvas.preset}
                onChange={(e) => {
                  const val = e.target.value as any;
                  let w = canvas.width;
                  let h = canvas.height;

                  if (val === '512x512') { w = 512; h = 512; }
                  else if (val === '1024x1024') { w = 1024; h = 1024; }
                  else if (val === '1920x1080') { w = 1920; h = 1080; }
                  else if (val === '1080x1080') { w = 1080; h = 1080; }
                  else if (val === '1080x1920') { w = 1080; h = 1920; }
                  else if (val === '3840x2160') { w = 3840; h = 2160; }

                  updateCanvas({ preset: val, width: w, height: h });
                }}
                className="w-full glass-input p-2 text-xs focus:outline-none"
              >
                <option value="1080x1080">正方形 (1080 × 1080)</option>
                <option value="1920x1080">フルHD (1920 × 1080)</option>
                <option value="1080x1920">縦型 (1080 × 1920)</option>
                <option value="512x512">アイコン (512 × 512)</option>
                <option value="1024x1024">高解像度正方形 (1024 × 1024)</option>
                <option value="3840x2160">4K (3840 × 2160)</option>
                <option value="custom">カスタムサイズ</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-slate-600 dark:text-slate-400 font-medium">幅 (Width px)</span>
                <input
                  type="number"
                  max={8000}
                  value={canvas.width}
                  onChange={(e) =>
                    updateCanvas({
                      preset: 'custom',
                      width: Math.min(8000, Math.max(50, Number(e.target.value))),
                    })
                  }
                  className="w-full glass-input p-1.5 font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <span className="text-slate-600 dark:text-slate-400 font-medium">高さ (Height px)</span>
                <input
                  type="number"
                  max={8000}
                  value={canvas.height}
                  onChange={(e) =>
                    updateCanvas({
                      preset: 'custom',
                      height: Math.min(8000, Math.max(50, Number(e.target.value))),
                    })
                  }
                  className="w-full glass-input p-1.5 font-mono text-xs"
                />
              </div>
            </div>

            {/* AUTO CROP SECTION */}
            <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-50/20 dark:bg-blue-900/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-blue-900 dark:text-blue-100 block">Auto Crop</span>
                  <span className="text-[10px] text-slate-500">文字の余白を自動カットして書き出し</span>
                </div>
                <input
                  type="checkbox"
                  checked={canvas.autoCrop}
                  onChange={(e) => updateCanvas({ autoCrop: e.target.checked })}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              {canvas.autoCrop && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Padding (余白 px)</span>
                  <div className="flex gap-1">
                    {[0, 8, 16, 32, 64].map((pad) => (
                      <button
                        key={pad}
                        onClick={() => updateCanvas({ cropPadding: pad })}
                        className={`flex-1 py-1 rounded text-xs border ${
                          canvas.cropPadding === pad
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'glass-button text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {pad}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Show Guides */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium">中央ガイド線表示</span>
              <input
                type="checkbox"
                checked={canvas.showGuides}
                onChange={(e) => updateCanvas({ showGuides: e.target.checked })}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* PRESETS TAB */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            {/* Save Current Style */}
            <div className="space-y-2 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">現在のスタイルをプリセット保存</span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="プリセット名..."
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="flex-1 glass-input px-2 py-1 text-xs"
                />
                <button
                  onClick={() => {
                    saveCurrentStyleAsPreset(newPresetName);
                    setNewPresetName('');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-medium text-xs shadow-sm"
                >
                  保存
                </button>
              </div>
            </div>

            {/* Presets List */}
            <div className="space-y-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium block">スタイル一覧</span>
              <div className="space-y-1.5">
                {presets.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-800/50 hover:border-blue-500/50 transition-all flex items-center justify-between cursor-pointer"
                    onClick={() => applyPresetToSelectedLayer(p)}
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">{p.name}</span>
                    {p.id.startsWith('user-preset') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePreset(p.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
