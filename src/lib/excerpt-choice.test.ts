import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { excerptsToSend, toggleSelectedIds } from "./excerpt-choice.ts";

describe("toggleSelectedIds", () => {
  it("unchecks a passage without dropping it from the candidate list", () => {
    const next = toggleSelectedIds(["sec-0", "sec-1"], "sec-0", ["sec-0", "sec-1"]);
    assert.deepEqual(next, ["sec-1"]);
  });

  it("re-checks a passage that was unchecked", () => {
    const next = toggleSelectedIds(["sec-1"], "sec-0", ["sec-0", "sec-1"]);
    assert.deepEqual(next, ["sec-1", "sec-0"]);
  });

  it("refuses to uncheck the last selected passage", () => {
    const next = toggleSelectedIds(["sec-1"], "sec-1", ["sec-0", "sec-1"]);
    assert.deepEqual(next, ["sec-1"]);
  });
});

describe("excerptsToSend", () => {
  it("sends only checked passages", () => {
    const excerpts = [
      { id: "sec-0", heading: "IDENTITY", text: "Name: Ada", start: 0 },
      { id: "sec-1", heading: "MEDICATIONS", text: "Apixaban", start: 10 },
    ];
    const sent = excerptsToSend({
      question: "meds",
      excerpts,
      selectedIds: ["sec-1"],
    });
    assert.deepEqual(
      sent.map((e) => e.id),
      ["sec-1"],
    );
  });
});
