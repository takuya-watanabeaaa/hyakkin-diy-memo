import type { MetadataRoute } from 'next';
import { articles } from '@/data/articles';
import { itemCategories, roomCategories } from '@/data/categories';
import { readAffiliateManifest } from '@/lib/affiliate-content';
import { siteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl;
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/disclosure`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/affiliate`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
  ];

  const itemCats: MetadataRoute.Sitemap = itemCategories
    .filter((c) => c.id !== 'all')
    .map((c) => ({
      url: `${base}/category/${c.id}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  const roomCats: MetadataRoute.Sitemap = roomCategories
    .filter((c) => c.id !== 'all')
    .map((c) => ({
      url: `${base}/category/room/${c.id}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/articles/${a.id}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  const affiliatePages: MetadataRoute.Sitemap = readAffiliateManifest().map((e) => ({
    url: `${base}/affiliate/${e.slug}`,
    lastModified: new Date(e.createdAt),
    changeFrequency: 'monthly',
    priority: 0.55,
  }));

  return [...staticPages, ...itemCats, ...roomCats, ...articlePages, ...affiliatePages];
}
