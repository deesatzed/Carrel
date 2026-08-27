import type { Excerpt } from "./packet";

export type ReceiptUnchecked = {
  id: string;
  heading: string;
};

export type DeskReceipt = {
  id: string;
  at: number;
  kind: "ask" | "lookup";
  summary: string;
  payload: string;
  model: string;
  unchecked: ReceiptUnchecked[];
};

export function makeAskReceipt(
  excerpts: Excerpt[],
  at: number,
  id: string,
  meta: { model: string; unchecked: ReceiptUnchecked[] },
): DeskReceipt {
  return {
    id,
    at,
    kind: "ask",
    summary: `Ask — ${excerpts.length} passage${excerpts.length === 1 ? "" : "s"} left this browser`,
    payload: excerpts
      .map((e) => `## ${e.heading}\n${e.text}`)
      .join("\n\n")
      .slice(0, 4000),
    model: meta.model,
    unchecked: meta.unchecked,
  };
}

export function makeSlipReceipt(
  cleaned: string,
  at: number,
  id: string,
  meta: { model: string },
): DeskReceipt {
  return {
    id,
    at,
    kind: "lookup",
    summary: "Call slip — packet stayed on the desk",
    payload: cleaned,
    model: meta.model,
    unchecked: [],
  };
}

export function receiptsAfterAttempt(
  prior: DeskReceipt[],
  attempt: DeskReceipt | null,
): DeskReceipt[] {
  if (!attempt) return prior;
  return [attempt, ...prior];
}
