const DEFAULT_SITE_URL = 'https://100yen-diy.vercel.app';

function normalizeSiteUrl(raw: string | undefined): string {
  const t = raw?.trim();
  if (!t) return DEFAULT_SITE_URL;
  return t.replace(/\/+$/, '');
}

/** Canonical origin for OG / canonical URLs (`NEXT_PUBLIC_SITE_URL` or deploy default). */
export const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export function absoluteUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${siteUrl}${p}`;
}
