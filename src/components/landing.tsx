import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, FileText, Lamp, ScrollText, Bookmark, Search, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LampMark } from "@/components/lamp-mark";
import { PastePacketDialog } from "@/components/paste-packet-dialog";
import { useDesk } from "@/lib/store";

export function Landing() {
  const loadDemo = useDesk((s) => s.loadDemo);
  const packet = useDesk((s) => s.packet);
  const navigate = useNavigate();
  const [pasteOpen, setPasteOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const occupied = mounted && Boolean(packet);

  const sit = () => {
    loadDemo();
    void navigate({ to: "/desk" });
  };

  return (
    <div className="desk-glow min-h-dvh">
      <header className="mx-auto flex max-w-5xl items-center gap-3 px-5 pt-14 pb-4 sm:px-8">
        <LampMark className="size-7 text-lamp" />
        <p className="flex-1 font-display text-lg font-medium">Carrel</p>
        {occupied && (
          <Button variant="outline" size="sm" asChild>
            <Link to="/desk">Return to the desk</Link>
          </Button>
        )}
      </header>

      <section className="mx-auto grid max-w-5xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-16">
        <div>
          <p className="stagger-in text-xs font-medium tracking-[0.18em] text-lamp uppercase">A private library desk</p>
          <h1 className="stagger-in mt-3 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Ask the packet. Nothing leaves without a call slip.
          </h1>
          <p className="stagger-in mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Ordinary chatbots are one mouth. Paste a record, and a web search may still carry a name. Carrel is a
            room: the packet stays on the desk until you stamp what may go outside.
          </p>
          <div className="stagger-in mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="h-12" onClick={sit}>
              <Lamp className="size-4" />
              Sit with the demo packet
            </Button>
            <Button size="lg" variant="outline" className="h-12" onClick={() => setPasteOpen(true)}>
              <FileText className="size-4" />
              Paste your own
            </Button>
          </div>
        </div>

        <figure className="stagger-in relative pb-10">
          <div className="paper-sheet -rotate-1 rounded-lg p-6 sm:p-8">
            <p className="text-[11px] font-medium tracking-[0.16em] text-ink-muted uppercase">Packet</p>
            <p className="mt-3 font-display text-2xl font-medium text-ink">Closed on the desk</p>
            <p className="mt-3 font-serif text-sm leading-relaxed text-ink-muted">
              Identity stays on this page. The lamp reads only the passages you unclip.
            </p>
            <p className="mt-6 font-serif text-xs tracking-wide text-ink-muted">SYNTHETIC DEMO · NOT A REAL PERSON</p>
          </div>
          <div className="paper-sheet absolute right-3 -bottom-2 w-3/4 rotate-2 rounded-md p-4 sm:right-6">
            <p className="text-[11px] font-medium tracking-[0.16em] text-ink-muted uppercase">Call slip</p>
            <p className="mt-2 font-serif text-sm text-ink-muted line-through">Is ibuprofen safe for Mara Ellison?</p>
            <p className="mt-1 font-serif text-sm text-ink">Is ibuprofen safe for this person?</p>
          </div>
        </figure>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <h2 className="font-display text-2xl font-medium tracking-tight">Two verbs, not one chat box</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The packet is the home object. Conversation is a lamp you turn on over a page.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-border bg-card p-5">
            <Lamp className="size-5 text-lamp" />
            <h3 className="mt-3 font-display text-lg font-medium">Ask the packet</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              You see the passages that will be read. A remote model answers only from those pages. If it is not on
              the page, the lamp stays quiet.
            </p>
          </article>
          <article className="paper-sheet rounded-xl p-5">
            <ScrollText className="size-5 text-ink" />
            <h3 className="mt-3 font-display text-lg font-medium text-ink">Fill a call slip</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Names, phones, and record numbers are struck. You may add condition chips with no names. You stamp the
              cleaned question. The packet does not go with it.
            </p>
            <div className="mt-4 space-y-2 font-serif text-sm text-ink">
              <p>
                Original.{" "}
                <span className="text-ink-muted line-through">Is ibuprofen safe for Mara Ellison?</span>
              </p>
              <p>Slip. Is ibuprofen safe for this person?</p>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-4 sm:px-8">
        <ul className="grid gap-4 sm:grid-cols-3">
          <li className="rounded-xl border border-border bg-card/70 p-5">
            <Search className="size-4 text-lamp" />
            <h3 className="mt-3 font-display text-base font-medium">Find</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Search the page. No network.</p>
          </li>
          <li className="rounded-xl border border-border bg-card/70 p-5">
            <Bookmark className="size-4 text-lamp" />
            <h3 className="mt-3 font-display text-base font-medium">Keep</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Pin a fact on purpose. Nothing is remembered in silence.
            </p>
          </li>
          <li className="rounded-xl border border-border bg-card/70 p-5">
            <ReceiptText className="size-4 text-lamp" />
            <h3 className="mt-3 font-display text-base font-medium">Receipts</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Every time something left this browser, a line was kept.
            </p>
          </li>
        </ul>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <h2 className="font-display text-2xl font-medium tracking-tight">Not another chat with a sidebar</h2>
        <div className="mt-6 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Ordinary chat</th>
                <th className="px-4 py-3 font-medium">Carrel</th>
              </tr>
            </thead>
            <tbody className="text-foreground/90">
              <tr className="border-t border-border">
                <td className="px-4 py-3 text-muted-foreground">The thread is the home object</td>
                <td className="px-4 py-3">The packet is the home object</td>
              </tr>
              <tr className="border-t border-border bg-card/40">
                <td className="px-4 py-3 text-muted-foreground">One mouth for records and the web</td>
                <td className="px-4 py-3">Ask stays inside. A slip goes outside.</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 text-muted-foreground">Silent memory</td>
                <td className="px-4 py-3">Keep is a verb</td>
              </tr>
              <tr className="border-t border-border bg-card/40">
                <td className="px-4 py-3 text-muted-foreground">You guess what left</td>
                <td className="px-4 py-3">You stamp it. Receipts remain.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <h2 className="font-display text-2xl font-medium tracking-tight">Sit down</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            The demo packet is a fictional person. Use it first. Carrel is not a clinician, not HIPAA, and not safe
            for care. Ask still sends the passages you approve to a remote language model — on purpose, in the open.
          </p>
          <Button size="lg" className="mt-6 h-12" onClick={sit}>
            Sit with the demo packet
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-5 py-8 text-xs leading-relaxed text-muted-foreground sm:px-8">
        Carrel does not claim to be local inference. A call slip never carries the packet. A real packet should be
        de-identified before you confirm an Ask.
      </footer>

      <PastePacketDialog open={pasteOpen} onOpenChange={setPasteOpen} />
    </div>
  );
}
