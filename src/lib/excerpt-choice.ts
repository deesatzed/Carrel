import type { Excerpt } from "./packet";

export type PendingAskChoice = {
  question: string;
  excerpts: Excerpt[];
  selectedIds: string[];
};

export function toggleSelectedIds(selectedIds: string[], id: string, allIds: string[]): string[] {
  if (!allIds.includes(id)) return selectedIds;
  const has = selectedIds.includes(id);
  if (has) {
    const next = selectedIds.filter((item) => item !== id);
    return next.length === 0 ? selectedIds : next;
  }
  return [...selectedIds, id];
}

export function excerptsToSend(pending: PendingAskChoice): Excerpt[] {
  const selected = new Set(pending.selectedIds);
  return pending.excerpts.filter((excerpt) => selected.has(excerpt.id));
}
