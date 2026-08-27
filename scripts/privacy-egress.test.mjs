import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Carrel first paint does not call Google Fonts", () => {
  it("does not preconnect or stylesheet-load fonts.googleapis.com / fonts.gstatic.com", () => {
    const head = readFileSync(join(root, "src/routes/__root.tsx"), "utf8");
    assert.equal(head.includes("fonts.googleapis.com"), false);
    assert.equal(head.includes("fonts.gstatic.com"), false);
  });
});
