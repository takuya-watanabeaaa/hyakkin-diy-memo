import type { Metadata } from 'next';
import Link from 'next/link';
import { breadcrumbJsonLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'アフィリエイト広告に関する開示',
  description:
    '100均DIYメモのアフィリエイト広告（楽天アフィリエイト・Amazon アソシエイト等）に関する開示と、ステマ規制（景品表示法）への対応方針を記載しています。',
  alternates: { canonical: '/disclosure' },
};

export default function DisclosurePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'ホーム', href: '/' },
              { name: 'アフィリエイト広告に関する開示', href: '/disclosure' },
            ]),
          ),
        }}
      />
      <div className="container">
        <nav aria-label="パンくずリスト" className="breadcrumb">
          <Link href="/">ホーム</Link>
          <span aria-hidden> › </span>
          <span>アフィリエイト広告に関する開示</span>
        </nav>
        <article className="static-page">
          <h1>アフィリエイト広告に関する開示</h1>
          <p>
            「100均DIYメモ」（以下「当サイト」）は、サイト運営費を補うため、以下のアフィリエイトプログラムに参加しています。
            記事内のリンクからリンク先で商品を購入された場合、当サイトに紹介料が支払われることがあります。
          </p>

          <h2>参加しているプログラム</h2>
          <ul>
            <li>楽天アフィリエイト（楽天市場の検索結果へのリンク）</li>
            <li>Amazon アソシエイト・プログラム（Amazon の検索結果へのリンク）</li>
            <li>A8.net 等のアフィリエイトサービス（個別案件のあるとき）</li>
          </ul>

          <h2>表示の方針（ステマ規制への対応）</h2>
          <p>
            2023年10月に施行された景品表示法上のステルスマーケティング規制を遵守し、以下の方針で広告であることを明示しています。
          </p>
          <ul>
            <li>
              アフィリエイトリンクを含むバナー・ボタン・テキストには、
              <strong>「PR」「アフィリエイト」</strong>等の文言を表示しています。
            </li>
            <li>
              全ての記事ページ・トップページ冒頭に、当ページへのリンクを含む短い開示文を掲載しています。
            </li>
            <li>
              リンクには <code>rel=&quot;sponsored&quot;</code> を付け、検索エンジンに対して広告リンクであることを示しています。
            </li>
          </ul>

          <h2>商品の選び方について</h2>
          <p>
            当サイトでは、特定の販売店・メーカーから依頼を受けて記事を執筆することはありません。
            記事は、運営者が興味を持った100均DIYのアイデアを自ら整理してまとめたものであり、
            商品リンクは「同じ用途で別の選択肢を見たい方向け」に楽天市場・Amazon の<strong>検索結果</strong>へのリンクを設置しています。
          </p>

          <h2>関連ページ</h2>
          <ul>
            <li>
              <Link href="/privacy">プライバシーポリシー</Link>
            </li>
            <li>
              <Link href="/about">このサイトについて</Link>
            </li>
          </ul>
        </article>
      </div>
    </>
  );
}
