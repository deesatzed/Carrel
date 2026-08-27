import { useEffect, useRef, useState } from "react";
import { Bookmark, BookmarkCheck, Lamp, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useDesk, type Turn } from "@/lib/store";
import { cn } from "@/lib/utils";

const DEMO_ASKS = [
  "What medications are listed?",
  "Any allergies I should know?",
  "Why was she in the hospital in June?",
  "What did the clinic say about ibuprofen?",
];

const DEMO_SLIPS = ["Is ibuprofen a problem with apixaban, CKD, and heart failure?"];

export function HearingPane({
  onCite,
}: {
  onCite: (heading: string) => void;
}) {
  const turns = useDesk((s) => s.turns);
  const packet = useDesk((s) => s.packet);
  const working = useDesk((s) => s.working);
  const error = useDesk((s) => s.error);
  const remaining = useDesk((s) => s.remaining());
  const prepareAsk = useDesk((s) => s.prepareAsk);
  const prepareSlip = useDesk((s) => s.prepareSlip);
  const keepTurn = useDesk((s) => s.keepTurn);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns.length, working]);

  const sendAsk = (q: string) => {
    const text = q.trim();
    if (!text) return;
    prepareAsk(text);
    setDraft("");
  };
  const sendSlip = (q: string) => {
    const text = q.trim();
    if (!text) return;
    prepareSlip(text);
    setDraft("");
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">Hearing</p>
          <h2 className="font-display text-xl font-medium tracking-tight">What was asked of the desk</h2>
        </div>
        <p className="text-xs text-muted-foreground tabular-nums">{remaining} lamp{remaining === 1 ? "" : "s"} left today</p>
      </div>

      <div ref={listRef} className="hearing-scroll min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {turns.length === 0 && !working && (
          <div className="rounded-xl border border-border bg-card/60 p-4">
            <p className="text-sm text-muted-foreground">
              This is not a chat that silently searches the web. Choose a verb.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(packet?.source === "demo" ? DEMO_ASKS : ["What is on the first page?", "List the headings you see."]).map(
                (q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendAsk(q)}
                    className="rounded-full bg-primary/15 px-3 py-2 text-left text-xs text-lamp hover:bg-primary/25"
                  >
                    Ask · {q}
                  </button>
                ),
              )}
              {(packet?.source === "demo" ? DEMO_SLIPS : ["What is a general caution with NSAIDs and blood thinners?"]).map(
                (q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendSlip(q)}
                    className="rounded-full bg-paper/10 px-3 py-2 text-left text-xs text-glow hover:bg-paper/16"
                  >
                    Slip · {q}
                  </button>
                ),
              )}
            </div>
          </div>
        )}

        {turns.map((t) => (
          <TurnCard key={t.id} turn={t} onCite={onCite} onKeep={() => keepTurn(t.id)} />
        ))}

        {working && (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-lamp">{working.stage}</p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-secondary">
              <div className="shimmer h-full w-full rounded-full" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">The desk is not frozen. You should always see this bar.</p>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
        <div ref={endRef} />
      </div>

      <form
        className="mt-3 rounded-xl border border-border bg-card p-3"
        onSubmit={(e) => {
          e.preventDefault();
          sendAsk(draft);
        }}
      >
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="A question for the packet, or the start of a call slip"
          className="min-h-20 resize-none border-0 bg-transparent p-1 focus-visible:ring-0"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              sendAsk(draft);
            }
          }}
        />
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Button type="submit" className="flex-1" disabled={!draft.trim() || !!working}>
            <Lamp className="size-4" />
            Ask the packet
          </Button>
          <Button
            type="button"
            variant="paper"
            className="flex-1"
            disabled={!draft.trim() || !!working}
            onClick={() => sendSlip(draft)}
          >
            <ScrollText className="size-4" />
            Fill a call slip
          </Button>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Ask shows the passages first. A call slip never carries the packet — only the cleaned question you stamp.
        </p>
      </form>
    </section>
  );
}

function TurnCard({
  turn,
  onCite,
  onKeep,
}: {
  turn: Turn;
  onCite: (heading: string) => void;
  onKeep: () => void;
}) {
  const mine = turn.role === "user";
  return (
    <article
      className={cn(
        "rounded-xl p-4",
        mine ? "ml-4 bg-secondary/70 sm:ml-10" : "mr-4 border border-border bg-card sm:mr-10",
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <Badge variant={turn.mode === "lookup" ? "slip" : turn.mode === "ask" ? "default" : "muted"}>
          {turn.role === "user"
            ? turn.mode === "lookup"
              ? "You · call slip"
              : "You · ask"
            : turn.mode === "lookup"
              ? "Outside · general"
              : "Packet"}
        </Badge>
        {turn.role === "lamp" && (
          <button
            type="button"
            onClick={onKeep}
            disabled={turn.kept}
            className="inline-flex h-9 items-center gap-1 px-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            {turn.kept ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
            {turn.kept ? "Kept" : "Keep"}
          </button>
        )}
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{turn.text}</p>
      {turn.slip && turn.role === "user" && (
        <p className="mt-2 font-serif text-xs leading-relaxed text-muted-foreground">
          Slip stamped: {turn.slip.cleaned}
        </p>
      )}
      {turn.excerpts && turn.role === "lamp" && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {turn.excerpts.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => onCite(e.heading)}
              className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] text-lamp hover:bg-primary/25"
            >
              {e.heading}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
