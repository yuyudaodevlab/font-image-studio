'use client';

import React, { useRef } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { parseFontFile } from '../../lib/fonts/fontManager';
import {
  Type,
  Plus,
  Undo2,
  Redo2,
  Download,
  FolderOpen,
  Save,
  Upload,
  Sun,
  Moon,
  Monitor,
  RotateCcw,
} from 'lucide-react';

export const TopToolbar: React.FC = () => {
  const {
    undo,
    redo,
    historyIndex,
    history,
    addLayer,
    addFont,
    setExportModalOpen,
    exportProjectJson,
    loadProjectJson,
    resetProject,
    theme,
    setTheme,
    showToast,
  } = useAppStore();

  const fontInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleFontImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const { familyName } = await parseFontFile(file);
        addFont({
          id: `custom-${Date.now()}-${i}`,
          family: familyName,
          source: 'local-file',
        });
        showToast(`フォント 「${familyName}」 を追加しました`);
      } catch (err) {
        showToast(`フォントの読み込みに失敗しました: ${file.name}`);
      }
    }
    if (e.target) e.target.value = '';
  };

  const handleProjectDownload = () => {
    const jsonStr = exportProjectJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `text-design-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('プロジェクトを保存しました');
  };

  const handleProjectImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = loadProjectJson(content);
        if (res.success) {
          showToast('プロジェクトを読み込みました');
          if (res.missingFonts && res.missingFonts.length > 0) {
            showToast(
              `使用されているフォント [${res.missingFonts.join(', ')}] を追加ロードしてください`
            );
          }
        } else {
          showToast('プロジェクトファイルの読み込みに失敗しました');
        }
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  return (
    <header className="h-14 px-4 glass-panel flex items-center justify-between z-30 select-none border-b border-slate-200/50 dark:border-slate-800/50">
      {/* Brand Name */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
          T
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm tracking-wide text-slate-800 dark:text-slate-100">
            Font Image Studio
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 -mt-0.5">
            100% Client-Side Translucent PNG Generator
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={resetProject}
          title="新規プロジェクト (リセット)"
          className="glass-button p-2 rounded-md text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        <button
          onClick={undo}
          disabled={!canUndo}
          title="元に戻す (Ctrl+Z)"
          className={`glass-button p-2 rounded-md ${
            canUndo
              ? 'text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400'
              : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          title="やり直し (Ctrl+Shift+Z)"
          className={`glass-button p-2 rounded-md ${
            canRedo
              ? 'text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400'
              : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        <button
          onClick={addLayer}
          className="glass-button px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:border-blue-500/50"
        >
          <Plus className="w-3.5 h-3.5 text-blue-500" />
          <span>テキスト追加</span>
        </button>

        <button
          onClick={() => fontInputRef.current?.click()}
          className="glass-button px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
        >
          <Upload className="w-3.5 h-3.5 text-slate-500" />
          <span>フォント読込</span>
        </button>
        <input
          ref={fontInputRef}
          type="file"
          accept=".ttf,.otf,.woff,.woff2"
          multiple
          onChange={handleFontImport}
          className="hidden"
        />

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        <button
          onClick={handleProjectDownload}
          title="プロジェクト保存 (.json)"
          className="glass-button p-2 rounded-md text-slate-700 dark:text-slate-200 hover:text-blue-600"
        >
          <Save className="w-4 h-4" />
        </button>

        <button
          onClick={() => jsonInputRef.current?.click()}
          title="プロジェクト開く (.json)"
          className="glass-button p-2 rounded-md text-slate-700 dark:text-slate-200 hover:text-blue-600"
        >
          <FolderOpen className="w-4 h-4" />
        </button>
        <input
          ref={jsonInputRef}
          type="file"
          accept=".json"
          onChange={handleProjectImport}
          className="hidden"
        />

        <button
          onClick={cycleTheme}
          title={`テーマ切替 (${theme})`}
          className="glass-button p-2 rounded-md text-slate-700 dark:text-slate-200"
        >
          {theme === 'light' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : theme === 'dark' ? (
            <Moon className="w-4 h-4 text-blue-400" />
          ) : (
            <Monitor className="w-4 h-4 text-slate-400" />
          )}
        </button>

        <button
          onClick={() => setExportModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all ml-1"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export PNG</span>
        </button>
      </div>
    </header>
  );
};
