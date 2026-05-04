import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { articles } from '@/data/articles';
import { itemCategories, roomCategories } from '@/data/categories';
import { ArticleCardList } from '@/components/ArticleCardList';
import { breadcrumbJsonLd, itemListJsonLd } from '@/lib/jsonld';
import { absoluteUrl } from '@/lib/site';

type Props = { params: Promise<{ room: string }> };

const ROOM_PAGES = roomCategories.filter((c) => c.id !== 'all');

export async function generateStaticParams() {
  return ROOM_PAGES.map((c) => ({ room: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { room } = await params;
  const cat = ROOM_PAGES.find((c) => c.id === room);
  if (!cat) return { title: 'カテゴリが見つかりません' };
  const count = articles.filter((a) => a.room_category === room).length;
  return {
    title: `${cat.label}の100均DIY ${count}選｜ダイソー・セリアでできる収納・小物`,
    description: `${cat.label}で使える100均DIYアイデアを${count}件まとめました。ダイソー・セリアの材料で安く・賃貸でも試しやすい収納や小物づくりを、材料費・手順・つくる時間つきで紹介しています。`,
    alternates: { canonical: `/category/room/${room}` },
    openGraph: {
      title: `${cat.label}の100均DIY ${count}選`,
      description: `${cat.label}向けの100均DIYまとめ。`,
      url: absoluteUrl(`/category/room/${room}`),
      type: 'website',
    },
  };
}

export default async function RoomCategoryPage({ params }: Props) {
  const { room } = await params;
  const cat = ROOM_PAGES.find((c) => c.id === room);
  if (!cat) notFound();

  const matched = articles.filter((a) => a.room_category === room);
  const breadcrumb = breadcrumbJsonLd([
    { name: 'ホーム', href: '/' },
    { name: `${cat.label}のDIY`, href: `/category/room/${cat.id}` },
  ]);
  const list = itemListJsonLd(matched, (id) => `/articles/${id}`);

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
          <span>{cat.label}のDIY</span>
        </nav>

        <header className="cat-header">
          <p className="cat-eyebrow">場所・目的別 100均DIY</p>
          <h1 className="cat-title">
            {cat.emoji} {cat.label}の100均DIY {matched.length}選
          </h1>
        </header>

        <section className="cross-cat" aria-label="アイテムから探す">
          <p className="filter-label">🛒 アイテムから探す</p>
          <div className="cross-cat-chips">
            {itemCategories
              .filter((c) => c.id !== 'all')
              .map((it) => (
                <Link key={it.id} href={`/category/${it.id}`} className="cross-cat-chip">
                  {it.emoji} {it.label}
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
