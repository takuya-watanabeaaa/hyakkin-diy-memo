'use client';

import Link from 'next/link';
import { useState } from 'react';
import { articles } from '@/data/articles';
import { itemCategories, roomCategories } from '@/data/categories';

export default function Home() {
  const [activeItem, setActiveItem] = useState('all');
  const [activeRoom, setActiveRoom] = useState('all');

  const filtered = articles.filter(a => {
    const itemMatch = activeItem === 'all' || a.item_category === activeItem;
    const roomMatch = activeRoom === 'all' || a.room_category === activeRoom;
    return itemMatch && roomMatch;
  });

  return (
    <div className="container">
      <section className="hero">
        <div className="hero-box">
          <h1>100均高見えDIY</h1>
          <p>100円ショップのアイテムだけで、普通に買うと高いインテリアを「高見え」DIY。<br/>ちょっとの工夫で、洗練された空間へ。</p>
        </div>
      </section>

      {/* ── 商品で探す ── */}
      <section className="filter-section">
        <p className="filter-label">🛒 商品で探す</p>
        <div className="filter-tabs">
          {itemCategories.map(cat => (
            <button
              key={cat.id}
              className={`filter-tab ${activeItem === cat.id ? 'active' : ''}`}
              onClick={() => setActiveItem(cat.id)}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── 目的で探す ── */}
      <section className="filter-section">
        <p className="filter-label">🏠 場所・目的で探す</p>
        <div className="filter-tabs">
          {roomCategories.map(cat => (
            <button
              key={cat.id}
              className={`filter-tab ${activeRoom === cat.id ? 'active' : ''}`}
              onClick={() => setActiveRoom(cat.id)}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── 記事グリッド ── */}
      <section>
        <h2 className="section-title">
          {filtered.length > 0 ? `${filtered.length}件のDIYアイデア` : '該当する記事が見つかりません'}
        </h2>
        <div className="grid">
          {filtered.map((article) => (
            <article key={article.id} className="card">
              <img src={article.hero_image} alt={article.title} className="card-image" />
              <div className="card-content">
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  {article.is_100yen_only ? (
                    <span className="tag" style={{ background: '#e0f2f1', color: '#00796b' }}>🔰100均のみ</span>
                  ) : (
                    <span className="tag" style={{ background: '#fff3e0', color: '#e65100' }}>🛠️併用DIY</span>
                  )}
                  <span className="tag tag-item">{itemCategories.find(c => c.id === article.item_category)?.emoji} {itemCategories.find(c => c.id === article.item_category)?.label}</span>
                  <span className="tag tag-room">{roomCategories.find(c => c.id === article.room_category)?.emoji} {roomCategories.find(c => c.id === article.room_category)?.label}</span>
                </div>
                <h3 className="card-title">{article.title}</h3>
                <p className="card-desc">{article.desc}</p>
                <div className="card-footer">
                  <div>
                    <del style={{ fontSize: '0.8rem', color: '#999' }}>通常: {article.price_original}</del>
                    <br />
                    <strong style={{ color: 'var(--accent-color)', fontSize: '1rem' }}>DIY: {article.price_diy}</strong>
                  </div>
                  <Link href={`/articles/${article.id}`} className="btn" style={{ padding: '8px 16px' }}>作り方を見る</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
