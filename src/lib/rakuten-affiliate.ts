/**
 * 楽天アフィリエイト（HGC）リンクの組み立てとサイト用バナー設定の解決。
 * Python tools の build_rakuten_hgc_search_url と同系統の hb.afl 形式。
 */

/** 楽天管理画面のバナー URL が無いときのサイト内デフォルト（グラフィック常時表示用） */
export const DEFAULT_RAKUTEN_AFFILIATE_BANNER_IMAGE = '/rakuten-affiliate-default.svg';

export function buildRakutenHgcIchibaTopUrl(affiliateId: string): string {
  const id = affiliateId.trim();
  if (!id) return '';
  const pcDest = 'https://www.rakuten.co.jp/';
  const mDest = 'http://m.rakuten.co.jp/';
  const base = `https://hb.afl.rakuten.co.jp/hgc/${id}/`;
  return `${base}?pc=${encodeURIComponent(pcDest)}&m=${encodeURIComponent(mDest)}`;
}

export type RakutenAffiliateBannerConfig = {
  href: string;
  imageSrc: string;
  alt: string;
  /** false のときは楽天トップへの通常リンク（報酬なし） */
  isAffiliate: boolean;
};

/**
 * アフィリエイト設定があれば HGC、無ければ楽天トップへの通常リンク（バナー枠は常に出す）。
 */
export function resolveRakutenAffiliateBanner(): RakutenAffiliateBannerConfig {
  const id = process.env.RAKUTEN_AFFILIATE_ID?.trim();
  const linkOverride = process.env.RAKUTEN_AFFILIATE_BANNER_LINK?.trim();
  const envImage = process.env.RAKUTEN_AFFILIATE_BANNER_IMAGE?.trim();
  const imageSrc = envImage || DEFAULT_RAKUTEN_AFFILIATE_BANNER_IMAGE;
  const hrefAffiliate = linkOverride || (id ? buildRakutenHgcIchibaTopUrl(id) : '');
  if (hrefAffiliate) {
    return {
      href: hrefAffiliate,
      imageSrc,
      alt: process.env.RAKUTEN_AFFILIATE_BANNER_ALT?.trim() || '楽天市場（アフィリエイト）',
      isAffiliate: true,
    };
  }
  return {
    href: 'https://www.rakuten.co.jp/',
    imageSrc,
    alt: '楽天市場で探す',
    isAffiliate: false,
  };
}
