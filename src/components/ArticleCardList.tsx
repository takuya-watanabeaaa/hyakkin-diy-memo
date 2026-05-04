import Link from 'next/link';
import type { Article } from '@/data/articles';
import { itemCategories, roomCategories } from '@/data/categories';

type Props = {
  articles: Article[];
  /** 上位 N 件は eager / 残りは lazy */
  eagerCount?: number;
};

/**
 * カテゴリページ・関連記事などで再利用するカード一覧。
 * サーバーコンポーネントとして使える（クライアント JS 不要）。
 */
export function ArticleCardList({ articles, eagerCount = 6 }: Props) {
  if (articles.length === 0) {
    return (
      <p className="empty-text">該当する記事はまだありません。</p>
    );
  }
  return (
    <div className="grid">
      {articles.map((article, idx) => {
        const item = itemCategories.find((c) => c.id === article.item_category);
        const room = roomCategories.find((c) => c.id === article.room_category);
        return (
          <article key={article.id} className="card">
            <Link href={`/articles/${article.id}`} className="card-image-link">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.hero_image}
                alt={article.title}
                className="card-image"
                width={1280}
                height={720}
                loading={idx < eagerCount ? 'eager' : 'lazy'}
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
  );
}
