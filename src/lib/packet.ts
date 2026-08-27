export type Identity = {
  name: string | null;
  preferred: string | null;
  dob: string | null;
  mrn: string | null;
  address: string | null;
  phone: string | null;
  contact: string | null;
};

export type Section = {
  id: string;
  heading: string;
  body: string;
  start: number;
  end: number;
};

export type Excerpt = {
  id: string;
  heading: string;
  text: string;
  start: number;
};

export type Packet = {
  id: string;
  title: string;
  raw: string;
  source: "demo" | "paste";
  identity: Identity;
  sections: Section[];
  problems: string[];
  medications: string[];
  loadedAt: number;
};

export type Stripped = {
  term: string;
  reason: string;
};

export type CallSlip = {
  original: string;
  cleaned: string;
  stripped: Stripped[];
  conditionChips: string[];
};

const STOP = new Set(
  "a an the of to for and or in on with from by is are was were be been being it this that those these what which who whom whose how why when where can could should would may might will about into over after before than then also not no yes if so at as do does did have has had".split(
    " ",
  ),
);

function labeled(raw: string, labels: string[]): string | null {
  for (const label of labels) {
    const re = new RegExp(`^${label}\\s*:\\s*(.+)$`, "im");
    const m = raw.match(re);
    if (m?.[1]) return m[1].replace(/\(synthetic\)/i, "").trim();
  }
  return null;
}

export function extractIdentity(raw: string): Identity {
  return {
    name: labeled(raw, ["Name", "Patient", "Patient name"]),
    preferred: labeled(raw, ["Preferred name"]),
    dob: labeled(raw, ["Date of birth", "DOB"]),
    mrn: labeled(raw, ["MRN", "Medical record number"]),
    address: labeled(raw, ["Address"]),
    phone: labeled(raw, ["Phone", "Telephone"]),
    contact: labeled(raw, ["Emergency contact", "Healthcare power of attorney"]),
  };
}

export function parseSections(raw: string): Section[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const sections: Section[] = [];
  let heading = "Packet";
  let buf: string[] = [];
  let start = 0;
  let cursor = 0;

  const flush = (end: number) => {
    const body = buf.join("\n").trim();
    if (!body && heading === "Packet") return;
    sections.push({
      id: `sec-${sections.length}`,
      heading,
      body: body || "(empty)",
      start,
      end,
    });
  };

  const isHeading = (line: string) => {
    const t = line.trim();
    if (t.length < 3 || t.length > 80) return false;
    if (/^[-•*]/.test(t)) return false;
    if (t.includes(":")) return false;
    const core = t.replace(/\s*[—(].*$/, "").trim();
    const letters = core.replace(/[^A-Za-z]/g, "");
    if (letters.length < 3) return false;
    const upper = letters.replace(/[^A-Z]/g, "").length / letters.length;
    return upper > 0.72 && !core.endsWith(".");
  };

  for (const line of lines) {
    if (isHeading(line)) {
      flush(cursor);
      heading = line.trim();
      buf = [];
      start = cursor + line.length + 1;
    } else {
      buf.push(line);
    }
    cursor += line.length + 1;
  }
  flush(cursor);
  return sections.length ? sections : [{ id: "sec-0", heading: "Packet", body: raw, start: 0, end: raw.length }];
}

function itemsUnder(raw: string, headingRe: RegExp): string[] {
  const parts = raw.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let inBlock = false;
  for (const line of parts) {
    if (headingRe.test(line.trim())) {
      inBlock = true;
      continue;
    }
    if (inBlock && /^[A-Z][A-Z0-9 /&-]{2,}$/.test(line.trim()) && !/^\d/.test(line.trim())) {
      break;
    }
    if (!inBlock) continue;
    const m = line.match(/^\s*(?:\d+[.)]\s+|[-•*]\s+)(.+)/);
    if (m?.[1]) out.push(m[1].replace(/\s+/g, " ").trim());
  }
  return out;
}

export function buildPacket(raw: string, source: "demo" | "paste", title?: string): Packet {
  const text = raw.trim().slice(0, 80_000);
  const identity = extractIdentity(text);
  const sections = parseSections(text);
  return {
    id: `pkt-${Date.now().toString(36)}`,
    title:
      title ??
      identity.name ??
      (text.split("\n").find((l) => l.trim())?.slice(0, 80) || "Untitled packet"),
    raw: text,
    source,
    identity,
    sections,
    problems: itemsUnder(text, /problem list/i),
    medications: itemsUnder(text, /^medications\b/i),
    loadedAt: Date.now(),
  };
}

