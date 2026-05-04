import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { articles } from '@/data/articles';
import { itemCategories, roomCategories } from '@/data/categories';
import { ArticleCardList } from '@/components/ArticleCardList';
import { breadcrumbJsonLd, itemListJsonLd } from '@/lib/jsonld';
import { absoluteUrl } from '@/lib/site';

type Props = { params: Promise<{ item: string }> };

const ITEM_PAGES = itemCategories.filter((c) => c.id !== 'all');

export async function generateStaticParams() {
  return ITEM_PAGES.map((c) => ({ item: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { item } = await params;
  const cat = ITEM_PAGES.find((c) => c.id === item);
  if (!cat) return { title: 'カテゴリが見つかりません' };
  const count = articles.filter((a) => a.item_category === item).length;
  return {
    title: `${cat.label}を使った100均DIY ${count}選｜${cat.desc || cat.label}`,
    description: `${cat.label}を使ったダイソー・セリアの100均DIYアイデアを${count}件まとめました。${cat.desc || ''}材料費の目安・つくる時間・手順つきで初心者にもわかりやすく紹介しています。`,
    alternates: { canonical: `/category/${item}` },
    openGraph: {
      title: `${cat.label}を使った100均DIY ${count}選`,
      description: `${cat.label}でできる100均DIYまとめ。${cat.desc || ''}`,
      url: absoluteUrl(`/category/${item}`),
      type: 'website',
    },
  };
}

export default async function ItemCategoryPage({ params }: Props) {
  const { item } = await params;
  const cat = ITEM_PAGES.find((c) => c.id === item);
  if (!cat) notFound();

  const matched = articles.filter((a) => a.item_category === item);
  const breadcrumb = breadcrumbJsonLd([
    { name: 'ホーム', href: '/' },
    { name: cat.label, href: `/category/${cat.id}` },
  ]);
  const list = itemListJsonLd(
    matched,
    (id) => `/articles/${id}`,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(list) }}
      />

      <div className="container">
        <nav aria-label="パンくずリスト" className="breadcrumb">
          <Link href="/">ホーム</Link>
          <span aria-hidden> › </span>
          <span>{cat.label}</span>
        </nav>

        <header className="cat-header">
          <p className="cat-eyebrow">アイテム別 100均DIY</p>
          <h1 className="cat-title">
            {cat.emoji} {cat.label}を使ったDIY {matched.length}選
          </h1>
          {cat.desc ? <p className="cat-desc">{cat.desc}</p> : null}
        </header>

        {/* 場所カテゴリへの横展開リンク */}
        <section className="cross-cat" aria-label="場所から探す">
          <p className="filter-label">🏠 場所・目的から探す</p>
          <div className="cross-cat-chips">
            {roomCategories
              .filter((c) => c.id !== 'all')
              .map((r) => (
                <Link key={r.id} href={`/category/room/${r.id}`} className="cross-cat-chip">
                  {r.emoji} {r.label}
                </Link>
              ))}
          </div>
        </section>

        <ArticleCardList articles={matched} />

        <p className="cat-back">
          <Link href="/">← トップに戻る</Link>
        </p>
      </div>
    </>
  );
}
