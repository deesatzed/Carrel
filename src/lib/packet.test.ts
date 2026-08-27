import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DEMO_PACKET, DEMO_PACKET_TITLE } from "./demo-packet.ts";
import { buildPacket, isIdentitySection, retrieveExcerpts } from "./packet.ts";

const packet = buildPacket(DEMO_PACKET, "demo", DEMO_PACKET_TITLE);

describe("retrieveExcerpts", () => {
  it("does not fall back to the first sections when nothing matches", () => {
    const excerpts = retrieveExcerpts(packet, "zzzxqnotaword", 5);
    assert.deepEqual(excerpts, []);
  });

  it("does not include the IDENTITY section for a medication question", () => {
    const excerpts = retrieveExcerpts(packet, "What medications are listed?", 5);
    assert.ok(excerpts.length > 0, "expected medication passages");
    assert.equal(
      excerpts.some((e) => /^IDENTITY$/i.test(e.heading)),
      false,
    );
    assert.ok(excerpts.some((e) => /medication/i.test(e.heading)));
  });

  it("does not include IDENTITY for ibuprofen clinic advice", () => {
    const excerpts = retrieveExcerpts(packet, "What did the clinic say about ibuprofen?", 5);
    assert.ok(excerpts.length > 0);
    assert.equal(
      excerpts.some((e) => isIdentitySection(e, packet.identity)),
      false,
    );
  });

  it("may include IDENTITY when the question names record identifiers", () => {
    const excerpts = retrieveExcerpts(packet, "What is Mara Ellison MRN ELL-482917?", 5);
    assert.ok(excerpts.some((e) => /^IDENTITY$/i.test(e.heading)));
  });
});

describe("isIdentitySection", () => {
  it("flags the IDENTITY heading", () => {
    const identity = packet.sections.find((s) => s.heading === "IDENTITY");
    assert.ok(identity);
    assert.equal(isIdentitySection(identity, packet.identity), true);
  });

  it("does not flag MEDICATIONS as identity", () => {
    const meds = packet.sections.find((s) => /MEDICATIONS/i.test(s.heading));
    assert.ok(meds);
    assert.equal(isIdentitySection(meds, packet.identity), false);
  });
});
