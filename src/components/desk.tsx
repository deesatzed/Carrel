import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, MessageSquare, ReceiptText, Trash2 } from "lucide-react";
import { LampMark } from "@/components/lamp-mark";
import { PacketPane } from "@/components/packet-pane";
import { HearingPane } from "@/components/hearing-pane";
import { Airlock } from "@/components/airlock";
import { ConfirmDeskDialog } from "@/components/confirm-desk-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mustConfirmClear } from "@/lib/desk-safety";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDesk } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Desk() {
  const packet = useDesk((s) => s.packet);
  const receipts = useDesk((s) => s.receipts);
  const clearDesk = useDesk((s) => s.clearDesk);
  const [tab, setTab] = useState<"packet" | "hearing">("packet");
  const [receiptsOpen, setReceiptsOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [focusHeading, setFocusHeading] = useState<string | null>(null);

  if (!packet) return null;

  const who = packet.identity.preferred || packet.identity.name || "Packet";

  return (
    <div className="desk-glow flex h-dvh flex-col overflow-hidden pt-12">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 flex-1 items-center gap-3 text-inherit no-underline">
          <LampMark className="size-7 text-lamp" />
          <div className="min-w-0">
            <p className="font-display text-lg leading-none font-medium">Carrel</p>
            <p className="truncate text-xs text-muted-foreground">Private desk · {who}</p>
          </div>
        </Link>
        <Badge variant={receipts.length ? "slip" : "default"}>
          {receipts.length === 0 ? "Sealed" : `${receipts.length} receipt${receipts.length === 1 ? "" : "s"}`}
        </Badge>
        <Button variant="ghost" size="icon" onClick={() => setReceiptsOpen(true)} aria-label="Open receipts">
          <ReceiptText className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (mustConfirmClear({ packet })) setClearOpen(true);
            else clearDesk();
          }}
          aria-label="Clear the desk"
        >
          <Trash2 className="size-4" />
        </Button>
      </header>

      <div className="flex gap-1 border-b border-border px-3 py-1 lg:hidden">
        <button
          type="button"
          onClick={() => setTab("packet")}
          className={cn(
            "flex h-11 flex-1 items-center justify-center gap-2 rounded-md text-sm",
            tab === "packet" ? "bg-secondary text-foreground" : "text-muted-foreground",
          )}
        >
          <BookOpen className="size-4" />
          Packet
        </button>
        <button
          type="button"
          onClick={() => setTab("hearing")}
          className={cn(
            "flex h-11 flex-1 items-center justify-center gap-2 rounded-md text-sm",
            tab === "hearing" ? "bg-secondary text-foreground" : "text-muted-foreground",
          )}
        >
          <MessageSquare className="size-4" />
          Hearing
        </button>
      </div>

      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 p-4 sm:p-6 lg:grid lg:grid-cols-2 lg:gap-8">
        <div className={cn("min-h-0 flex-1", tab === "hearing" && "hidden lg:flex lg:flex-col", tab === "packet" && "flex flex-col")}>
          <PacketPane focusHeading={focusHeading} />
        </div>
        <div className={cn("min-h-0 flex-1", tab === "packet" && "hidden lg:flex lg:flex-col", tab === "hearing" && "flex flex-col")}>
          <HearingPane
            onCite={(heading) => {
              setFocusHeading(heading);
              setTab("packet");
            }}
          />
        </div>
      </main>

      <footer className="px-4 pb-4 text-center text-[11px] leading-relaxed text-muted-foreground sm:px-6">
        Not a doctor. Not HIPAA. Not safe for care. Ask sends approved passages to a remote model. A call slip
        sends only the cleaned question.
      </footer>

      <Airlock />

      <ConfirmDeskDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        title="Clear the desk?"
        body="The packet, hearing, keeps, and receipts leave this browser. This cannot be undone."
        confirmLabel="Clear the desk"
        onConfirm={clearDesk}
      />

      <Sheet open={receiptsOpen} onOpenChange={setReceiptsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Receipts</SheetTitle>
            <SheetDescription>
              Every time something left this browser, a line was kept here. The packet itself is not stored on a
              server.
            </SheetDescription>
          </SheetHeader>
          <div className="hearing-scroll min-h-0 flex-1 space-y-3 overflow-y-auto">
            {receipts.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing has left the desk.</p>
            )}
            {receipts.map((r) => (
              <article key={r.id} className="rounded-lg border border-border bg-secondary/40 p-3">
                <p className="text-xs text-muted-foreground tabular-nums">
                  {new Date(r.at).toLocaleString()} · {r.kind === "ask" ? "Ask" : "Call slip"}
                  {r.model ? ` · ${r.model}` : ""}
                </p>
                <p className="mt-1 text-sm">{r.summary}</p>
                {r.unchecked && r.unchecked.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Left on the desk: {r.unchecked.map((u) => u.heading).join(" · ")}
                  </p>
                )}
                <p className="mt-2 font-serif text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {r.payload.slice(0, 500)}
                  {r.payload.length > 500 ? "…" : ""}
                </p>
              </article>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
