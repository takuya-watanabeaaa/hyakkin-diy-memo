// src/app/articles/[id]/page.tsx
import Link from 'next/link';
import { articles } from '@/data/articles';
import { itemCategories, roomCategories } from '@/data/categories';
import YouTubeEmbed from '@/components/YouTubeEmbed';

export async function generateStaticParams() {
  return articles.map((article) => ({
    id: article.id,
  }));
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const article = articles.find(a => a.id === resolvedParams.id);

  if (!article) {
    return <div className="container" style={{padding: '100px'}}><h2>記事が見つかりませんでした</h2></div>;
  }

  return (
    <div className="container article-container">
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

      <img src={article.hero_image} alt={article.title} className="article-hero-image" />

      <div className="article-content">
        
        {/* 公式埋め込み等の動画コンテンツがある場合 */}
        {article.youtube_id && (
          <section className="embed-section" style={{marginBottom: '40px'}}>
            <h2>おすすめの参考動画</h2>
            <p style={{color: 'var(--text-muted)'}}>こちらの公式動画のアイデアを参考にしています！大変わかりやすいのでぜひご覧ください。</p>
            <YouTubeEmbed youtubeId={article.youtube_id} />
          </section>
        )}

        <section className="ingredients-section">
          <h2>必要な材料（100均で買うもの）</h2>
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
          <h2>作り方の手順</h2>
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
      </div>
    </div>
  );
}
