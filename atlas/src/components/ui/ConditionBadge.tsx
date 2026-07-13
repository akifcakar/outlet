import { conditionLabel } from "@/lib/vocab";

// 04.2 — the story badge. Never colored, never iconified.
export function ConditionBadge({ condition }: { condition: string }) {
  return (
    <span className="inline-flex h-[22px] items-center rounded-sm border border-line bg-subtle px-2 text-xs text-ink-secondary">
      {conditionLabel(condition)}
    </span>
  );
}
