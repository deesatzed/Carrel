import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEMO_PACKET, DEMO_PACKET_TITLE } from "@/lib/demo-packet";
import {
  applyChips,
  buildPacket,
  draftCallSlip,
  retrieveExcerpts,
  type CallSlip,
  type Excerpt,
  type Packet,
} from "@/lib/packet";
import { uid } from "@/lib/utils";

export type Mode = "ask" | "lookup" | "find";

export type Turn = {
  id: string;
  role: "user" | "lamp";
  mode: Mode;
  text: string;
  excerpts?: Excerpt[];
  slip?: CallSlip & { includedChips: string[] };
  createdAt: number;
  kept?: boolean;
};

export type Keep = {
  id: string;
  text: string;
  sourceTurnId: string | null;
  createdAt: number;
};

export type Receipt = {
  id: string;
  at: number;
  kind: "ask" | "lookup";
  summary: string;
  payload: string;
};

export type PendingAsk = {
  question: string;
  excerpts: Excerpt[];
};

export type PendingSlip = {
  question: string;
  slip: CallSlip;
  selectedChips: string[];
};

const DAILY_CAP = 16;

type DeskState = {
  packet: Packet | null;
  turns: Turn[];
  keeps: Keep[];
  receipts: Receipt[];
  pendingAsk: PendingAsk | null;
  pendingSlip: PendingSlip | null;
  working: null | { stage: string };
  error: string | null;
  dailyStamp: string;
  dailyCount: number;
  loadDemo: () => void;
  loadPaste: (text: string) => void;
  clearDesk: () => void;
  prepareAsk: (question: string) => void;
  prepareSlip: (question: string) => void;
  toggleAskExcerpt: (id: string) => void;
  toggleChip: (chip: string) => void;
  editCleaned: (text: string) => void;
  cancelAirlock: () => void;
  confirmAsk: (run: (input: { question: string; excerpts: Excerpt[] }) => Promise<{ ok: true; text: string } | { ok: false; error: string }>) => Promise<void>;
  confirmSlip: (run: (input: { cleaned: string }) => Promise<{ ok: true; text: string } | { ok: false; error: string }>) => Promise<void>;
  keepTurn: (turnId: string) => void;
  dropKeep: (id: string) => void;
  remaining: () => number;
};

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

