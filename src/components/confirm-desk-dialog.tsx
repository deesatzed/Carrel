import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ConfirmDeskDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="paper-sheet max-w-md text-ink">
        <DialogHeader>
          <DialogTitle className="text-ink">{title}</DialogTitle>
          <DialogDescription className="text-ink-muted">{body}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" className="text-ink hover:bg-ink/5" onClick={() => onOpenChange(false)}>
            Keep it
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
