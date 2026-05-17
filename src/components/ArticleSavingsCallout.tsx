import type { Article } from '@/data/articles';
import { estimatedSavingsYen, formatYen } from '@/lib/article-savings';

type Props = { article: Article };

export function ArticleSavingsCallout({ article }: Props) {
  const saving = estimatedSavingsYen(article);

  return (
    <div className="savings-callout" role="note">
      <p className="savings-callout__title">このDIYの目安</p>
      <div className="savings-callout__grid">
        <Stat label="つくる時間" value={article.time_est} />
        <Stat label="材料費の目安" value={article.price_diy} highlight />
        <Stat label="市販の目安" value={article.price_original} muted />
      </div>
      {saving ? (
        <p className="savings-callout__badge">
          市販品より <strong>約{formatYen(saving)}</strong> 安く試せる計算です（材料・サイズにより異なります）
        </p>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
  muted,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`savings-callout__stat${highlight ? ' savings-callout__stat--hi' : ''}${muted ? ' savings-callout__stat--muted' : ''}`}
    >
      <span className="savings-callout__label">{label}</span>
      <span className="savings-callout__value">{value}</span>
    </div>
  );
}
