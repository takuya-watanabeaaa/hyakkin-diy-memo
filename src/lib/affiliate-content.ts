import fs from 'fs';
import path from 'path';

export type AffiliateManifestEntry = {
  slug: string;
  title: string;
  sourceUrl: string;
  sourceKind: string;
  createdAt: string;
  description: string;
};

export function getAffiliateDir(): string {
  return path.join(process.cwd(), 'content', 'affiliate');
}

export function readAffiliateManifest(): AffiliateManifestEntry[] {
  const fp = path.join(getAffiliateDir(), 'manifest.json');
  if (!fs.existsSync(fp)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(fp, 'utf-8')) as unknown;
    return Array.isArray(data) ? (data as AffiliateManifestEntry[]) : [];
  } catch {
    return [];
  }
}

/** パストラバーサル対策込みで Markdown を読む */
export function readAffiliateMarkdown(slug: string): string | null {
  const safe = slug.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!safe || safe !== slug) return null;
  const dir = getAffiliateDir();
  const fp = path.join(dir, `${safe}.md`);
  const rel = path.relative(dir, fp);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  if (!fs.existsSync(fp)) return null;
  return fs.readFileSync(fp, 'utf-8');
}

export function getManifestEntry(slug: string): AffiliateManifestEntry | undefined {
  const safe = slug.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!safe || safe !== slug) return undefined;
  return readAffiliateManifest().find((e) => e.slug === safe);
}

/** Python 生成記事の YAML フロントマターを表示用に除去する */
export function stripYamlFrontmatter(md: string): string {
  const m = md.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return m ? md.slice(m[0].length) : md;
}
