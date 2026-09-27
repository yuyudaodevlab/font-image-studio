import { create } from 'zustand';
import {
  TextLayer,
  CanvasSettings,
  CustomFont,
  StylePreset,
  ExportSettings,
  ProjectData,
  FillStyle,
  StrokeStyle,
  ShadowStyle,
  GlowStyle,
} from '../types';

export const DEFAULT_FILL: FillStyle = {
  type: 'solid',
  color: '#0f172a', // Dark charcoal/slate for clear visibility
  gradientAngle: 90,
  stops: [
    { id: '1', color: '#2563eb', offset: 0 },
    { id: '2', color: '#7c3aed', offset: 1 },
  ],
};

export const DEFAULT_STROKE: StrokeStyle = {
  enabled: true,
  color: '#ffffff', // White stroke for contrast
  width: 6,
  opacity: 1,
};

export const DEFAULT_SHADOW: ShadowStyle = {
  enabled: false,
  color: '#000000',
  offsetX: 4,
  offsetY: 4,
  blur: 8,
  opacity: 0.5,
};

export const DEFAULT_GLOW: GlowStyle = {
  enabled: false,
  color: '#00f0ff',
  blur: 20,
  strength: 2,
};

export const INITIAL_LAYER: TextLayer = {
  id: 'layer-1',
  name: 'Text Layer 1',
  text: 'Text',
  fontFamily: 'sans-serif',
  fontSize: 120,
  fontWeight: 'bold',
  fontStyle: 'normal',
  align: 'center',
  writingMode: 'horizontal',
  letterSpacing: 0,
  lineHeight: 1.2,
  fill: DEFAULT_FILL,
  stroke: DEFAULT_STROKE,
  shadow: DEFAULT_SHADOW,
  glow: DEFAULT_GLOW,
  transform: {
    x: 0,
    y: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
  },
  visible: true,
  locked: false,
};

export const DEFAULT_CANVAS: CanvasSettings = {
  preset: '1080x1080',
  width: 1080,
  height: 1080,
  autoCrop: false,
  cropPadding: 16,
  bgPreview: 'transparent',
  customBgColor: '#1e293b',
  showGuides: true,
};

export const DEFAULT_EXPORT: ExportSettings = {
  format: 'png',
  scale: 2,
  fileName: 'text-image.png',
};

export const BUILTIN_PRESETS: StylePreset[] = [
  {
    id: 'yt-thumb',
    name: 'YouTube White & Black Border',
    fill: { type: 'solid', color: '#FFFFFF', gradientAngle: 90, stops: [] },
    stroke: { enabled: true, color: '#000000', width: 12, opacity: 1 },
    shadow: { enabled: true, color: '#000000', offsetX: 6, offsetY: 6, blur: 8, opacity: 0.6 },
    glow: { enabled: false, color: '#000000', blur: 0, strength: 1 },
  },
  {
    id: 'dark-contrast',
    name: 'Dark Slate & White Border',
    fill: { type: 'solid', color: '#0f172a', gradientAngle: 90, stops: [] },
    stroke: { enabled: true, color: '#ffffff', width: 8, opacity: 1 },
    shadow: { enabled: true, color: '#000000', offsetX: 4, offsetY: 4, blur: 6, opacity: 0.4 },
    glow: { enabled: false, color: '#000000', blur: 0, strength: 1 },
  },
  {
    id: 'neon-glow',
    name: 'Neon Blue & Purple',
    fill: {
      type: 'linear-gradient',
      color: '#00f0ff',
      gradientAngle: 45,
      stops: [
        { id: '1', color: '#00f0ff', offset: 0 },
        { id: '2', color: '#7000ff', offset: 1 },
      ],
    },
    stroke: { enabled: false, color: '#ffffff', width: 2, opacity: 1 },
    shadow: { enabled: false, color: '#000000', offsetX: 0, offsetY: 0, blur: 0, opacity: 1 },
    glow: { enabled: true, color: '#00f0ff', blur: 25, strength: 3 },
  },
  {
    id: 'gold-luxury',
    name: 'Gold Luxury',
    fill: {
      type: 'linear-gradient',
      color: '#f59e0b',
      gradientAngle: 135,
      stops: [
        { id: '1', color: '#bf953f', offset: 0 },
        { id: '2', color: '#fcf6ba', offset: 0.3 },
        { id: '3', color: '#b38728', offset: 0.7 },
        { id: '4', color: '#fbf5b7', offset: 1 },
      ],
    },
    stroke: { enabled: true, color: '#3a2500', width: 4, opacity: 1 },
    shadow: { enabled: true, color: '#000000', offsetX: 4, offsetY: 6, blur: 10, opacity: 0.7 },
    glow: { enabled: false, color: '#000000', blur: 0, strength: 1 },
  },
];

