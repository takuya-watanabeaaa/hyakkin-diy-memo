import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { RakutenAffiliateBanner } from "@/components/RakutenAffiliateBanner";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: '100均DIYの記録｜ダイソー・セリアでできる収納・小物づくり',
    template: '%s | 100均DIYメモ',
  },
  description:
    'すのこ・ワイヤーネット・キャスター・マグネットなど、100円ショップで手に入る材料を組み合わせた収納や棚づくりのアイデアを、記事ごとに材料の目安・手順・つくる時間も添えてまとめています。',
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: '100均DIYの記録｜ダイソー・セリアでできる収納・小物づくり',
    description:
      'プチプラの材料で試しやすいDIYばかりです。キャスター付きワゴンや壁面収納、塗装リメイクなど、気になるネタからどうぞ。',
    url: siteUrl,
    siteName: '100均DIYメモ',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '100均DIYメモ',
    description: '100円ショップの材料でできる収納・インテリアDIYのアイデア集です。',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: '/',
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
            <Link href="/" className="logo">
              100均DIYメモ
              <span>| ダイソー・セリア中心の小さな工作記録</span>
            </Link>
            <nav className="header-nav" aria-label="サイト内">
              <Link href="/affiliate">比較記事</Link>
            </nav>
          </div>
        </header>
        <div className="site-affiliate-banner-wrap">
          <div className="container">
            <RakutenAffiliateBanner />
          </div>
        </div>
        <main className="main-content">
          {children}
        </main>
        <footer className="footer">
          <p>© 2026 100均DIYメモ</p>
        </footer>
      </body>
    </html>
  );
}
