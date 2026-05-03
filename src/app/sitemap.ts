import type { MetadataRoute } from 'next';
import { articles } from '@/data/articles';
import { readAffiliateManifest } from '@/lib/affiliate-content';
import { siteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl;

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${base}/affiliate`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
  ];

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/articles/${a.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.75,
  }));

  const affiliatePages: MetadataRoute.Sitemap = readAffiliateManifest().map(
    (e) => ({
      url: `${base}/affiliate/${e.slug}`,
      lastModified: new Date(e.createdAt),
      changeFrequency: 'monthly',
      priority: 0.65,
    }),
  );

  return [...staticPages, ...articlePages, ...affiliatePages];
}
