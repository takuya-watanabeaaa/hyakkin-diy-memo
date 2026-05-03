import type { Metadata } from 'next';
import Link from 'next/link';
import { readAffiliateManifest } from '@/lib/affiliate-content';

export const metadata: Metadata = {
  title: '百均 vs 上位版｜比較記事（アフィリエイト）',
  description:
    '動画・記事から抽出した便利グッズについて、Amazon / 楽天で買える上位互換を主に紹介し、百均は参考として触れた記事です。',
};

export default function AffiliateIndexPage() {
  const entries = readAffiliateManifest();

  return (
    <div className="container affiliate-page">
      <nav aria-label="パンくず" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
        <Link href="/">ホーム</Link>
        <span style={{ margin: '0 6px' }}>›</span>
        <span>比較記事</span>
      </nav>

      <header style={{ marginBottom: '28px' }}>
        <h1 className="article-title" style={{ marginBottom: '12px' }}>
          百均で試すか、上位版を買うか
        </h1>
        <p className="article-desc" style={{ marginBottom: 0 }}>
          YouTube 字幕や Web 記事を解析し、紹介されているグッズごとに「百均の類似」「上位版の狙い目」を並べたメモです。
          記事は Python ツールが <code style={{ fontSize: '0.9em' }}>content/affiliate/</code> に出力しています。
        </p>
      </header>

      <section>
        <h2 className="section-title">{entries.length}件</h2>
        {entries.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>
            まだ記事がありません。<code>npm run affiliate:generate</code> を実行してください。
          </p>
        ) : (
          <ul className="affiliate-list">
            {entries.map((e) => (
              <li key={e.slug}>
                <Link href={`/affiliate/${e.slug}`} className="affiliate-card-link">
                  <span className="affiliate-card-title">{e.title}</span>
                  <span className="affiliate-card-meta">
                    {e.createdAt.slice(0, 10)} · {e.sourceKind}
                  </span>
                  <span className="affiliate-card-desc">{e.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
        <h2 className="section-title">記事の追加（開発者向け）</h2>
        <pre className="affiliate-code-block">
{`# 仮実行（字幕・本文取得のみ）
npm run affiliate:generate -- --url "https://www.youtube.com/watch?v=..." --dry-run

# 本番生成（OPENAI_API_KEY 必須）
npm run affiliate:generate -- --url "https://..."`}
        </pre>
      </section>
    </div>
  );
}
