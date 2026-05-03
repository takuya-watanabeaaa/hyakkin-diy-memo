import type { Article } from '@/data/articles';
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
          {r.mainAffiliate ? '関連商品を探す（PR · 楽天市場）' : '関連商品を探す（楽天市場）'}
        </p>
        <p className="article-related-rakuten__lead">
          この記事の内容に近い<strong>商品一覧</strong>を、楽天市場の検索結果から開けます（トップページではなく検索結果へジャンプします）。
        </p>
        <p className="article-related-rakuten__kw" title={r.mainKeyword}>
          メインの検索ワード: <span>{r.mainKeyword}</span>
        </p>
        <a
          href={r.mainHref}
          target="_blank"
          rel={sponsoredRel(r.mainAffiliate)}
          className="article-related-rakuten__banner-link"
        >
          <span className="article-related-rakuten__banner-title">
            楽天市場で関連商品を見る
          </span>
          <span className="article-related-rakuten__banner-sub">
            検索結果ページが開きます
          </span>
        </a>

        {r.ingredients.length > 0 ? (
          <div className="article-related-rakuten__materials">
            <p className="article-related-rakuten__materials-label">
              材料・パーツから探す
            </p>
            <ul className="article-related-rakuten__chip-list">
              {r.ingredients.map((item) => (
                <li key={item.query}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel={sponsoredRel(item.isAffiliate)}
                    className="article-related-rakuten__chip"
                    title={`楽天市場で「${item.query}」を検索`}
                  >
                    {item.label}
                  </a>
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