export const useDesk = create<DeskState>()(
  persist(
    (set, get) => ({
      packet: null,
      turns: [],
      keeps: [],
      receipts: [],
      pendingAsk: null,
      pendingSlip: null,
      working: null,
      error: null,
      dailyStamp: todayStamp(),
      dailyCount: 0,
      remaining: () => {
        const s = get();
        const stamp = todayStamp();
        if (s.dailyStamp !== stamp) return DAILY_CAP;
        return Math.max(0, DAILY_CAP - s.dailyCount);
      },
      loadDemo: () =>
        set({
          packet: buildPacket(DEMO_PACKET, "demo", DEMO_PACKET_TITLE),
          turns: [],
          keeps: [],
          receipts: [],
          pendingAsk: null,
          pendingSlip: null,
          error: null,
        }),
      loadPaste: (text) =>
        set({
          packet: buildPacket(text, "paste"),
          turns: [],
          keeps: [],
          receipts: [],
          pendingAsk: null,
          pendingSlip: null,
          error: null,
        }),
      clearDesk: () =>
        set({
          packet: null,
          turns: [],
          keeps: [],
          receipts: [],
          pendingAsk: null,
          pendingSlip: null,
          working: null,
          error: null,
        }),
      prepareAsk: (question) => {
        const packet = get().packet;
        if (!packet) return;
        const excerpts = retrieveExcerpts(packet, question, 5);
        set({
          pendingAsk: { question: question.trim(), excerpts },
          pendingSlip: null,
          error: null,
        });
      },
      prepareSlip: (question) => {
        const packet = get().packet;
        if (!packet) return;
        const slip = draftCallSlip(question.trim(), packet);
        set({
          pendingSlip: { question: question.trim(), slip, selectedChips: [] },
          pendingAsk: null,
          error: null,
        });
      },
      toggleAskExcerpt: (id) => {
        const pending = get().pendingAsk;
        if (!pending) return;
        const has = pending.excerpts.some((e) => e.id === id);
        if (has && pending.excerpts.length === 1) return;
        set({
          pendingAsk: {
            ...pending,
            excerpts: has
              ? pending.excerpts.filter((e) => e.id !== id)
              : pending.excerpts,
          },
        });
      },
      toggleChip: (chip) => {
        const pending = get().pendingSlip;
        if (!pending) return;
        const has = pending.selectedChips.includes(chip);
        set({
          pendingSlip: {
            ...pending,
            selectedChips: has
              ? pending.selectedChips.filter((c) => c !== chip)
              : [...pending.selectedChips, chip],
          },
        });
      },
      editCleaned: (text) => {
        const pending = get().pendingSlip;
        if (!pending) return;
        set({
          pendingSlip: { ...pending, slip: { ...pending.slip, cleaned: text } },
        });
      },
      cancelAirlock: () => set({ pendingAsk: null, pendingSlip: null }),
      confirmAsk: async (run) => {
        const { packet, pendingAsk } = get();
        if (!packet || !pendingAsk) return;
        const left = get().remaining();
        if (left <= 0) {
          set({ error: "Today’s lamp is spent. Come back tomorrow." });
          return;
        }
        const userTurn: Turn = {
          id: uid("q"),
          role: "user",
          mode: "ask",
          text: pendingAsk.question,
          excerpts: pendingAsk.excerpts,
          createdAt: Date.now(),
        };
        set({
          working: { stage: "Reading the pages you approved" },
          pendingAsk: null,
          error: null,
          turns: [...get().turns, userTurn],
        });
        const result = await run({
          question: pendingAsk.question,
          excerpts: pendingAsk.excerpts,
        });
        const stamp = todayStamp();
        const count = get().dailyStamp === stamp ? get().dailyCount + 1 : 1;
        if (!result.ok) {
          set({
            working: null,
            dailyStamp: stamp,
            dailyCount: count,
            error: result.error,
            turns: [
              ...get().turns,
              {
                id: uid("a"),
                role: "lamp",
                mode: "ask",
                text: `The lamp dimmed: ${result.error}`,
                createdAt: Date.now(),
              },
            ],
          });
          return;
        }
        set({
          working: null,
          dailyStamp: stamp,
          dailyCount: count,
          turns: [
            ...get().turns,
            {
              id: uid("a"),
              role: "lamp",
              mode: "ask",
              text: result.text,
              excerpts: pendingAsk.excerpts,
              createdAt: Date.now(),
            },
          ],
          receipts: [
            {
              id: uid("rx"),
              at: Date.now(),
              kind: "ask",
              summary: `Ask — ${pendingAsk.excerpts.length} passage${pendingAsk.excerpts.length === 1 ? "" : "s"} left this browser`,
              payload: pendingAsk.excerpts
                .map((e) => `## ${e.heading}\n${e.text}`)
                .join("\n\n")
                .slice(0, 4000),
            },
            ...get().receipts,
          ],
        });
      },
      confirmSlip: async (run) => {
        const pending = get().pendingSlip;
        if (!pending) return;
        const left = get().remaining();
        if (left <= 0) {
          set({ error: "Today’s lamp is spent. Come back tomorrow." });
          return;
        }
        const cleaned = applyChips(pending.slip.cleaned, pending.selectedChips);
        const userTurn: Turn = {
          id: uid("q"),
          role: "user",
          mode: "lookup",
          text: pending.question,
          slip: { ...pending.slip, cleaned, includedChips: pending.selectedChips },
          createdAt: Date.now(),
        };
        set({
          working: { stage: "Carrying the call slip outside" },
          pendingSlip: null,
          error: null,
          turns: [...get().turns, userTurn],
        });
        const result = await run({ cleaned });
        const stamp = todayStamp();
        const count = get().dailyStamp === stamp ? get().dailyCount + 1 : 1;
        if (!result.ok) {
          set({
            working: null,
            dailyStamp: stamp,
            dailyCount: count,
            error: result.error,
            turns: [
              ...get().turns,
              {
                id: uid("a"),
                role: "lamp",
                mode: "lookup",
                text: `The slip came back unread: ${result.error}`,
                createdAt: Date.now(),
              },
            ],
          });
          return;
        }
        set({
          working: null,
          dailyStamp: stamp,
          dailyCount: count,
          turns: [
            ...get().turns,
            {
              id: uid("a"),
              role: "lamp",
              mode: "lookup",
              text: result.text,
              slip: { ...pending.slip, cleaned, includedChips: pending.selectedChips },
              createdAt: Date.now(),
            },
          ],
          receipts: [
            {
              id: uid("rx"),
              at: Date.now(),
              kind: "lookup",
              summary: "Call slip — packet stayed on the desk",
              payload: cleaned,
            },
            ...get().receipts,
          ],
        });
      },
      keepTurn: (turnId) => {
        const turn = get().turns.find((t) => t.id === turnId);
        if (!turn || turn.role !== "lamp") return;
        set({
          turns: get().turns.map((t) => (t.id === turnId ? { ...t, kept: true } : t)),
          keeps: [
            {
              id: uid("k"),
              text: turn.text.slice(0, 600),
              sourceTurnId: turnId,
              createdAt: Date.now(),
            },
            ...get().keeps,
          ],
        });
      },
      dropKeep: (id) => set({ keeps: get().keeps.filter((k) => k.id !== id) }),
    }),
    {
      name: "carrel-desk-v1",
      skipHydration: typeof window === "undefined",
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const incoming = (persisted ?? {}) as Partial<DeskState>;
        if (current.packet) return current;
        return { ...current, ...incoming };
      },
      partialize: (s) => ({
        packet: s.packet,
        turns: s.turns,
        keeps: s.keeps,
        receipts: s.receipts,
        dailyStamp: s.dailyStamp,
        dailyCount: s.dailyCount,
      }),
    },
  ),
);
