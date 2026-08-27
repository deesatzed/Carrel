# Carrel

**A private desk for a packet.** Ask the pages in front of you. Nothing leaves without a call slip.

A *carrel* is a private desk in a library. This one holds a sensitive packet — a health summary, a letter, a lab list — and treats the outside world as closed stacks. To fetch something from outside, you fill a call slip.

Carrel is not a chatbot with a sidebar. The packet is the room.

## Why it exists

People paste records into ordinary chat. The same mouth that reads the page will also search the web, often with a name still in the query. Memory happens in silence. Nothing records what left the browser.

Carrel splits the verbs.

## How it works

| Verb | What happens |
| --- | --- |
| **Ask the packet** | You see the passages that will be read. Answers quote the page or stay quiet. |
| **Fill a call slip** | Names, phones, and record numbers are struck. You stamp the cleaned question. The packet stays on the desk. |
| **Find** | Search the page. No network. |
| **Keep** | Pin a fact on purpose. Nothing is remembered in silence. |
| **Receipts** | Every time something left this browser, a line was kept. |

The demo packet is a fictional person named Mara. Sit with it before pasting anything of your own.

## What it is not

- Not a clinician
- Not HIPAA
- Not safe for care
- Not local inference pretending to be on-box

Ask still sends the passages you approve to a remote language model — on purpose, in the open. A call slip never carries the packet.

## Run

```bash
npm install
npm run dev
```

Requires an xAI API key in the server environment (`XAI_API_KEY`) for Ask and call-slip lookup. Find works with no network.

## Stack

TanStack Start, React 19, Tailwind v4, Zustand, xAI.

## License

Source as published in this repository. No warranty. Not for clinical use.
