import { resolveRakutenAffiliateBanner } from '@/lib/rakuten-affiliate';

/**
 * 楽天アフィリエイトのバナー（または CTA）。
 * RAKUTEN_AFFILIATE_ID があれば楽天市場トップへの HGC リンクを自動生成。
 * 画像は RAKUTEN_AFFILIATE_BANNER_IMAGE（楽天管理画面で発行したバナー URL）があれば表示。
 */
export function RakutenAffiliateBanner() {
  const cfg = resolveRakutenAffiliateBanner();

  return (
    <aside className="rakuten-affiliate-banner" aria-label="楽天市場へのリンク">
      <a
        href={cfg.href}
        target="_blank"
        rel={cfg.isAffiliate ? 'noopener noreferrer sponsored' : 'noopener noreferrer'}
        className="rakuten-affiliate-banner__link"
      >
        {cfg.imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- 外部バナー URL は任意ドメインのため img を使用
          <img
            src={cfg.imageSrc}
            alt={cfg.alt}
            className="rakuten-affiliate-banner__img"
            loading="lazy"
          />
        ) : (
          <span className="rakuten-affiliate-banner__cta">{cfg.alt}</span>
        )}
      </a>
      <p className="rakuten-affiliate-banner__pr">
        {cfg.isAffiliate
          ? 'PR · 楽天アフィリエイト'
          : '※ アフィリエイト未設定（通常リンク・報酬なし）。RAKUTEN_AFFILIATE_ID を本番 env に設定すると PR リンクになります。'}
      </p>
    </aside>
  );
}