function tokens(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9+\-/%.\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

const IDENTITY_HEADING =
  /^(identity|patient|patient identity|demographics|contacts?|emergency contact|identifiers?)$/i;

export function isIdentitySection(
  section: { heading: string; body?: string; text?: string },
  identity: Identity,
): boolean {
  const heading = section.heading.replace(/\s*[—(].*$/, "").trim();
  if (IDENTITY_HEADING.test(heading)) return true;
  const body = section.body ?? section.text ?? "";
  const markers = [identity.name, identity.mrn, identity.phone, identity.dob, identity.address].filter(
    (term): term is string => Boolean(term && term.length >= 3),
  );
  if (markers.length === 0) return false;
  const hits = markers.filter((term) => body.includes(term)).length;
  return hits >= 2;
}

export function retrieveExcerpts(packet: Packet, query: string, k = 5): Excerpt[] {
  const terms = tokens(query);
  const scored = packet.sections.map((sec) => {
    const hay = `${sec.heading}\n${sec.body}`.toLowerCase();
    let score = 0;
    for (const t of terms) {
      const re = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "g");
      const n = hay.match(re)?.length ?? 0;
      score += n * (t.length > 6 ? 2 : 1);
      if (sec.heading.toLowerCase().includes(t)) score += 4;
    }
    return { sec, score };
  });
  scored.sort((a, b) => b.score - a.score);

  const strong = scored.filter((s) => s.score >= 2);
  const picked: Excerpt[] = [];
  for (const { sec } of strong) {
    if (picked.length >= k) break;
    const text = sec.body.length > 900 ? `${sec.body.slice(0, 880).trim()}…` : sec.body;
    picked.push({
      id: sec.id,
      heading: sec.heading,
      text,
      start: sec.start,
    });
  }
  return picked;
}

function phoneLike(s: string) {
  return /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(s);
}

export function identityTerms(identity: Identity): Stripped[] {
  const out: Stripped[] = [];
  const add = (term: string | null, reason: string) => {
    if (!term) return;
    const t = term.trim();
    if (t.length < 3) return;
    out.push({ term: t, reason });
  };
  add(identity.name, "name");
  if (identity.name) {
    for (const part of identity.name.split(/\s+/)) {
      if (part.length > 2) add(part.replace(/,$/, ""), "name part");
    }
  }
  add(identity.preferred, "preferred name");
  add(identity.mrn, "record number");
  add(identity.address, "address");
  add(identity.phone, "phone");
  add(identity.dob, "date of birth");
  if (identity.contact) {
    const nameOnly = identity.contact.split(",")[0]?.replace(/\(.*\)/, "").trim() ?? identity.contact;
    add(nameOnly, "contact name");
    for (const part of nameOnly.split(/\s+/)) {
      if (part.length > 2 && !/daughter|son|spouse|wife|husband|contact/i.test(part)) {
        add(part, "contact name part");
      }
    }
  }
  return out;
}

export function draftCallSlip(question: string, packet: Packet): CallSlip {
  const stripped: Stripped[] = [];
  let cleaned = question;

  const extras: Stripped[] = [];
  const email = question.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (email) extras.push({ term: email[0], reason: "email" });
  const phone = question.match(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/);
  if (phone) extras.push({ term: phone[0], reason: "phone" });

  const terms = [...identityTerms(packet.identity), ...extras].sort(
    (a, b) => b.term.length - a.term.length,
  );

  for (const item of terms) {
    const escaped = item.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(escaped, "ig");
    if (re.test(cleaned)) {
      stripped.push(item);
      cleaned = cleaned.replace(re, item.reason === "phone" || phoneLike(item.term) ? "a phone number" : "this person");
    }
  }

  cleaned = cleaned
    .replace(/\bthis person this person\b/gi, "this person")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (!cleaned.endsWith("?")) {
    /* keep as written */
  }

  const conditionChips = [
    ...packet.problems.slice(0, 4).map((p) => p.replace(/\s+[—-].*$/, "").slice(0, 72)),
    ...packet.medications.slice(0, 3).map((m) => m.split(/\s+/)[0] ?? m),
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  return { original: question, cleaned, stripped, conditionChips };
}

export function applyChips(cleaned: string, chips: string[]): string {
  if (!chips.length) return cleaned;
  const ctx = chips.join("; ");
  return `${cleaned.replace(/\?*$/, "")}? General context (no names): ${ctx}. Answer in general terms, not as care for a named person.`;
}

export function searchHits(packet: Packet, query: string): { start: number; end: number; snippet: string; heading: string }[] {
  const terms = tokens(query);
  if (!terms.length) return [];
  const hits: { start: number; end: number; snippet: string; heading: string }[] = [];
  for (const sec of packet.sections) {
    const hay = sec.body;
    const lower = hay.toLowerCase();
    for (const t of terms) {
      let from = 0;
      while (from < lower.length) {
        const i = lower.indexOf(t, from);
        if (i < 0) break;
        const start = Math.max(0, i - 60);
        const end = Math.min(hay.length, i + t.length + 60);
        hits.push({
          start: sec.start + i,
          end: sec.start + i + t.length,
          snippet: hay.slice(start, end).replace(/\s+/g, " ").trim(),
          heading: sec.heading,
        });
        from = i + t.length;
        if (hits.length > 24) return hits;
      }
    }
  }
  return hits;
}
