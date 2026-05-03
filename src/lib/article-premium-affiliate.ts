import type { Article } from '@/data/articles';
import { itemCategories } from '@/data/categories';

/** 検索リンク用にタイトルを短く整形（記号を間引き） */
function condensedTitleSnippet(title: string): string {
  return title
    .replace(/[!！?？]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 42);
}

/**
 * 記事ごとに「上位互換・既製品」を探すための検索語。
 * 個別商品 URL は持たず、Amazon / 楽天の検索結果アフィリエイトに誘導する。
 */
export function premiumAffiliateSearchKeyword(article: Article): string {
  const ic = itemCategories.find((c) => c.id === article.item_category);
  const label = ic?.label ?? '';
  const snippet = condensedTitleSnippet(article.title);
  const kw = `${label} ${snippet}`.replace(/\s+/g, ' ').trim();
  return kw.slice(0, 120);
}

export function buildAmazonSearchAffiliateUrl(keyword: string): string | null {
  const tag = process.env.AMAZON_ASSOCIATE_TAG?.trim();
  const kw = keyword.trim();
  if (!tag || !kw) return null;
  const k = encodeURIComponent(kw);
  return `https://www.amazon.co.jp/s?k=${k}&tag=${encodeURIComponent(tag)}`;
}

/** Python affiliate_links の楽天市場検索 HGC と同形式 */
export function buildRakutenHgcSearchAffiliateUrl(keyword: string): string | null {
  const rid = process.env.RAKUTEN_AFFILIATE_ID?.trim();
  const raw = keyword.trim().slice(0, 120);
  if (!rid || !raw) return null;
  const pcDest = `http://search.rakuten.co.jp/search/mall?sitem=${encodeURIComponent(raw)}`;
  const mDest = 'http://m.rakuten.co.jp/';
  const base = `https://hb.afl.rakuten.co.jp/hgc/${rid}/`;
  return `${base}?pc=${encodeURIComponent(pcDest)}&m=${encodeURIComponent(mDest)}`;
}

export type ArticlePremiumAffiliateResolved = {
  keyword: string;
  amazonHref: string;
  rakutenHref: string;
  amazonAffiliate: boolean;
  rakutenAffiliate: boolean;
};

/** 環境変数がなくても常に検索 URL を返す（本番でバナーが消えないようにする） */
export function resolveArticlePremiumAffiliate(
  article: Article,
): ArticlePremiumAffiliateResolved | null {
  if (!article.youtube_id?.trim()) return null;
  const keyword = premiumAffiliateSearchKeyword(article);
  const kw = keyword.trim();
  const amazonAff = buildAmazonSearchAffiliateUrl(keyword);
  const rakutenAff = buildRakutenHgcSearchAffiliateUrl(keyword);
  const amazonHref =
    amazonAff ??
    `https://www.amazon.co.jp/s?k=${encodeURIComponent(kw)}`;
  const rakutenHref =
    rakutenAff ??
    `https://search.rakuten.co.jp/search/mall?sitem=${encodeURIComponent(kw.slice(0, 120))}`;
  return {
    keyword,
    amazonHref,
    rakutenHref,
    amazonAffiliate: !!amazonAff,
    rakutenAffiliate: !!rakutenAff,
  };
}
