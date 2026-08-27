import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { EmptyCarrel } from "@/components/empty-carrel";
import { Desk } from "@/components/desk";
import { useDesk } from "@/lib/store";
import { LampMark } from "@/components/lamp-mark";

export const Route = createFileRoute("/desk")({ component: DeskPage });

function DeskPage() {
  const packet = useDesk((s) => s.packet);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="desk-glow flex min-h-dvh items-center justify-center">
        <LampMark className="size-10 text-lamp" />
      </div>
    );
  }

  return packet ? <Desk /> : <EmptyCarrel />;
}
