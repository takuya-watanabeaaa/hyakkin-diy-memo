import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import {
  getManifestEntry,
  readAffiliateManifest,
  readAffiliateMarkdown,
  stripYamlFrontmatter,
} from '@/lib/affiliate-content';
import { absoluteUrl } from '@/lib/site';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return readAffiliateManifest().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getManifestEntry(slug);
  if (!entry) return { title: '記事が見つかりません' };

  return {
    title: entry.title,
    description: entry.description,
    alternates: {
      canonical: absoluteUrl(`/affiliate/${slug}`),
    },
    openGraph: {
      title: entry.title,
      description: entry.description,
      url: absoluteUrl(`/affiliate/${slug}`),
      type: 'article',
    },
  };
}

export default async function AffiliateArticlePage({ params }: Props) {
  const { slug } = await params;
  const md = readAffiliateMarkdown(slug);
  const entry = getManifestEntry(slug);
  if (!md || !entry) notFound();

  const mdBody = stripYamlFrontmatter(md);

  return (
    <div className="container affiliate-page">
      <nav aria-label="パンくず" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
        <Link href="/">ホーム</Link>
        <span style={{ margin: '0 6px' }}>›</span>
        <Link href="/affiliate">比較記事</Link>
        <span style={{ margin: '0 6px' }}>›</span>
        <span>{entry.title}</span>
      </nav>

      <article className="affiliate-prose">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            a: ({ href, children, ...rest }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
                {children}
              </a>
            ),
          }}
        >
          {mdBody}
        </ReactMarkdown>
      </article>

      <p style={{ marginTop: '40px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <Link href="/affiliate">← 一覧へ</Link>
      </p>
    </div>
  );
}
