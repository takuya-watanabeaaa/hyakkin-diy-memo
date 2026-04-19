import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: '100均高見えDIY | プチプラで作るおしゃれインテリアまとめ',
    template: '%s | 100均高見えDIY',
  },
  description: '普通に買うと高いあのインテリアが、ダイソー・セリア・キャンドゥなどの100均アイテムだけで簡単＆おしゃれに作れる！キャスター・マグネット・ワイヤーネット・アイアンバー活用など、高見えDIYを徹底まとめ。',
  metadataBase: new URL('https://100yen-diy.vercel.app'),
  openGraph: {
    title: '100均高見えDIY | プチプラで作るおしゃれインテリアまとめ',
    description: '普通に買うと数千〜数万円するインテリアを、100均アイテムだけで作る高見えDIYを紹介しています。',
    url: 'https://100yen-diy.vercel.app',
    siteName: '100均高見えDIY',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '100均高見えDIY',
    description: '普通に買うと高いインテリアを100均DIYで！',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: 'https://100yen-diy.vercel.app',
  },
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
