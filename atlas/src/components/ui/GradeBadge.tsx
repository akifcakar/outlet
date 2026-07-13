import { gradeExplainer } from "@/lib/vocab";

// 04.2 — monochrome, typographic, same size everywhere.
// Never color-coded by severity (03: Grade C is honest information).
export function GradeBadge({ grade }: { grade: string }) {
  return (
    <span
      className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-sm border border-line-strong bg-surface px-1 text-xs font-semibold text-ink"
      aria-label={`Atlas Grade ${grade} — ${gradeExplainer(grade)}`}
      title={gradeExplainer(grade)}
    >
      {grade}
    </span>
  );
}
