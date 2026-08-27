import { identityTerms, type Excerpt, type Identity, type Packet, type Stripped } from "./packet.ts";

export function termAppears(hay: string, term: string): boolean {
  const t = term.trim();
  if (t.length < 3) return false;
  const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(^|[^A-Za-z0-9])${escaped}([^A-Za-z0-9]|$)`, "i");
  return re.test(hay);
}

function expandIdentityTerms(identity: Identity): Stripped[] {
  const out: Stripped[] = [];
  const seen = new Set<string>();
  for (const item of identityTerms(identity)) {
    const variants = [item.term, item.term.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim()];
    for (const term of variants) {
      if (term.length < 3) continue;
      const key = `${item.reason}:${term.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ term, reason: item.reason });
    }
  }
  return out;
}

function extraPatternHits(hay: string): Stripped[] {
  const hits: Stripped[] = [];
  const email = hay.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (email) hits.push({ term: email[0], reason: "email" });
  const phone = hay.match(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/);
  if (phone) hits.push({ term: phone[0], reason: "phone" });
  return hits;
}

function remember(hits: Stripped[], item: Stripped) {
  const key = `${item.reason}:${item.term.toLowerCase()}`;
  if (hits.some((h) => `${h.reason}:${h.term.toLowerCase()}` === key)) return;
  hits.push(item);
}

export function slipPiiHits(cleaned: string, packet: Packet): Stripped[] {
  const hits: Stripped[] = [];
  for (const item of expandIdentityTerms(packet.identity)) {
    if (termAppears(cleaned, item.term)) remember(hits, item);
  }
  for (const item of extraPatternHits(cleaned)) remember(hits, item);
  return hits;
}

export function inventedIdentifiers(
  output: string,
  excerpts: Excerpt[],
  identity: Identity,
): Stripped[] {
  const allowed = excerpts.map((e) => `${e.heading}\n${e.text}`).join("\n");
  const hits: Stripped[] = [];
  for (const item of expandIdentityTerms(identity)) {
    if (termAppears(output, item.term) && !termAppears(allowed, item.term)) remember(hits, item);
  }
  for (const item of extraPatternHits(output)) {
    if (!termAppears(allowed, item.term)) remember(hits, item);
  }
  return hits;
}
