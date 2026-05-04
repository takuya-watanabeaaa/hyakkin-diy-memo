import type { Article } from '@/data/articles';
import { AffiliateTrackedLink } from '@/components/AffiliateTrackedLink';
import {
  buildRakutenHgcSearchAffiliateUrl,
  ingredientToSearchQuery,
} from '@/lib/article-premium-affiliate';

type Props = {
  article: Article;
};

/**
 * 「使うものの例」リスト。各行に「楽天で探す」リンクをインラインで添える。
 * - 個別商品 URL は持たないため、楽天市場検索結果（HGC）への誘導
 * - PR 表記はリスト全体上部に1か所まとめて出す（景品表示法・ステマ規制）
 */
export function IngredientsAffiliateList({ article }: Props) {
  const rid = process.env.RAKUTEN_AFFILIATE_ID?.trim();

  return (
    <section className="ingredients-section">
      <div className="ingredients-head">
        <h2>使うものの例</h2>
        <span className="ingredients-pr" aria-label="広告を含む案内">
          {rid ? '楽天検索リンクは PR' : '楽天検索リンク（広告未設定）'}
        </span>
      </div>
      <ul className="ingredients-list">
        {article.ingredients.map((item, i) => {
          const query = ingredientToSearchQuery(item.name);
          const aff = buildRakutenHgcSearchAffiliateUrl(query);
          const href =
            aff ?? `https://search.rakuten.co.jp/search/mall?sitem=${encodeURIComponent(query.slice(0, 120))}`;
          const isAffiliate = !!aff;
          return (
            <li key={i} className="ingredient-row">
              <span className="ingredient-name">{item.name}</span>
              <span className="ingredient-meta">
                <span className="ingredient-price">{item.price}</span>
                <AffiliateTrackedLink
                  href={href}
                  rel={isAffiliate ? 'noopener noreferrer sponsored' : 'noopener noreferrer'}
                  className="ingredient-rakuten"
                  placement="article_related_chip"
                  articleId={article.id}
                  title={`楽天市場で「${query}」を検索`}
                >
                  楽天で探す →
                </AffiliateTrackedLink>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="ingredients-note">
        ※ 個別商品ではなく <strong>楽天市場の検索結果</strong> へのリンクです。価格・在庫はリンク先でご確認ください。
      </p>
    </section>
  );
}
