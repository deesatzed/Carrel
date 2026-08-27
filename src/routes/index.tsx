import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { EmptyCarrel } from "@/components/empty-carrel";
import { Desk } from "@/components/desk";
import { useDesk } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const packet = useDesk((s) => s.packet);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (mounted && packet) return <Desk />;
  return <EmptyCarrel />;
}
