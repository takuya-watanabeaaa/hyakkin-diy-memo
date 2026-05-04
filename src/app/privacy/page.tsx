import type { Metadata } from 'next';
import Link from 'next/link';
import { breadcrumbJsonLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description:
    '100均DIYメモのプライバシーポリシー。利用するアクセス解析（Vercel Web Analytics）、Cookie、アフィリエイトリンクの取り扱いを記載しています。',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'ホーム', href: '/' },
              { name: 'プライバシーポリシー', href: '/privacy' },
            ]),
          ),
        }}
      />
      <div className="container">
        <nav aria-label="パンくずリスト" className="breadcrumb">
          <Link href="/">ホーム</Link>
          <span aria-hidden> › </span>
          <span>プライバシーポリシー</span>
        </nav>
        <article className="static-page">
          <h1>プライバシーポリシー</h1>
          <p>
            「100均DIYメモ」（以下「当サイト」）における個人情報・閲覧情報の取扱いについて、以下のとおり定めます。
          </p>

          <h2>1. 取得する情報</h2>
          <p>
            当サイトは、お問い合わせフォーム等を提供しておらず、お名前・メールアドレス等の個人情報を直接取得することはありません。
            ただし、サービスの提供および改善のため、以下の情報を取得することがあります。
          </p>
          <ul>
            <li>アクセス時の IP アドレス、ユーザーエージェント、参照元、閲覧ページ、滞在時間</li>
            <li>クリックされたリンクの種類・配置（自家計測のイベントデータ）</li>
          </ul>

          <h2>2. アクセス解析ツール</h2>
          <p>
            当サイトは、運営状況の把握のため <strong>Vercel Web Analytics</strong>{' '}
            を使用しています。Vercel Web Analytics は Cookie を使用せず、個人を特定する情報を保存しません。詳細は
            <a
              href="https://vercel.com/docs/analytics/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              {' '}Vercel 社のプライバシーポリシー
            </a>
            をご確認ください。
          </p>

          <h2>3. Cookie の利用</h2>
          <p>
            当サイト本体は Cookie を必須利用していません。ただし、当サイトに掲載されている広告（楽天アフィリエイト・Amazon
            アソシエイト等）からリンク先へ遷移した際、リンク先サービスにおいて Cookie が利用されることがあります。
            これらの Cookie の取扱いは、各サービスのプライバシーポリシーをご参照ください。
          </p>

          <h2>4. アフィリエイトプログラム</h2>
          <p>
            当サイトは、楽天アフィリエイト・Amazon アソシエイト・A8.net 等のアフィリエイトプログラムに参加しています。
            関連商品リンクをクリックして商品を購入された場合、当サイトに紹介料が支払われることがあります。
            詳細は <Link href="/disclosure">アフィリエイト広告に関する開示</Link> をご確認ください。
          </p>

          <h2>5. 第三者への情報提供</h2>
          <p>
            法令に基づく場合を除き、取得した情報を本人の同意なく第三者へ提供することはありません。
          </p>

          <h2>6. 免責事項</h2>
          <p>
            当サイトの記事は、参考情報として掲載しております。掲載内容を実践される場合は、各自の責任のもとで安全に十分ご注意ください。
            掲載内容を利用したことによって発生したいかなる損害についても、当サイトは責任を負いません。
            また、リンク先の外部サイトの内容については、当サイトでは責任を負いかねます。
          </p>

          <h2>7. 改定</h2>
          <p>
            本ポリシーは、必要に応じて改定されることがあります。改定後の内容は当ページに掲示した時点で効力を生じます。
          </p>
        </article>
      </div>
    </>
  );
}
