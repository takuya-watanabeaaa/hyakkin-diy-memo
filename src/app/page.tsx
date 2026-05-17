import type { Metadata } from 'next';
import Link from 'next/link';
import { articles } from '@/data/articles';
import { itemCategories, roomCategories } from '@/data/categories';
import { HomeArticleGrid } from '@/components/HomeArticleGrid';
import { estimatedSavingsYen, formatYen, sortArticlesBySavings } from '@/lib/article-savings';
import { absoluteUrl, siteInfo, siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: '100均DIYメモ｜ダイソー・セリアでできる収納・小物づくり',
  description:
    'ダイソー・セリアの材料を使ったキャスター付き収納・壁面収納・隙間活用などのDIYレシピを、材料費の目安・つくる時間・手順つきでまとめています。',
  alternates: {
    canonical: '/',
  },
};

const ROOM_PAGES = roomCategories.filter((c) => c.id !== 'all');
const ITEM_PAGES = itemCategories.filter((c) => c.id !== 'all');

export default function HomePage() {
  const total = articles.length;

  // 人気カテゴリ枠（記事数が多いものから）
  const itemSummary = ITEM_PAGES.map((c) => ({
    ...c,
    count: articles.filter((a) => a.item_category === c.id).length,
  }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const featured = sortArticlesBySavings(articles).slice(0, 3);
  const topSavings = estimatedSavingsYen(featured[0]);

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteInfo.name,
    description: siteInfo.description,
    url: siteUrl,
    inLanguage: siteInfo.language,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteInfo.name,
    url: siteUrl,
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: featured.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(`/articles/${a.id}`),
      name: a.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div className="container">
        <section className="hero">
          <div className="hero-box">
            <p className="hero-eyebrow">100円ショップ × 収納・インテリアDIY</p>
            <h1>家にあるもので、暮らしを少しよくする。</h1>
            <p>
              ダイソーやセリアで買える <strong>すのこ・ワイヤーネット・キャスター・マグネット</strong>{' '}
              を組み合わせて作る、<strong>{total}本以上</strong>のDIYレシピ集です。
              {topSavings ? (
                <>
                  <br />
                  人気記事では市販品より <strong>約{formatYen(topSavings)}</strong> 安く試せる例もあります。
                </>
              ) : null}
            </p>
            <div className="hero-actions">
              <a href="#articles" className="btn">レシピを探す</a>
              <Link href="/category/caster" className="btn btn-ghost">人気: キャスター</Link>
            </div>
          </div>
        </section>

        <section className="home-trust" aria-label="このサイトでわかること">
          <ul className="home-trust-list">
            <li><strong>材料費の目安</strong>（百均中心）</li>
            <li><strong>つくる時間</strong>の目安</li>
            <li><strong>市販品との差額</strong>がわかる比較</li>
            <li>足りない材料は<strong>楽天検索</strong>でまとめて探せる（PR）</li>
          </ul>
        </section>

        {/* ── 人気カテゴリ ── */}
        <section className="home-section" aria-labelledby="cat-heading">
          <h2 id="cat-heading" className="section-title">アイテムから探す</h2>
          <div className="cat-card-grid">
            {itemSummary.map((cat) => (
              <Link key={cat.id} href={`/category/${cat.id}`} className="cat-card">
                <span className="cat-card-emoji" aria-hidden>
                  {cat.emoji}
                </span>
                <span className="cat-card-label">{cat.label}</span>
                <span className="cat-card-desc">{cat.desc}</span>
                <span className="cat-card-count">{cat.count}件</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 最新ピックアップ ── */}
        <section className="home-section" aria-labelledby="pick-heading">
          <h2 id="pick-heading" className="section-title">いちばんおトクに試せるDIY</h2>
          <p className="section-lead">市販品との差額が大きい順にピックアップしています。</p>
          <div className="pickup-grid">
            {featured.map((a) => {
              const save = estimatedSavingsYen(a);
              return (
              <Link key={a.id} href={`/articles/${a.id}`} className="pickup-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.hero_image}
                  alt={a.title}
                  className="pickup-card-image"
                  width={1280}
                  height={720}
                  loading="eager"
                  decoding="async"
                />
                <div className="pickup-card-body">
                  {save ? (
                    <span className="pickup-card-save">市販より約{formatYen(save)}おトク</span>
                  ) : null}
                  <span className="pickup-card-meta">DIY {a.price_diy}・{a.time_est}</span>
                  <h3 className="pickup-card-title">{a.title}</h3>
                </div>
              </Link>
              );
            })}
          </div>
        </section>

        {/* ── アフィリエイト開示 (ステマ規制対応) ── */}
        <p className="home-disclosure" id="articles">
          ※ 当サイトには <Link href="/disclosure">アフィリエイト広告</Link>{' '}
          が含まれます。商品リンクは楽天市場・Amazon の検索結果へのリンクで、お買い物の参考用です。
        </p>

        <HomeArticleGrid articles={articles} />
      </div>
    </>
  );
}
