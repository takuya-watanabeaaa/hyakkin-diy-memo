'use client';

import { track } from '@vercel/analytics';

type Props = {
  href: string;
  rel: string;
  className?: string;
  title?: string;
  /** Vercel Analytics のカスタムイベントで集計するための区分 */
  placement: 'site_header' | 'article_related_main' | 'article_related_chip';
  /** 記事ページのチップなどで任意 */
  articleId?: string;
  children: React.ReactNode;
};

/**
 * 楽天など外部アフィリエイトへの遷移前に Vercel Web Analytics でクリックを記録する。
 */
export function AffiliateTrackedLink({
  href,
  rel,
  className,
  title,
  placement,
  articleId,
  children,
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel={rel}
      className={className}
      title={title}
      onClick={() => {
        track('affiliate_click', {
          placement,
          ...(articleId ? { articleId } : {}),
        });
      }}
    >
      {children}
    </a>
  );
}
