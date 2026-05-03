import type { Article } from '@/data/articles';
import { resolveArticlePremiumAffiliate } from '@/lib/article-premium-affiliate';

type Props = {
  article: Article;
};

function sponsoredRel(isAffiliate: boolean): string {
  return isAffiliate ? 'noopener noreferrer sponsored' : 'noopener noreferrer';
}

/**
 * YouTube 動画付き記事向け: Amazon で上位互換・既製品を探す。
 * 楽天は記事上部の ArticleRelatedRakutenBanner に統一（検索結果への誘導）。
 */
export function ArticleYoutubePremiumAffiliate({ article }: Props) {
  const resolved = resolveArticlePremiumAffiliate(article);
  if (!resolved) return null;

  const { keyword, amazonHref, amazonAffiliate } = resolved;

  return (
    <aside
      className="article-youtube-premium-affiliate"
      aria-label="上位互換・既製品を Amazon で探す"
    >
      <div className="article-youtube-premium-affiliate__card">
        <p className="article-youtube-premium-affiliate__eyebrow">
          {amazonAffiliate ? '上位互換・既製品を探す（PR · Amazon）' : '上位互換・既製品を探す（Amazon）'}
        </p>
        <p className="article-youtube-premium-affiliate__text">
          百均DIYと<strong>近い用途</strong>で、耐久やデザインを重視したい場合は、Amazon の検索結果をご覧ください。
        </p>
        <p className="article-youtube-premium-affiliate__hint">
          楽天市場での関連商品は、ヒーロー画像のすぐ下にある「関連商品を探す」バナーから開けます。
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
            Amazon で関連商品を見る
          </a>
        </div>
      </div>
      <p className="article-youtube-premium-affiliate__note">
        {amazonAffiliate
          ? 'Amazon アソシエイトの検索リンクです。楽天は記事上部のバナーをご利用ください。'
          : '※ AMAZON_ASSOCIATE_TAG 未設定のため通常の検索リンクです。楽天側は RAKUTEN_AFFILIATE_ID を設定すると関連商品バナーが広告リンクになります。'}
      </p>
    </aside>
  );
}
