import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FileText, Lamp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LampMark } from "@/components/lamp-mark";
import { PastePacketDialog } from "@/components/paste-packet-dialog";
import { useDesk } from "@/lib/store";

export function EmptyCarrel() {
  const loadDemo = useDesk((s) => s.loadDemo);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="desk-glow relative min-h-dvh px-5 pt-16 pb-10 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-xl flex-col justify-center">
        <Link to="/" className="stagger-in text-lamp w-fit">
          <LampMark className="size-10" />
          <span className="sr-only">Carrel home</span>
        </Link>
        <h1 className="stagger-in mt-6 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          The desk is empty
        </h1>
        <p className="stagger-in mt-3 max-w-md text-lg leading-relaxed text-muted-foreground">
          Lay a packet here. Ask the pages. Nothing leaves without a call slip.
        </p>

        <div className="stagger-in mt-10 flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            className="h-12"
            onClick={() => {
              loadDemo();
              void navigate({ to: "/desk" });
            }}
          >
            <Lamp className="size-4" />
            Sit with the demo packet
          </Button>
          <Button size="lg" variant="outline" onClick={() => setOpen(true)} className="h-12">
            <FileText className="size-4" />
            Paste your own
          </Button>
        </div>

        <p className="stagger-in mt-8 max-w-md text-xs leading-relaxed text-muted-foreground">
          Carrel is not a clinician, not HIPAA, and not safe for care. The demo packet is a fictional person. Ask
          still sends the passages you approve to a remote language model.
        </p>
      </div>

      <PastePacketDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
