import type { Article } from '@/data/articles';
import { AffiliateTrackedLink } from '@/components/AffiliateTrackedLink';
import { resolveArticleRelatedRakuten } from '@/lib/article-premium-affiliate';

type Props = {
  article: Article;
};

function sponsoredRel(isAffiliate: boolean): string {
  return isAffiliate ? 'noopener noreferrer sponsored' : 'noopener noreferrer';
}

/**
 * 記事に紐づく「関連商品」誘導: 楽天市場の検索結果（商品一覧）へのバナー。
 * 楽天アフィリエイトでは個別商品 URL を大量に持たず、検索 HGC が一般的。
 */
export function ArticleRelatedRakutenBanner({ article }: Props) {
  const r = resolveArticleRelatedRakuten(article);

  return (
    <aside
      className="article-related-rakuten"
      aria-label="この記事に関連する商品を楽天市場で探す"
    >
      <div className="article-related-rakuten__inner">
        <p className="article-related-rakuten__eyebrow">
          {r.mainAffiliate ? '材料・パーツをまとめて探す（PR · 楽天市場）' : '材料・パーツをまとめて探す（楽天市場）'}
        </p>
        <p className="article-related-rakuten__lead">
          百均で見つからないサイズや色、あとから買い足したい<strong>キャスター・ネジ・塗料</strong>などは、
          この記事向けに絞った<strong>楽天市場の検索結果</strong>からまとめて探せます。
        </p>
        <AffiliateTrackedLink
          href={r.mainHref}
          rel={sponsoredRel(r.mainAffiliate)}
          className="article-related-rakuten__banner-link"
          placement="article_related_main"
          articleId={article.id}
        >
          <span className="article-related-rakuten__banner-title">楽天市場で材料を探す</span>
          <span className="article-related-rakuten__banner-sub">
            「{r.mainKeyword.slice(0, 28)}{r.mainKeyword.length > 28 ? '…' : ''}」の検索結果<span aria-hidden> →</span>
          </span>
        </AffiliateTrackedLink>

        {r.ingredients.length > 0 ? (
          <div className="article-related-rakuten__materials">
            <p className="article-related-rakuten__materials-label">
              材料・パーツから探す
            </p>
            <ul className="article-related-rakuten__chip-list">
              {r.ingredients.map((item) => (
                <li key={item.query}>
                  <AffiliateTrackedLink
                    href={item.href}
                    rel={sponsoredRel(item.isAffiliate)}
                    className="article-related-rakuten__chip"
                    title={`楽天市場で「${item.query}」を検索`}
                    placement="article_related_chip"
                    articleId={article.id}
                  >
                    {item.label}
                  </AffiliateTrackedLink>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="article-related-rakuten__note">
          {r.mainAffiliate
            ? '表示されているリンクは楽天アフィリエイト（検索結果への HGC）です。'
            : '※ RAKUTEN_AFFILIATE_ID 未設定のため通常の検索リンクです（報酬は発生しません）。'}
        </p>
      </div>
    </aside>
  );
}
