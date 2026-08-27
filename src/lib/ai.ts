import { createServerFn } from "@tanstack/react-start";
import type { Excerpt } from "@/lib/packet";
import { lampModelId } from "@/lib/lamp-model";

type Ok = { ok: true; text: string };
type Fail = { ok: false; error: string };
type Result = Ok | Fail;

async function complete(messages: { role: "system" | "user"; content: string }[], maxTokens: number): Promise<Result> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return { ok: false, error: "AI is not available in this environment" };

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: lampModelId(),
      messages,
      temperature: 0.2,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    return { ok: false, error: `The lamp could not reach the model (${res.status}).` };
  }
  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = body.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) return { ok: false, error: "The model returned an empty page." };
  return { ok: true, text };
}

export const askThePacket = createServerFn({ method: "POST" })
  .validator((input: { question: string; excerpts: Excerpt[] }) => input)
  .handler(async ({ data }): Promise<Result> => {
    const passages = data.excerpts
      .map((e, i) => `PASSAGE ${i + 1} — ${e.heading}\n${e.text}`)
      .join("\n\n---\n\n")
      .slice(0, 12_000);

    return complete(
      [
        {
          role: "system",
          content: `You are a lamp over a private packet, not a clinician and not a search engine.
Answer ONLY from the provided passages.
If the passages do not contain the answer, say you do not see it in the packet. Do not guess. Do not add outside medical advice. Do not invent labs, doses, dates, or names.
When you use a passage, quote a short phrase and name its heading.
Keep the tone calm, plain, and brief.
If the question is clinical, end with exactly: "This is a reading of the packet, not medical advice."
Never ask the user to paste more identifiers.`,
        },
        {
          role: "user",
          content: `Question: ${data.question.slice(0, 800)}\n\nPassages:\n${passages}`,
        },
      ],
      700,
    );
  });

export const fillCallSlip = createServerFn({ method: "POST" })
  .validator((input: { cleaned: string }) => input)
  .handler(async ({ data }): Promise<Result> => {
    return complete(
      [
        {
          role: "system",
          content: `You are answering a cleaned question that was allowed to leave a private reading room.
You do not have the packet and must not ask for names, dates of birth, record numbers, addresses, or phone numbers.
Give general information only. Label it as general, not personal medical advice.
If the question still appears to contain a person's name or record identifiers, refuse and say the slip is not clean.
Do not provide instructions for illegal activity or for harming anyone.
Keep the answer compact. End with: "General information, not care for a specific person."`,
        },
        {
          role: "user",
          content: data.cleaned.slice(0, 1200),
        },
      ],
      800,
    );
  });
