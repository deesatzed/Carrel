import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDesk } from "@/lib/store";
import { searchHits } from "@/lib/packet";
import { cn } from "@/lib/utils";

export function PacketPane({ focusHeading }: { focusHeading: string | null }) {
  const packet = useDesk((s) => s.packet);
  const keeps = useDesk((s) => s.keeps);
  const dropKeep = useDesk((s) => s.dropKeep);
  const [query, setQuery] = useState("");
  const paperRef = useRef<HTMLDivElement>(null);

  const hits = useMemo(() => (packet && query.trim() ? searchHits(packet, query) : []), [packet, query]);

  useEffect(() => {
    if (!focusHeading || !paperRef.current) return;
    const el = paperRef.current.querySelector(`[data-heading="${CSS.escape(focusHeading)}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusHeading]);

  if (!packet) return null;

  const who = packet.identity.preferred || packet.identity.name || "Untitled";

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">Packet</p>
          <h2 className="font-display text-xl font-medium tracking-tight text-foreground">{who}</h2>
        </div>
        <Badge variant={packet.source === "demo" ? "default" : "slip"}>
          {packet.source === "demo" ? "Synthetic demo" : "From this browser"}
        </Badge>
      </div>

      {keeps.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {keeps.map((k) => (
            <article
              key={k.id}
              className="paper-sheet relative w-48 shrink-0 rounded-md p-3"
            >
              <p className="line-clamp-4 font-serif text-xs leading-relaxed text-ink">{k.text}</p>
              <button
                type="button"
                className="absolute top-1 right-1 p-1 text-ink-muted hover:text-ink"
                onClick={() => dropKeep(k.id)}
                aria-label="Remove kept card"
              >
                <X className="size-3.5" />
              </button>
            </article>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find on the page — no network"
          className="h-11 border-paper-edge bg-paper pl-9 text-ink placeholder:text-ink-muted"
        />
      </div>

      {query.trim() && (
        <p className="text-xs text-muted-foreground tabular-nums">
          {hits.length} match{hits.length === 1 ? "" : "es"} on the packet. Nothing left the desk.
        </p>
      )}

      <div
        ref={paperRef}
        className="paper-sheet scrollbar-thin min-h-0 flex-1 overflow-y-auto rounded-xl p-5 sm:p-7"
      >
        {packet.sections.map((sec) => (
          <article key={sec.id} data-heading={sec.heading} className="mb-8 last:mb-0">
            <h3
              className={cn(
                "mb-2 font-display text-sm font-semibold tracking-[0.08em] text-ink uppercase",
                focusHeading === sec.heading && "packet-mark -mx-2 rounded-sm px-2 py-1",
              )}
            >
              {sec.heading}
            </h3>
            <p className="font-serif text-[15px] leading-[1.65] whitespace-pre-wrap text-ink">
              {highlight(sec.body, query)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function highlight(text: string, query: string) {
  const q = query.trim();
  if (q.length < 2) return text;
  const terms = q.split(/\s+/).filter((t) => t.length > 2);
  if (!terms.length) return text;
  const re = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "ig");
  const parts = text.split(re);
  return parts.map((part, i) =>
    terms.some((t) => part.toLowerCase() === t.toLowerCase()) ? (
      <mark key={i} className="rounded-sm bg-lamp/35 text-ink">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}
