import { resolveRakutenAffiliateBanner } from '@/lib/rakuten-affiliate';
import { RakutenAffiliateBannerThumb } from '@/components/RakutenAffiliateBannerThumb';

/**
 * サイト共通: 横長の「楽天市場」バナー。
 * RAKUTEN_AFFILIATE_BANNER_IMAGE は任意（左に小さく表示。読み込み失敗時はテキストのみ）。
 */
export function RakutenAffiliateBanner() {
  const cfg = resolveRakutenAffiliateBanner();

  return (
    <aside className="rakuten-affiliate-banner" aria-label="楽天市場へのリンク">
      <a
        href={cfg.href}
        target="_blank"
        rel={cfg.isAffiliate ? 'noopener noreferrer sponsored' : 'noopener noreferrer'}
        className="rakuten-affiliate-banner__bar"
      >
        {cfg.imageSrc ? (
          <RakutenAffiliateBannerThumb src={cfg.imageSrc} alt="" />
        ) : null}
        <span className="rakuten-affiliate-banner__bar-text">
          <span className="rakuten-affiliate-banner__brand">楽天市場</span>
          <span className="rakuten-affiliate-banner__tagline">
            {cfg.isAffiliate ? 'お買い物・検索はこちら（PR）' : 'お買い物・検索はこちら'}
          </span>
        </span>
        <span className="rakuten-affiliate-banner__chevron" aria-hidden>
          →
        </span>
      </a>
      <p className="rakuten-affiliate-banner__pr">
        {cfg.isAffiliate
          ? 'PR · 楽天アフィリエイト'
          : '※ アフィリエイト未設定（通常リンク）。RAKUTEN_AFFILIATE_ID で PR リンクになります。'}
      </p>
    </aside>
  );
}
