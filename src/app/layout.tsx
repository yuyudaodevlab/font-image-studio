import type { Metadata } from 'next';
import './globals.css';
import { MainApp } from '../components/MainApp';

export const metadata: Metadata = {
  title: 'Font Image Studio - 透過文字画像ジェネレーター',
  description: 'ブラウザ上で好きな文字をデザインし、透明背景のPNG画像として保存できるツール',
  manifest: './manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased select-none">
        <MainApp />
      </body>
    </html>
  );
}
