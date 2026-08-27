import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DEMO_PACKET, DEMO_PACKET_TITLE } from "./demo-packet.ts";
import { buildPacket, draftCallSlip } from "./packet.ts";
import { inventedIdentifiers, slipPiiHits } from "./slip-guard.ts";

const packet = buildPacket(DEMO_PACKET, "demo", DEMO_PACKET_TITLE);

describe("slipPiiHits", () => {
  it("allows a slip after names have been struck", () => {
    const slip = draftCallSlip("Is ibuprofen safe for Mara Ellison?", packet);
    assert.equal(slipPiiHits(slip.cleaned, packet).length, 0);
  });

  it("blocks a slip that still names the person", () => {
    const hits = slipPiiHits("Is ibuprofen safe for Mara Ellison?", packet);
    assert.ok(hits.some((h) => /name/i.test(h.reason)));
    assert.ok(hits.some((h) => /mara|ellison/i.test(h.term)));
  });

  it("blocks a slip that still carries a phone number", () => {
    const hits = slipPiiHits("Call 215-555-0148 about NSAIDs.", packet);
    assert.ok(hits.some((h) => h.reason === "phone"));
  });

  it("blocks a record number that was pasted back in", () => {
    const hits = slipPiiHits("Please look up ELL-482917 and ibuprofen.", packet);
    assert.ok(hits.some((h) => /record/i.test(h.reason)));
  });

  it("allows a general clinical question with no identifiers", () => {
    const hits = slipPiiHits(
      "Is ibuprofen a problem with apixaban, CKD, and heart failure?",
      packet,
    );
    assert.deepEqual(hits, []);
  });
});

describe("inventedIdentifiers", () => {
  const meds = {
    id: "sec-meds",
    heading: "MEDICATIONS",
    text: "Apixaban 5 mg by mouth twice daily. Clinic note: avoid NSAIDs because of CKD.",
    start: 0,
  };

  it("flags a name that was not in the approved pages", () => {
    const hits = inventedIdentifiers(
      "Mara Ellison should avoid ibuprofen with apixaban.",
      [meds],
      packet.identity,
    );
    assert.ok(hits.length > 0);
    assert.ok(hits.some((h) => /mara|ellison/i.test(h.term)));
  });

  it("allows quoting a name that was on an approved page", () => {
    const identityPage = {
      id: "sec-id",
      heading: "IDENTITY",
      text: "Name: Mara Juniper Ellison\nMRN: ELL-482917 (synthetic)",
      start: 0,
    };
    const hits = inventedIdentifiers(
      "The packet lists Mara Ellison. Apixaban is on the medication list.",
      [identityPage, meds],
      packet.identity,
    );
    assert.deepEqual(hits, []);
  });

  it("allows an answer that stays inside the approved medication page", () => {
    const hits = inventedIdentifiers(
      "Apixaban 5 mg twice daily. Avoid NSAIDs because of CKD. This is a reading of the packet, not medical advice.",
      [meds],
      packet.identity,
    );
    assert.deepEqual(hits, []);
  });
});
