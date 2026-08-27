import { Lamp, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDesk } from "@/lib/store";
import { askThePacket, fillCallSlip } from "@/lib/ai";
import { applyChips } from "@/lib/packet";
import { slipPiiHits } from "@/lib/slip-guard";
import { cn } from "@/lib/utils";

export function Airlock() {
  const pendingAsk = useDesk((s) => s.pendingAsk);
  const pendingSlip = useDesk((s) => s.pendingSlip);
  const cancel = useDesk((s) => s.cancelAirlock);
  const toggleAskExcerpt = useDesk((s) => s.toggleAskExcerpt);
  const toggleChip = useDesk((s) => s.toggleChip);
  const editCleaned = useDesk((s) => s.editCleaned);
  const confirmAsk = useDesk((s) => s.confirmAsk);
  const confirmSlip = useDesk((s) => s.confirmSlip);
  const packet = useDesk((s) => s.packet);

  if (!pendingAsk && !pendingSlip) return null;

  const slipToSend = pendingSlip
    ? applyChips(pendingSlip.slip.cleaned, pendingSlip.selectedChips)
    : "";
  const slipHits = pendingSlip && packet ? slipPiiHits(slipToSend, packet) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/75 p-3 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={pendingAsk ? "airlock-ask-title" : "airlock-slip-title"}
        className="paper-sheet max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-xl p-5 sm:p-6"
      >
        {pendingAsk && (
          <>
            <p className="text-[11px] font-medium tracking-[0.16em] text-ink-muted uppercase">Airlock · Ask</p>
            <h3 id="airlock-ask-title" className="mt-1 font-display text-2xl font-medium text-ink">
              These pages will be read
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              A remote language model will see the question and the passages you leave checked. This is not local
              inference. Uncheck anything that should not leave. Unchecked pages stay on the list so you can clip
              them again.
            </p>
            <p className="mt-4 font-serif text-sm text-ink">
              <span className="text-ink-muted">Question. </span>
              {pendingAsk.question}
            </p>
            {pendingAsk.excerpts.length === 0 ? (
              <p className="mt-4 text-sm leading-relaxed text-ink">
                No passage on the packet matched this question. The lamp stays quiet. Nothing will be sent.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {pendingAsk.excerpts.map((e) => {
                  const checked = pendingAsk.selectedIds.includes(e.id);
                  return (
                    <li key={e.id}>
                      <label className="flex cursor-pointer gap-3 rounded-md border border-paper-edge bg-paper/60 p-3">
                        <input
                          type="checkbox"
                          className="mt-1 size-4 accent-primary"
                          checked={checked}
                          onChange={() => toggleAskExcerpt(e.id)}
                        />
                        <span>
                          <span className="block text-xs font-medium tracking-wide text-ink-muted uppercase">
                            {e.heading}
                          </span>
                          <span className="mt-1 block font-serif text-sm leading-relaxed text-ink">
                            {e.text.slice(0, 280)}
                            {e.text.length > 280 ? "…" : ""}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" className="text-ink hover:bg-ink/5" onClick={cancel}>
                Keep it here
              </Button>
              <Button
                disabled={pendingAsk.selectedIds.length === 0}
                onClick={() =>
                  void confirmAsk((input) => askThePacket({ data: input }))
                }
              >
                <Lamp className="size-4" />
                Read these pages
              </Button>
            </div>
          </>
        )}

        {pendingSlip && (
          <>
            <p className="text-[11px] font-medium tracking-[0.16em] text-ink-muted uppercase">Airlock · Call slip</p>
            <h3 id="airlock-slip-title" className="mt-1 font-display text-2xl font-medium text-ink">
              Stamp what leaves
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              The packet stays on the desk. Only this cleaned question goes outside. Names and record numbers already
              spotted are struck. You may edit the slip before it leaves.
            </p>
            {pendingSlip.slip.stripped.length > 0 && (
              <p className="mt-3 text-xs text-ink-muted">
                Struck: {pendingSlip.slip.stripped.map((s) => `${s.term} (${s.reason})`).join(" · ")}
              </p>
            )}
            <label className="mt-4 block text-xs font-medium tracking-wide text-ink-muted uppercase">
              Original
              <span className="mt-1 block font-serif text-sm font-normal normal-case text-ink">
                {pendingSlip.question}
              </span>
            </label>
            <label className="mt-4 block text-xs font-medium tracking-wide text-ink-muted uppercase">
              Slip
              <Textarea
                value={pendingSlip.slip.cleaned}
                onChange={(e) => editCleaned(e.target.value)}
                className="mt-1 min-h-24 border-paper-edge bg-paper font-serif text-sm text-ink"
              />
            </label>
            {pendingSlip.slip.conditionChips.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">
                  Optional context — still no names
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {pendingSlip.slip.conditionChips.map((chip) => {
                    const on = pendingSlip.selectedChips.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => toggleChip(chip)}
                        className={cn(
                          "rounded-full px-2.5 py-1.5 text-left text-[11px] leading-snug",
                          on ? "bg-primary text-primary-foreground" : "bg-ink/8 text-ink",
                        )}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {slipHits.length > 0 && (
              <p className="mt-4 text-sm text-destructive">
                The slip still has identifiers ({slipHits.map((h) => `${h.term} · ${h.reason}`).join("; ")}).
                Strike them before it leaves. Nothing will be sent.
              </p>
            )}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" className="text-ink hover:bg-ink/5" onClick={cancel}>
                Do not send
              </Button>
              <Button
                variant="paper"
                className="shadow-[var(--shadow-border)]"
                disabled={!pendingSlip.slip.cleaned.trim() || slipHits.length > 0}
                onClick={() => void confirmSlip((input) => fillCallSlip({ data: input }))}
              >
                <ScrollText className="size-4" />
                Stamp and send
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
