'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Article } from '@/data/articles';
import { itemCategories, roomCategories } from '@/data/categories';

type Props = {
  articles: Article[];
};

/**
 * トップの「全DIY記事」カードグリッド + フィルタ。
 * - 1〜6 番目までは loading="eager" / 7 番目以降は lazy。
 * - width/height を入れて CLS を防ぐ。
 */
export function HomeArticleGrid({ articles }: Props) {
  const [activeItem, setActiveItem] = useState('all');
  const [activeRoom, setActiveRoom] = useState('all');
  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return articles.filter((a) => {
      const itemMatch = activeItem === 'all' || a.item_category === activeItem;
      const roomMatch = activeRoom === 'all' || a.room_category === activeRoom;
      const kwMatch =
        kw.length === 0 ||
        a.title.toLowerCase().includes(kw) ||
        a.desc.toLowerCase().includes(kw) ||
        a.ingredients.some((i) => i.name.toLowerCase().includes(kw));
      return itemMatch && roomMatch && kwMatch;
    });
  }, [articles, activeItem, activeRoom, keyword]);

  return (
    <>
      <section className="filter-section">
        <p className="filter-label">🔎 キーワードで探す</p>
        <input
          type="search"
          placeholder="例: すのこ / キャスター / 突っ張り棒"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="filter-search"
          aria-label="記事をキーワードで検索"
        />
      </section>

      <section className="filter-section">
        <p className="filter-label">🛒 商品で探す</p>
        <div className="filter-tabs" role="tablist">
          {itemCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`filter-tab ${activeItem === cat.id ? 'active' : ''}`}
              onClick={() => setActiveItem(cat.id)}
              aria-pressed={activeItem === cat.id}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </section>

      <section className="filter-section">
        <p className="filter-label">🏠 場所・目的で探す</p>
        <div className="filter-tabs" role="tablist">
          {roomCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`filter-tab ${activeRoom === cat.id ? 'active' : ''}`}
              onClick={() => setActiveRoom(cat.id)}
              aria-pressed={activeRoom === cat.id}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">
          {filtered.length > 0 ? `${filtered.length}件のDIYレシピ` : '該当する記事がありません'}
        </h2>
        <div className="grid">
          {filtered.map((article, idx) => {
            const item = itemCategories.find((c) => c.id === article.item_category);
            const room = roomCategories.find((c) => c.id === article.room_category);
            return (
              <article key={article.id} className="card">
                <Link href={`/articles/${article.id}`} className="card-image-link">
                  {/* eslint-disable-next-line @next/next/no-img-element -- YouTube サムネ外部URL */}
                  <img
                    src={article.hero_image}
                    alt={article.title}
                    className="card-image"
                    width={1280}
                    height={720}
                    loading={idx < 6 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                </Link>
                <div className="card-content">
                  <div className="card-tag-row">
                    {article.is_100yen_only ? (
                      <span className="tag tag-only">🔰100均のみ</span>
                    ) : (
                      <span className="tag tag-mix">🛠️併用DIY</span>
                    )}
                    {item ? (
                      <span className="tag tag-item">
                        {item.emoji} {item.label}
                      </span>
                    ) : null}
                    {room ? (
                      <span className="tag tag-room">
                        {room.emoji} {room.label}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="card-title">
                    <Link href={`/articles/${article.id}`}>{article.title}</Link>
                  </h3>
                  <p className="card-desc">{article.desc}</p>
                  <div className="card-footer">
                    <div className="card-price">
                      <del className="card-price-original">通常: {article.price_original}</del>
                      <strong className="card-price-diy">DIY: {article.price_diy}</strong>
                    </div>
                    <Link href={`/articles/${article.id}`} className="btn btn-sm">
                      作り方を見る
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