const MAX_HISTORY = 30;

interface HistoryState {
  layers: TextLayer[];
  canvas: CanvasSettings;
}

interface AppStore {
  // Layers State
  layers: TextLayer[];
  selectedLayerId: string | null;

  // History State
  history: HistoryState[];
  historyIndex: number;

  // Canvas State
  canvas: CanvasSettings;
  zoom: number; // 0.25 to 2.0 or special 'fit' scale

  // Custom Fonts
  fonts: CustomFont[];

  // User Presets
  presets: StylePreset[];

  // Export Modal State
  exportSettings: ExportSettings;
  isExportModalOpen: boolean;

  // Theme
  theme: 'light' | 'dark' | 'system';

  // Toast
  toastMessage: string | null;

  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setZoom: (zoom: number) => void;
  showToast: (msg: string) => void;
  clearToast: () => void;

  // Layer Management
  addLayer: () => void;
  selectLayer: (id: string | null) => void;
  updateLayer: (id: string, updates: Partial<TextLayer>) => void;
  updateSelectedLayer: (updates: Partial<TextLayer>) => void;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  reorderLayers: (startIndex: number, endIndex: number) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;

  // Canvas Management
  updateCanvas: (updates: Partial<CanvasSettings>) => void;

  // Font Management
  addFont: (font: CustomFont) => void;

  // History Actions
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Presets
  saveCurrentStyleAsPreset: (name: string) => void;
  applyPresetToSelectedLayer: (preset: StylePreset) => void;
  deletePreset: (id: string) => void;

  // Export
  setExportSettings: (settings: Partial<ExportSettings>) => void;
  setExportModalOpen: (open: boolean) => void;

  // Project JSON
  exportProjectJson: () => string;
  loadProjectJson: (jsonString: string) => { success: boolean; missingFonts?: string[] };

  // Auto save & Restore
  saveToLocalStorage: () => void;
  restoreFromLocalStorage: () => boolean;
  clearLocalStorage: () => void;
  resetProject: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  layers: [INITIAL_LAYER],
  selectedLayerId: INITIAL_LAYER.id,

  history: [{ layers: [INITIAL_LAYER], canvas: DEFAULT_CANVAS }],
  historyIndex: 0,

  canvas: DEFAULT_CANVAS,
  zoom: 1,

  fonts: [
    { id: 'sans', family: 'Sans Serif', source: 'builtin' },
    { id: 'serif', family: 'Serif', source: 'builtin' },
    { id: 'mono', family: 'Monospace', source: 'builtin' },
    { id: 'noto-sans-jp', family: 'Noto Sans JP', source: 'builtin' },
    { id: 'm-plus-rounded', family: 'M PLUS Rounded 1c', source: 'builtin' },
  ],

  presets: BUILTIN_PRESETS,

  exportSettings: DEFAULT_EXPORT,
  isExportModalOpen: false,

  theme: 'system',
  toastMessage: null,

