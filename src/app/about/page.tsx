import type { Metadata } from 'next';
import Link from 'next/link';
import { breadcrumbJsonLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'このサイトについて',
  description:
    '100均DIYメモは、ダイソー・セリアの材料を中心としたDIYアイデアをまとめている個人サイトです。記事の制作方針・お問い合わせ方法をご紹介します。',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'ホーム', href: '/' },
              { name: 'このサイトについて', href: '/about' },
            ]),
          ),
        }}
      />
      <div className="container">
        <nav aria-label="パンくずリスト" className="breadcrumb">
          <Link href="/">ホーム</Link>
          <span aria-hidden> › </span>
          <span>このサイトについて</span>
        </nav>
        <article className="static-page">
          <h1>このサイトについて</h1>
          <p>
            「100均DIYメモ」は、ダイソー・セリアなどの100円ショップで手に入る材料を組み合わせて、
            日々の暮らしをほんの少し便利にするDIYアイデアを記録している個人サイトです。
          </p>

          <h2>サイトの方針</h2>
          <ul>
            <li>市販品より大幅に安く・賃貸でも試しやすいアイデアを中心に紹介します。</li>
            <li>記事は実際に試した内容や、参考にした動画・記事をもとにまとめています。</li>
            <li>
              耐久性や使い勝手で「もう少しいいもの」が欲しい場合のために、Amazon・楽天市場の
              関連商品を検索リンクで案内しています（広告リンクを含みます）。
            </li>
          </ul>

          <h2>運営者</h2>
          <p>個人運営のため、運営者名の公開は控えております。お問い合わせは下記までお願いします。</p>

          <h2>お問い合わせ</h2>
          <p>
            記事内容や掲載に関するご連絡は、サイトの GitHub リポジトリ
            <a
              href="https://github.com/takuya-watanabeaaa/affiliate-comparison-site"
              target="_blank"
              rel="noopener noreferrer"
            >
              {' '}（issue 経由）
            </a>{' '}
            でお願いします。
          </p>

          <h2>参考リンク</h2>
          <ul>
            <li>
              <Link href="/disclosure">アフィリエイト広告に関する開示</Link>
            </li>
            <li>
              <Link href="/privacy">プライバシーポリシー</Link>
            </li>
          </ul>
        </article>
      </div>
    </>
  );
}
