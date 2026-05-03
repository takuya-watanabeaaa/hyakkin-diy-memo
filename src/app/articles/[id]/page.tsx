// src/app/articles/[id]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { articles } from '@/data/articles';
import { itemCategories, roomCategories } from '@/data/categories';
import { ArticleRelatedRakutenBanner } from '@/components/ArticleRelatedRakutenBanner';
import { ArticleYoutubePremiumAffiliate } from '@/components/ArticleYoutubePremiumAffiliate';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import { absoluteUrl } from '@/lib/site';

export async function generateStaticParams() {
  return articles.map((article) => ({
    id: article.id,
  }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const article = articles.find(a => a.id === id);
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
  const article = articles.find(a => a.id === resolvedParams.id);

  if (!article) {
    return <div className="container" style={{padding: '100px'}}><h2>記事が見つかりませんでした</h2></div>;
  }

  const jsonLd = {
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
    supply: article.ingredients.map(i => ({
      '@type': 'HowToSupply',
      name: `${i.name}（${i.price}）`,
    })),
    step: article.steps.map(s => ({
      '@type': 'HowToStep',
      position: s.num,
      name: s.title,
      text: s.detail,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container article-container">
        {/* パンくずリスト */}
        <nav aria-label="パンくずリスト" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
          <Link href="/">ホーム</Link>
          <span style={{ margin: '0 6px' }}>›</span>
          <span>{article.title}</span>
        </nav>

        <div className="article-header">
          <Link href="/" className="back-link">← ホームに戻る</Link>
          <div style={{marginBottom: 8, display:'flex', gap:'6px', flexWrap: 'wrap'}}>
            {article.is_100yen_only ? (
              <span className="tag" style={{ background: '#e0f2f1', color: '#00796b' }}>🔰100均のみ</span>
            ) : (
              <span className="tag" style={{ background: '#fff3e0', color: '#e65100' }}>🛠️併用DIY</span>
            )}
            <span className="tag tag-item">{itemCategories.find(c => c.id === article.item_category)?.emoji} {itemCategories.find(c => c.id === article.item_category)?.label}</span>
            <span className="tag tag-room">{roomCategories.find(c => c.id === article.room_category)?.emoji} {roomCategories.find(c => c.id === article.room_category)?.label}</span>
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
              <span className="meta-value"><del>{article.price_original}</del></span>
            </div>
          </div>
        </div>

        <img src={article.hero_image} alt={article.title} className="article-hero-image" width={1280} height={720} />

        <ArticleRelatedRakutenBanner article={article} />

        <div className="article-content">
          
          {article.youtube_id && (
            <section className="embed-section" style={{marginBottom: '40px'}}>
              <h2>動画</h2>
              <p style={{color: 'var(--text-muted)'}}>実際の手つきや細かいコツは動画のほうが伝わりやすいことが多いので、つくる前に一度流し見しておくと安心です。</p>
              <YouTubeEmbed youtubeId={article.youtube_id} />
              <ArticleYoutubePremiumAffiliate article={article} />
            </section>
          )}

          <section className="ingredients-section">
            <h2>使うものの例</h2>
            <ul className="ingredients-list">
              {article.ingredients.map((item, i) => (
                <li key={i}>
                  <span className="ingredient-name">{item.name}</span>
                  <span className="ingredient-price">{item.price}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="steps-section">
            <h2>つくり方（流れ）</h2>
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

          <section style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border-color)' }}>
            <h2>近いアイテム系のほかの記事</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
              {articles
                .filter(a => a.item_category === article.item_category && a.id !== article.id)
                .slice(0, 4)
                .map(related => (
                  <Link
                    key={related.id}
                    href={`/articles/${related.id}`}
                    style={{
                      padding: '10px 16px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: 'var(--text-color)',
                      fontSize: '0.85rem',
                      flex: '1 1 200px',
                    }}
                  >
                    {related.title}
                  </Link>
                ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
