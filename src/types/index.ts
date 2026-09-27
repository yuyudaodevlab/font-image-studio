export type AlignMode = 'left' | 'center' | 'right';
export type WritingMode = 'horizontal' | 'vertical';

export type FillType = 'solid' | 'linear-gradient' | 'radial-gradient';

export interface ColorStop {
  id: string;
  color: string;
  offset: number; // 0 to 1
}

export interface FillStyle {
  type: FillType;
  color: string; // solid color or fallback
  gradientAngle: number; // in degrees for linear gradient (0-360)
  stops: ColorStop[];
}

export interface StrokeStyle {
  enabled: boolean;
  color: string;
  width: number;
  opacity: number; // 0 to 1
}

export interface ShadowStyle {
  enabled: boolean;
  color: string;
  offsetX: number;
  offsetY: number;
  blur: number;
  opacity: number; // 0 to 1
}

export interface GlowStyle {
  enabled: boolean;
  color: string;
  blur: number;
  strength: number; // e.g. 1-5 pass intensity
}

export interface Transform {
  x: number;
  y: number;
  rotation: number; // degrees
  scaleX: number;
  scaleY: number;
}

export interface TextLayer {
  id: string;
  name: string;
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '300' | '500' | '700' | '900';
  fontStyle: 'normal' | 'italic';
  align: AlignMode;
  writingMode: WritingMode;
  letterSpacing: number; // px
  lineHeight: number; // multiplier e.g. 1.2
  fill: FillStyle;
  stroke: StrokeStyle;
  shadow: ShadowStyle;
  glow: GlowStyle;
  transform: Transform;
  visible: boolean;
  locked: boolean;
}

export type PresetCanvasSize = 'auto' | '512x512' | '1024x1024' | '1920x1080' | '1080x1080' | '1080x1920' | '3840x2160' | 'custom';

export type BackgroundPreview = 'transparent' | 'white' | 'black' | 'gray' | 'custom';

export interface CanvasSettings {
  preset: PresetCanvasSize;
  width: number;
  height: number;
  autoCrop: boolean;
  cropPadding: number;
  bgPreview: BackgroundPreview;
  customBgColor: string;
  showGuides: boolean;
}

export interface CustomFont {
  id: string;
  family: string;
  source: 'builtin' | 'local-file' | 'local-system';
  format?: string;
  dataUrl?: string;
}

export interface StylePreset {
  id: string;
  name: string;
  fill: FillStyle;
  stroke: StrokeStyle;
  shadow: ShadowStyle;
  glow: GlowStyle;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '300' | '500' | '700' | '900';
}

export interface ExportSettings {
  format: 'png';
  scale: number; // 1, 2, 3, 4, etc.
  fileName: string;
}

export interface ProjectData {
  version: string;
  layers: TextLayer[];
  canvas: CanvasSettings;
  customFonts: Array<{ family: string; source: string }>;
  savedAt: string;
}
