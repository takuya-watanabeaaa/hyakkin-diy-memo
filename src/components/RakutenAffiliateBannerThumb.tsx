'use client';

import { useState } from 'react';

type Props = {
  src: string;
  alt: string;
};

/**
 * 楽天管理画面のバナー画像 URL は環境によっては表示に失敗することがあるため、
 * onError で落としてテキストバナーのみにフォールバックする。
 */
export function RakutenAffiliateBannerThumb({ src, alt }: Props) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- 外部アフィバナー URL
    <img
      src={src}
      alt={alt}
      className="rakuten-affiliate-banner__thumb"
      loading="lazy"
      decoding="async"
      onError={() => setVisible(false)}
    />
  );
}
