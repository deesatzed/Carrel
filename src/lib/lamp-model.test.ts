import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_LAMP_MODEL, lampModelId } from "./lamp-model.ts";

describe("lampModelId", () => {
  it("defaults to the pinned xAI model when env is empty", () => {
    const prev = process.env.XAI_MODEL;
    const prevVite = process.env.VITE_XAI_MODEL;
    delete process.env.XAI_MODEL;
    delete process.env.VITE_XAI_MODEL;
    try {
      assert.equal(lampModelId(), DEFAULT_LAMP_MODEL);
      assert.equal(DEFAULT_LAMP_MODEL, "grok-4.5");
    } finally {
      if (prev === undefined) delete process.env.XAI_MODEL;
      else process.env.XAI_MODEL = prev;
      if (prevVite === undefined) delete process.env.VITE_XAI_MODEL;
      else process.env.VITE_XAI_MODEL = prevVite;
    }
  });

  it("uses XAI_MODEL when the user set it", () => {
    const prev = process.env.XAI_MODEL;
    process.env.XAI_MODEL = "grok-4";
    try {
      assert.equal(lampModelId(), "grok-4");
    } finally {
      if (prev === undefined) delete process.env.XAI_MODEL;
      else process.env.XAI_MODEL = prev;
    }
  });
});