  setTheme: (theme) => set({ theme }),
  setZoom: (zoom) => set({ zoom }),
  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => set({ toastMessage: null }), 3000);
  },
  clearToast: () => set({ toastMessage: null }),

  pushHistory: () => {
    const { layers, canvas, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    const currentState = {
      layers: JSON.parse(JSON.stringify(layers)),
      canvas: JSON.parse(JSON.stringify(canvas)),
    };
    if (newHistory.length >= MAX_HISTORY) {
      newHistory.shift();
    }
    newHistory.push(currentState);
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
    get().saveToLocalStorage();
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const state = history[prevIndex];
      set({
        layers: JSON.parse(JSON.stringify(state.layers)),
        canvas: JSON.parse(JSON.stringify(state.canvas)),
        historyIndex: prevIndex,
      });
      get().saveToLocalStorage();
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const state = history[nextIndex];
      set({
        layers: JSON.parse(JSON.stringify(state.layers)),
        canvas: JSON.parse(JSON.stringify(state.canvas)),
        historyIndex: nextIndex,
      });
      get().saveToLocalStorage();
    }
  },

  addLayer: () => {
    const { layers } = get();
    const newId = `layer-${Date.now()}`;
    const newLayer: TextLayer = {
      ...INITIAL_LAYER,
      id: newId,
      name: `Text Layer ${layers.length + 1}`,
      transform: {
        ...INITIAL_LAYER.transform,
        x: (layers.length * 20) % 200,
        y: (layers.length * 20) % 200,
      },
    };
    set({
      layers: [...layers, newLayer],
      selectedLayerId: newId,
    });
    get().pushHistory();
  },

  selectLayer: (id) => set({ selectedLayerId: id }),

  updateLayer: (id, updates) => {
    const { layers } = get();
    set({
      layers: layers.map((layer) =>
        layer.id === id ? { ...layer, ...updates } : layer
      ),
    });
    get().pushHistory();
  },

  updateSelectedLayer: (updates) => {
    const { selectedLayerId, updateLayer } = get();
    if (selectedLayerId) {
      updateLayer(selectedLayerId, updates);
    }
  },

  deleteLayer: (id) => {
    const { layers, selectedLayerId } = get();
    if (layers.length <= 1) return; // Keep at least one layer
    const nextLayers = layers.filter((l) => l.id !== id);
    set({
      layers: nextLayers,
      selectedLayerId: selectedLayerId === id ? nextLayers[nextLayers.length - 1].id : selectedLayerId,
    });
    get().pushHistory();
  },

  duplicateLayer: (id) => {
    const { layers } = get();
    const target = layers.find((l) => l.id === id);
    if (!target) return;

    const newId = `layer-${Date.now()}`;
    const duplicated: TextLayer = JSON.parse(JSON.stringify(target));
    duplicated.id = newId;
    duplicated.name = `${target.name} Copy`;
    duplicated.transform.x += 20;
    duplicated.transform.y += 20;

    set({
      layers: [...layers, duplicated],
      selectedLayerId: newId,
    });
    get().pushHistory();
  },

  reorderLayers: (startIndex, endIndex) => {
    const { layers } = get();
    const result = Array.from(layers);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    set({ layers: result });
    get().pushHistory();
  },

  toggleLayerVisibility: (id) => {
    const { layers } = get();
    set({
      layers: layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    });
    get().pushHistory();
  },

  toggleLayerLock: (id) => {
    const { layers } = get();
    set({
      layers: layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)),
    });
    get().pushHistory();
  },

  updateCanvas: (updates) => {
    const { canvas } = get();
    set({ canvas: { ...canvas, ...updates } });
    get().pushHistory();
  },

  addFont: (font) => {
    const { fonts } = get();
    if (!fonts.some((f) => f.family === font.family)) {
      set({ fonts: [...fonts, font] });
    }
  },

  saveCurrentStyleAsPreset: (name) => {
    const { layers, selectedLayerId, presets } = get();
    const layer = layers.find((l) => l.id === selectedLayerId);
    if (!layer) return;

    const newPreset: StylePreset = {
      id: `user-preset-${Date.now()}`,
      name: name || 'Custom Style',
      fill: JSON.parse(JSON.stringify(layer.fill)),
      stroke: JSON.parse(JSON.stringify(layer.stroke)),
      shadow: JSON.parse(JSON.stringify(layer.shadow)),
      glow: JSON.parse(JSON.stringify(layer.glow)),
      fontSize: layer.fontSize,
      fontWeight: layer.fontWeight,
    };

    const nextPresets = [...presets, newPreset];
    set({ presets: nextPresets });
    try {
      localStorage.setItem('font_studio_user_presets', JSON.stringify(nextPresets));
    } catch {}
    get().showToast('プリセットを保存しました');
  },

  applyPresetToSelectedLayer: (preset) => {
    const { updateSelectedLayer } = get();
    updateSelectedLayer({
      fill: JSON.parse(JSON.stringify(preset.fill)),
      stroke: JSON.parse(JSON.stringify(preset.stroke)),
      shadow: JSON.parse(JSON.stringify(preset.shadow)),
      glow: JSON.parse(JSON.stringify(preset.glow)),
      ...(preset.fontSize ? { fontSize: preset.fontSize } : {}),
      ...(preset.fontWeight ? { fontWeight: preset.fontWeight } : {}),
    });
    get().showToast(`プリセット 「${preset.name}」 を適用しました`);
  },

  deletePreset: (id) => {
    const { presets } = get();
    const nextPresets = presets.filter((p) => p.id !== id);
    set({ presets: nextPresets });
    try {
      localStorage.setItem('font_studio_user_presets', JSON.stringify(nextPresets));
    } catch {}
  },

  setExportSettings: (settings) => {
    set({ exportSettings: { ...get().exportSettings, ...settings } });
  },

  setExportModalOpen: (open) => set({ isExportModalOpen: open }),

  exportProjectJson: () => {
    const { layers, canvas, fonts } = get();
    const data: ProjectData = {
      version: '1.0',
      layers,
      canvas,
      customFonts: fonts.map((f) => ({ family: f.family, source: f.source })),
      savedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  loadProjectJson: (jsonString) => {
    try {
      const data: ProjectData = JSON.parse(jsonString);
      if (!data.layers || !Array.isArray(data.layers)) {
        throw new Error('Invalid project structure');
      }

      // Check missing custom fonts
      const currentFonts = get().fonts.map((f) => f.family);
      const missingFonts = (data.customFonts || [])
        .filter((f) => !currentFonts.includes(f.family))
        .map((f) => f.family);

      set({
        layers: data.layers,
        canvas: data.canvas || DEFAULT_CANVAS,
        selectedLayerId: data.layers[0]?.id || null,
        history: [{ layers: data.layers, canvas: data.canvas || DEFAULT_CANVAS }],
        historyIndex: 0,
      });

      get().saveToLocalStorage();
      return { success: true, missingFonts };
    } catch (err) {
      return { success: false };
    }
  },

  saveToLocalStorage: () => {
    try {
      const { layers, canvas } = get();
      localStorage.setItem(
        'font_studio_auto_save',
        JSON.stringify({ layers, canvas, timestamp: Date.now() })
      );
    } catch {}
  },

  restoreFromLocalStorage: () => {
    try {
      const saved = localStorage.getItem('font_studio_auto_save');
      if (!saved) return false;
      const parsed = JSON.parse(saved);
      if (parsed.layers && Array.isArray(parsed.layers)) {
        set({
          layers: parsed.layers,
          canvas: parsed.canvas || DEFAULT_CANVAS,
          selectedLayerId: parsed.layers[0]?.id || null,
          history: [{ layers: parsed.layers, canvas: parsed.canvas || DEFAULT_CANVAS }],
          historyIndex: 0,
        });
        return true;
      }
    } catch {}
    return false;
  },

  clearLocalStorage: () => {
    try {
      localStorage.removeItem('font_studio_auto_save');
    } catch {}
  },

  resetProject: () => {
    set({
      layers: [INITIAL_LAYER],
      selectedLayerId: INITIAL_LAYER.id,
      canvas: DEFAULT_CANVAS,
      history: [{ layers: [INITIAL_LAYER], canvas: DEFAULT_CANVAS }],
      historyIndex: 0,
    });
    get().saveToLocalStorage();
  },
}));
