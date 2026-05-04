import type { Metadata } from 'next';
import Link from 'next/link';
import { articles, type Article } from '@/data/articles';
import { itemCategories, roomCategories } from '@/data/categories';
import { ArticleRelatedRakutenBanner } from '@/components/ArticleRelatedRakutenBanner';
import { ArticleYoutubePremiumAffiliate } from '@/components/ArticleYoutubePremiumAffiliate';
import { IngredientsAffiliateList } from '@/components/IngredientsAffiliateList';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import { absoluteUrl } from '@/lib/site';
import { articleJsonLd, breadcrumbJsonLd, howtoJsonLd } from '@/lib/jsonld';

export async function generateStaticParams() {
  return articles.map((article) => ({ id: article.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params;
  const article = articles.find((a) => a.id === id);
  if (!article) return { title: '記事が見つかりません' };

  return {
    title: article.title,
    description: article.desc,
    openGraph: {
      title: article.title,
      description: article.desc,
      url: absoluteUrl(`/articles/${article.id}`),
      siteName: '100均DIYメモ',
      images: [{ url: article.hero_image, width: 1280, height: 720, alt: article.title }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.desc,
      images: [article.hero_image],
    },
    alternates: {
      canonical: absoluteUrl(`/articles/${article.id}`),
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const article = articles.find((a) => a.id === resolvedParams.id);

  if (!article) {
    return (
      <div className="container" style={{ padding: '100px' }}>
        <h2>記事が見つかりませんでした</h2>
      </div>
    );
  }

  const itemCat = itemCategories.find((c) => c.id === article.item_category);
  const roomCat = roomCategories.find((c) => c.id === article.room_category);

  // 関連記事: item / room の両方一致 > item一致 > room一致 の優先で重複排除
  const sameItemAndRoom = articles.filter(
    (a) =>
      a.id !== article.id &&
      a.item_category === article.item_category &&
      a.room_category === article.room_category,
  );
  const sameItem = articles.filter(
    (a) => a.id !== article.id && a.item_category === article.item_category,
  );
  const sameRoom = articles.filter(
    (a) => a.id !== article.id && a.room_category === article.room_category,
  );
  const seen = new Set<string>();
  const related: typeof articles = [];
  for (const list of [sameItemAndRoom, sameItem, sameRoom]) {
    for (const a of list) {
      if (related.length >= 6) break;
      if (seen.has(a.id)) continue;
      seen.add(a.id);
      related.push(a);
    }
    if (related.length >= 6) break;
  }

  const breadcrumbItems = [
    { name: 'ホーム', href: '/' },
    ...(itemCat ? [{ name: itemCat.label, href: `/category/${itemCat.id}` }] : []),
    { name: article.title, href: `/articles/${article.id}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(article)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howtoJsonLd(article)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbItems)) }}
      />

      <div className="container article-container">
        <nav aria-label="パンくずリスト" className="breadcrumb">
          <Link href="/">ホーム</Link>
          <span aria-hidden> › </span>
          {itemCat ? (
            <>
              <Link href={`/category/${itemCat.id}`}>{itemCat.label}</Link>
              <span aria-hidden> › </span>
            </>
          ) : null}
          <span>{article.title}</span>
        </nav>

        <p className="article-disclosure">
          ※ 当記事には <Link href="/disclosure">アフィリエイト広告</Link>{' '}
          が含まれます。商品リンクは楽天市場・Amazon の検索結果へのリンクです。
        </p>

        <div className="article-header">
          <div className="article-tag-row">
            {article.is_100yen_only ? (
              <span className="tag tag-only">🔰100均のみ</span>
            ) : (
              <span className="tag tag-mix">🛠️併用DIY</span>
            )}
            {itemCat ? (
              <Link href={`/category/${itemCat.id}`} className="tag tag-item">
                {itemCat.emoji} {itemCat.label}
              </Link>
            ) : null}
            {roomCat ? (
              <Link href={`/category/room/${roomCat.id}`} className="tag tag-room">
                {roomCat.emoji} {roomCat.label}
              </Link>
            ) : null}
          </div>
          <h1 className="article-title">{article.title}</h1>
          <p className="article-desc">{article.desc}</p>

          <div className="article-meta">
            <div className="meta-box">
              <span className="meta-label">制作時間</span>
              <span className="meta-value">{article.time_est}</span>
            </div>
            <div className="meta-box highlight">
              <span className="meta-label">DIYコスト</span>
              <span className="meta-value">{article.price_diy}</span>
            </div>
            <div className="meta-box">
              <span className="meta-label">既製品相場</span>
              <span className="meta-value">
                <del>{article.price_original}</del>
              </span>
            </div>
          </div>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.hero_image}
          alt={article.title}
          className="article-hero-image"
          width={1280}
          height={720}
          loading="eager"
          decoding="async"
        />

        {/* 目次 */}
        <nav aria-label="目次" className="article-toc">
          <p className="article-toc-label">この記事の流れ</p>
          <ol>
            {article.youtube_id ? <li><a href="#video">動画でチェック</a></li> : null}
            <li><a href="#materials">使うものの例</a></li>
            <li><a href="#steps">つくり方の流れ</a></li>
            <li><a href="#related-products">関連商品（楽天・Amazon）</a></li>
            {related.length > 0 ? <li><a href="#related-articles">関連DIYレシピ</a></li> : null}
          </ol>
        </nav>

        <ArticleRelatedRakutenBanner article={article} />

        <div className="article-content">
          {article.youtube_id && (
            <section className="embed-section" id="video">
              <h2>動画でチェック</h2>
              <p style={{ color: 'var(--text-muted)' }}>
                実際の手つきや細かいコツは動画のほうが伝わりやすいので、つくる前に一度流し見しておくと安心です。
              </p>
              <YouTubeEmbed youtubeId={article.youtube_id} />
              <ArticleYoutubePremiumAffiliate article={article} />
            </section>
          )}

          <div id="materials">
            <IngredientsAffiliateList article={article} />
          </div>

          <section className="steps-section" id="steps">
            <h2>つくり方の流れ</h2>
            <div className="steps-list">
              {article.steps.map((step) => (
                <div key={step.num} className="step-item">
                  <div className="step-number">{step.num}</div>
                  <div className="step-content">
                    <h3>{step.title}</h3>
                    <div className="step-body">
                      <p>{step.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 末尾 CTA: 楽天 + Amazon の関連検索 */}
          <section id="related-products" className="article-bottom-cta">
            <h2>関連商品をチェック</h2>
            <p className="article-bottom-cta-lead">
              「百均で十分」のものもあれば「もう少し丈夫なものに買い替えたい」ものもあります。  
              下のリンクから、近い用途の商品を <strong>楽天市場</strong>・<strong>Amazon</strong> の検索結果でご覧いただけます。
            </p>
            <ArticleYoutubePremiumAffiliateOrFallback article={article} />
          </section>

          {related.length > 0 ? (
            <section className="related-articles" id="related-articles">
              <h2>関連DIYレシピ</h2>
              <div className="related-grid">
                {related.map((r) => (
                  <Link key={r.id} href={`/articles/${r.id}`} className="related-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.hero_image}
                      alt={r.title}
                      className="related-card-image"
                      width={1280}
                      height={720}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="related-card-body">
                      <span className="related-card-meta">DIY {r.price_diy}・{r.time_est}</span>
                      <span className="related-card-title">{r.title}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <p className="article-back">
            <Link href="/">← トップに戻る</Link>
            {itemCat ? (
              <>
                {' '}・{' '}
                <Link href={`/category/${itemCat.id}`}>{itemCat.label}の一覧</Link>
              </>
            ) : null}
          </p>
        </div>
      </div>
    </>
  );
}

/** YouTubeあり/なし両対応で末尾CTAを出す（YouTubeなしのときも検索リンクは表示する） */
function ArticleYoutubePremiumAffiliateOrFallback({ article }: { article: Article }) {
  // ArticleYoutubePremiumAffiliate は YouTube 必須なので、無い記事用に簡易版を出す
  if (article.youtube_id) {
    return <ArticleYoutubePremiumAffiliate article={article} />;
  }
  return <ArticleRelatedRakutenBanner article={article} />;
}
