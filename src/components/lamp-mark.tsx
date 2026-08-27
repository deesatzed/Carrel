import { cn } from "@/lib/utils";

export function LampMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8", className)}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 4.5c.7 0 1.2.4 1.5 1.1l5.2 12.2c.4.9-.2 1.9-1.2 2H10.5c-1 0-1.6-1-1.2-2L14.5 5.6c.3-.7.8-1.1 1.5-1.1Z"
        fill="currentColor"
        opacity="0.92"
      />
      <path d="M10 20.5h12v1.4c0 .8-.7 1.5-1.5 1.5h-9c-.8 0-1.5-.7-1.5-1.5v-1.4Z" fill="currentColor" />
      <path d="M15.2 23.4h1.6V27h-1.6z" fill="currentColor" />
      <path d="M12 27h8v1.4H12z" fill="currentColor" />
      <ellipse cx="16" cy="14.2" rx="4.2" ry="2.2" fill="var(--color-background)" opacity="0.35" />
    </svg>
  );
}
