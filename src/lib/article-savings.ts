import type { Article } from '@/data/articles';

/** 「約5,000円〜」「330円」などから円の数値を抽出（最小・最大） */
export function parseYenRange(text: string): { min: number; max: number } | null {
  const normalized = text.replace(/,/g, '');
  const matches = [...normalized.matchAll(/(\d+)\s*円/g)].map((m) => Number(m[1]));
  if (matches.length === 0) return null;
  const min = Math.min(...matches);
  const max = Math.max(...matches);
  return { min, max };
}

/** 既製品目安 − DIY 目安 の節約幅（ざっくり・表示用） */
export function estimatedSavingsYen(article: Article): number | null {
  const orig = parseYenRange(article.price_original);
  const diy = parseYenRange(article.price_diy);
  if (!orig || !diy) return null;
  const saving = orig.min - diy.max;
  return saving > 0 ? saving : null;
}

export function formatYen(amount: number): string {
  return `${amount.toLocaleString('ja-JP')}円`;
}

/** 節約額が大きい順に並べ替え（同額は100均のみ優先） */
export function sortArticlesBySavings(list: Article[]): Article[] {
  return [...list].sort((a, b) => {
    const sa = estimatedSavingsYen(a) ?? 0;
    const sb = estimatedSavingsYen(b) ?? 0;
    if (sb !== sa) return sb - sa;
    if (a.is_100yen_only && !b.is_100yen_only) return -1;
    if (!a.is_100yen_only && b.is_100yen_only) return 1;
    return 0;
  });
}
