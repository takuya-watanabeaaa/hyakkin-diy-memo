import type { Article } from '@/data/articles';
import { itemCategories, roomCategories } from '@/data/categories';
import { absoluteUrl, siteInfo, siteUrl } from '@/lib/site';

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.href),
    })),
  };
}

export function articleJsonLd(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.desc,
    image: [article.hero_image],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(`/articles/${article.id}`),
    },
    inLanguage: siteInfo.language,
    author: { '@type': 'Organization', name: siteInfo.name, url: siteUrl },
    publisher: { '@type': 'Organization', name: siteInfo.name, url: siteUrl },
  };
}

export function howtoJsonLd(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: article.title,
    description: article.desc,
    image: article.hero_image,
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'JPY',
      value: article.price_diy,
    },
    totalTime: article.time_est,
    supply: article.ingredients.map((i) => ({
      '@type': 'HowToSupply',
      name: `${i.name}（${i.price}）`,
    })),
    step: article.steps.map((s) => ({
      '@type': 'HowToStep',
      position: s.num,
      name: s.title,
      text: s.detail,
    })),
  };
}

export function itemListJsonLd(
  list: { id: string; title: string }[],
  pathBuilder: (id: string) => string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: list.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(pathBuilder(a.id)),
      name: a.title,
    })),
  };
}

export function categoryLabel(kind: 'item' | 'room', id: string): string {
  const all = kind === 'item' ? itemCategories : roomCategories;
  return all.find((c) => c.id === id)?.label ?? id;
}
