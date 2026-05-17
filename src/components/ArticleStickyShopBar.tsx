'use client';

import { useEffect, useState } from 'react';
import { AffiliateTrackedLink } from '@/components/AffiliateTrackedLink';

type Props = {
  articleId: string;
  href: string;
  isAffiliate: boolean;
};

/** 記事を読み進めたあと、材料購入へ誘導するモバイル向け固定バー */
export function ArticleStickyShopBar({ articleId, href, isAffiliate }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="sticky-shop-bar" role="complementary" aria-label="材料を探す">
      <AffiliateTrackedLink
        href={href}
        rel={isAffiliate ? 'noopener noreferrer sponsored' : 'noopener noreferrer'}
        className="sticky-shop-bar__btn"
        placement="article_related_main"
        articleId={articleId}
      >
        <span className="sticky-shop-bar__main">このDIYの材料を楽天で探す</span>
        <span className="sticky-shop-bar__sub">PR · 検索結果へ</span>
      </AffiliateTrackedLink>
    </div>
  );
}
