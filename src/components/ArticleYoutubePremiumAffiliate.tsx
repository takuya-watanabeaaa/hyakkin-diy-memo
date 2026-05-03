import type { Article } from '@/data/articles';
import { resolveArticlePremiumAffiliate } from '@/lib/article-premium-affiliate';

type Props = {
  article: Article;
};

function sponsoredRel(isAffiliate: boolean): string {
  return isAffiliate ? 'noopener noreferrer sponsored' : 'noopener noreferrer';
}

/**
 * YouTube 動画付き記事向け: 上位互換・既製品を探すバナー。
 * アフィリエイト用 env が無くても検索リンクは表示（報酬は発生しない通常検索）。
 */
export function ArticleYoutubePremiumAffiliate({ article }: Props) {
  const resolved = resolveArticlePremiumAffiliate(article);
  if (!resolved) return null;

  const { keyword, amazonHref, rakutenHref, amazonAffiliate, rakutenAffiliate } =
    resolved;

  const anyAffiliate = amazonAffiliate || rakutenAffiliate;

  return (
    <aside
      className="article-youtube-premium-affiliate"
      aria-label="上位互換・既製品の検索"
    >
      <div className="article-youtube-premium-affiliate__card">
        <p className="article-youtube-premium-affiliate__eyebrow">
          {anyAffiliate ? '上位互換・既製品を探す（PR）' : '上位互換・既製品を探す'}
        </p>
        <p className="article-youtube-premium-affiliate__text">
          百均DIYと<strong>近い用途</strong>で、耐久やデザインを重視したい場合は、下のリンクから検索結果をご覧ください。
        </p>
        <p className="article-youtube-premium-affiliate__kw" title={keyword}>
          検索キーワード例: <span>{keyword}</span>
        </p>
        <div className="article-youtube-premium-affiliate__actions">
          <a
            href={amazonHref}
            target="_blank"
            rel={sponsoredRel(amazonAffiliate)}
            className="article-youtube-premium-affiliate__btn article-youtube-premium-affiliate__btn--amazon"
          >
            Amazon で探す
          </a>
          <a
            href={rakutenHref}
            target="_blank"
            rel={sponsoredRel(rakutenAffiliate)}
            className="article-youtube-premium-affiliate__btn article-youtube-premium-affiliate__btn--rakuten"
          >
            楽天市場で探す
          </a>
        </div>
      </div>
      <p className="article-youtube-premium-affiliate__note">
        {anyAffiliate
          ? 'アフィリエイト広告を利用しているリンクが含まれます。'
          : '※ Amazon / 楽天のアフィリエイト ID が本番環境に未設定のため、通常の検索リンクです（紹介報酬は発生しません）。Vercel の Environment Variables に AMAZON_ASSOCIATE_TAG と RAKUTEN_AFFILIATE_ID を設定し再デプロイすると広告リンクになります。'}
      </p>
    </aside>
  );
}
