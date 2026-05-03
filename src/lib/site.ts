const DEFAULT_SITE_URL = 'https://100yen-diy.vercel.app';

function normalizeSiteUrl(raw: string | undefined): string {
  const t = raw?.trim();
  if (!t) return DEFAULT_SITE_URL;
  let url = t.replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return DEFAULT_SITE_URL;
    }
    return `${u.origin}`;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

/**
 * Canonical origin for OG / canonical URLs。
 * Vercel では `VERCEL_URL` が自動注入されるため、`NEXT_PUBLIC_SITE_URL` 未設定でも壊れにくくする。
 */
export const siteUrl = (() => {
  if (process.env.NEXT_PUBLIC_SITE_URL?.trim()) {
    return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  }
  if (process.env.VERCEL_URL?.trim()) {
    return normalizeSiteUrl(process.env.VERCEL_URL);
  }
  return DEFAULT_SITE_URL;
})();

export function absoluteUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${siteUrl}${p}`;
}
