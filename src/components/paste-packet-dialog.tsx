import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useDesk } from "@/lib/store";

export function PastePacketDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const loadPaste = useDesk((s) => s.loadPaste);
  const packet = useDesk((s) => s.packet);
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");
  const replacing = Boolean(packet);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="paper-sheet max-h-[90dvh] overflow-y-auto text-ink">
        <DialogHeader>
          <DialogTitle className="text-ink">Lay a packet on the desk</DialogTitle>
          <DialogDescription className="text-ink-muted">
            Paste text only. It is stored in this browser, not in an account. Nothing is sent until you confirm an
            Ask or stamp a call slip.
            {replacing
              ? " A packet is already on the desk. Placing this one clears the hearing, keeps, and receipts."
              : ""}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Paste a health summary, a letter, a lab list…"
          className="min-h-48 border-paper-edge bg-paper text-ink placeholder:text-ink-muted"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" className="text-ink hover:bg-ink/5" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={draft.trim().length < 20}
            onClick={() => {
              loadPaste(draft);
              setDraft("");
              onOpenChange(false);
              void navigate({ to: "/desk" });
            }}
          >
            {replacing ? "Replace the packet on the desk" : "Place on the desk"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
