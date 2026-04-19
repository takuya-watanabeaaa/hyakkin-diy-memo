import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "100均高見えDIY | プチプラを高見え！簡単まとめ",
  description: "普通に買うと高いあのアイテムを、ダイソーやセリアなどの100均アイテムを使って簡単＆おしゃれにDIYするアイデアをまとめました。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <header className="header">
          <div className="container header-content">
            <a href="/" className="logo">
              100均高見えDIY
              <span>| プチプラで作るおしゃれハック</span>
            </a>
          </div>
        </header>
        <main className="main-content">
          {children}
        </main>
        <footer className="footer">
          <p>© 2026 100均高見えDIY All Rights Reserved. | 100均で作る高見えマガジン</p>
        </footer>
      </body>
    </html>
  );
}
