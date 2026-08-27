import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { makeAskReceipt, makeSlipReceipt, receiptsAfterAttempt } from "./desk-receipts.ts";

describe("receiptsAfterAttempt", () => {
  it("records a receipt when the airlock send leaves the browser even if the model fails", () => {
    const attempt = makeAskReceipt(
      [{ id: "sec-1", heading: "MEDICATIONS", text: "Apixaban 5 mg", start: 0 }],
      1_700_000_000_000,
      "rx-1",
      { model: "grok-4.5", unchecked: [{ id: "sec-0", heading: "IDENTITY" }] },
    );
    const next = receiptsAfterAttempt([], attempt);
    assert.equal(next.length, 1);
    assert.equal(next[0].kind, "ask");
    assert.match(next[0].summary, /1 passage/);
    assert.match(next[0].payload, /Apixaban/);
    assert.equal(next[0].model, "grok-4.5");
    assert.deepEqual(next[0].unchecked, [{ id: "sec-0", heading: "IDENTITY" }]);
  });

  it("records the lamp model on a call-slip receipt", () => {
    const attempt = makeSlipReceipt("Is ibuprofen a problem with apixaban?", 1, "rx-2", {
      model: "grok-4.5",
    });
    assert.equal(attempt.kind, "lookup");
    assert.equal(attempt.model, "grok-4.5");
    assert.deepEqual(attempt.unchecked, []);
  });

  it("does not invent a receipt when the send never ran", () => {
    assert.deepEqual(receiptsAfterAttempt([], null), []);
  });
});
