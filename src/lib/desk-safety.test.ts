import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mustConfirmClear, sitWithDemoIntent } from "./desk-safety.ts";

describe("sitWithDemoIntent", () => {
  it("loads the demo when the desk is empty", () => {
    assert.equal(
      sitWithDemoIntent({ packet: null, turnCount: 0, keepCount: 0, receiptCount: 0 }),
      "load-demo",
    );
  });

  it("opens the existing empty demo instead of wiping it", () => {
    assert.equal(
      sitWithDemoIntent({
        packet: { source: "demo" },
        turnCount: 0,
        keepCount: 0,
        receiptCount: 0,
      }),
      "open-desk",
    );
  });

  it("asks before replacing a pasted packet", () => {
    assert.equal(
      sitWithDemoIntent({
        packet: { source: "paste" },
        turnCount: 0,
        keepCount: 0,
        receiptCount: 0,
      }),
      "confirm-replace",
    );
  });

  it("asks before replacing a demo that already has a hearing", () => {
    assert.equal(
      sitWithDemoIntent({
        packet: { source: "demo" },
        turnCount: 2,
        keepCount: 0,
        receiptCount: 1,
      }),
      "confirm-replace",
    );
  });
});

describe("mustConfirmClear", () => {
  it("requires confirmation whenever a packet is on the desk", () => {
    assert.equal(mustConfirmClear({ packet: { source: "demo" } }), true);
    assert.equal(mustConfirmClear({ packet: null }), false);
  });
});
