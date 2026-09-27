'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { parseFontFile } from '../lib/fonts/fontManager';
import { TopToolbar } from './layout/TopToolbar';
import { LayersPanel } from './layout/LayersPanel';
import { CanvasViewport } from './canvas/CanvasViewport';
import { PropertiesPanel } from './properties/PropertiesPanel';
import { ExportModal } from './export/ExportModal';
import { Toast } from './common/Toast';
import { Upload } from 'lucide-react';

export const MainApp: React.FC = () => {
  const {
    undo,
    redo,
    selectedLayerId,
    deleteLayer,
    duplicateLayer,
    updateSelectedLayer,
    layers,
    setExportModalOpen,
    addFont,
    loadProjectJson,
    showToast,
    restoreFromLocalStorage,
  } = useAppStore();

  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Restore auto-saved session on initial load
  useEffect(() => {
    restoreFromLocalStorage();

    // Register Service Worker for offline PWA support
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }, [restoreFromLocalStorage]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keybindings when user is typing in an input or textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') {
        return;
      }

      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Undo: Cmd/Ctrl + Z
      if (isCmdOrCtrl && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Cmd/Ctrl + Shift + Z OR Cmd/Ctrl + Y
      if ((isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'z') || (isCmdOrCtrl && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        redo();
        return;
      }

      // Save / Export Modal: Cmd/Ctrl + S
      if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setExportModalOpen(true);
        return;
      }

      // Duplicate Layer: Cmd/Ctrl + D
      if (isCmdOrCtrl && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedLayerId) duplicateLayer(selectedLayerId);
        return;
      }

      // Delete Layer: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedLayerId && layers.length > 1) {
          e.preventDefault();
          deleteLayer(selectedLayerId);
        }
        return;
      }

      // Arrow Keys Nudge
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (!selectedLayerId) return;
        const targetLayer = layers.find((l) => l.id === selectedLayerId);
        if (!targetLayer || targetLayer.locked) return;

        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        let deltaX = 0;
        let deltaY = 0;

        if (e.key === 'ArrowLeft') deltaX = -step;
        if (e.key === 'ArrowRight') deltaX = step;
        if (e.key === 'ArrowUp') deltaY = -step;
        if (e.key === 'ArrowDown') deltaY = step;

        updateSelectedLayer({
          transform: {
            ...targetLayer.transform,
            x: targetLayer.transform.x + deltaX,
            y: targetLayer.transform.y + deltaY,
          },
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedLayerId, deleteLayer, duplicateLayer, updateSelectedLayer, layers, setExportModalOpen]);

  // Drag & Drop Handling for Font and Project Files across full screen
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.clientX === 0 || e.clientY === 0) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase();

      // Handle JSON Project files
      if (ext === 'json') {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) {
            const res = loadProjectJson(content);
            if (res.success) {
              showToast('プロジェクトを読み込みました');
            } else {
              showToast('無効なプロジェクトファイルです');
            }
          }
        };
        reader.readAsText(file);
      }
      // Handle Font files (.ttf, .otf, .woff, .woff2)
      else if (['ttf', 'otf', 'woff', 'woff2'].includes(ext || '')) {
        try {
          const { familyName } = await parseFontFile(file);
          addFont({
            id: `custom-drag-${Date.now()}-${i}`,
            family: familyName,
            source: 'local-file',
          });
          showToast(`フォント 「${familyName}」 を追加しました`);
        } catch (err) {
          showToast(`フォントの読み込みに失敗しました: ${file.name}`);
        }
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans"
    >
      {/* Top Header Navigation */}
      <TopToolbar />

      {/* Main 3-Column Studio Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Layers Panel (Hidden on Mobile) */}
        <div className="hidden md:block">
          <LayersPanel />
        </div>

        {/* Center: Canvas Viewport Workspace */}
        <CanvasViewport />

        {/* Right Sidebar: Property Inspector Panels */}
        <div className="w-full md:w-80">
          <PropertiesPanel />
        </div>
      </div>

      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="fixed inset-0 z-50 bg-blue-600/20 backdrop-blur-md border-4 border-dashed border-blue-500 flex flex-col items-center justify-center text-white p-6 animate-fade-in pointer-events-none">
          <Upload className="w-16 h-16 mb-4 text-blue-400 animate-bounce" />
          <h2 className="text-2xl font-bold mb-2">ファイルを追加</h2>
          <p className="text-sm opacity-90">
            フォントファイル (.ttf, .otf, .woff, .woff2) または プロジェクトファイル (.json) をドロップ
          </p>
        </div>
      )}

      {/* Modals & Toast Notifications */}
      <ExportModal />
      <Toast />
    </div>
  );
};
