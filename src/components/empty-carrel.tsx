import { useState } from "react";
import { FileText, Lamp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { LampMark } from "@/components/lamp-mark";
import { useDesk } from "@/lib/store";

export function EmptyCarrel() {
  const loadDemo = useDesk((s) => s.loadDemo);
  const loadPaste = useDesk((s) => s.loadPaste);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  return (
    <div className="desk-glow relative min-h-dvh px-5 pt-16 pb-10 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-xl flex-col justify-center">
        <div className="stagger-in text-lamp">
          <LampMark className="size-10" />
        </div>
        <h1 className="stagger-in mt-6 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          Carrel
        </h1>
        <p className="stagger-in mt-3 max-w-md text-lg leading-relaxed text-muted-foreground">
          A private desk for a packet. Ask the pages in front of you. Nothing leaves without a call slip.
        </p>

        <ol className="stagger-in mt-10 space-y-4 text-sm leading-relaxed text-foreground/85">
          <li className="grid grid-cols-[1.5rem_1fr] gap-3">
            <span className="font-display text-lamp tabular-nums">1</span>
            <span>Lay a packet on the desk. It stays in this browser until you say otherwise.</span>
          </li>
          <li className="grid grid-cols-[1.5rem_1fr] gap-3">
            <span className="font-display text-lamp tabular-nums">2</span>
            <span>
              Ask the packet. You will see the passages that will be read. If it is not on the page, the lamp stays quiet.
            </span>
          </li>
          <li className="grid grid-cols-[1.5rem_1fr] gap-3">
            <span className="font-display text-lamp tabular-nums">3</span>
            <span>
              To consult the outside world, fill a call slip. Names, phones, and record numbers are stripped. You stamp what leaves.
            </span>
          </li>
        </ol>

        <div className="stagger-in mt-10 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={loadDemo} className="h-12">
            <Lamp className="size-4" />
            Sit with the demo packet
          </Button>
          <Button size="lg" variant="outline" onClick={() => setOpen(true)} className="h-12">
            <FileText className="size-4" />
            Paste your own
          </Button>
        </div>

        <p className="stagger-in mt-8 max-w-md text-xs leading-relaxed text-muted-foreground">
          Carrel is not a clinician, not HIPAA, and not safe for care. The demo packet is a fictional person. A
          real packet should be de-identified before you confirm an Ask — Ask still sends the passages you approve
          to a remote language model.
        </p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="paper-sheet max-h-[90dvh] overflow-y-auto text-ink">
          <DialogHeader>
            <DialogTitle className="text-ink">Lay a packet on the desk</DialogTitle>
            <DialogDescription className="text-ink-muted">
              Paste text only. It is stored in this browser, not in an account. Nothing is sent until you confirm an
              Ask or stamp a call slip.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Paste a health summary, a letter, a lab list…"
            className="min-h-48 border-paper-edge bg-paper text-ink placeholder:text-ink-muted"
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" className="text-ink hover:bg-ink/5" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={draft.trim().length < 20}
              onClick={() => {
                loadPaste(draft);
                setOpen(false);
                setDraft("");
              }}
            >
              Place on the desk
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
