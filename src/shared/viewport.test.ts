import { beforeEach, describe, expect, it } from "vitest";

import { ensureViewport } from "./viewport";

const VIEWPORT_SELECTOR = 'meta[name="viewport"]';

describe("ensureViewport", () => {
  beforeEach(() => {
    document.querySelectorAll(VIEWPORT_SELECTOR).forEach((meta) => meta.remove());
  });

  it("should add a viewport meta once", () => {
    ensureViewport();
    ensureViewport();

    const metas = document.querySelectorAll(VIEWPORT_SELECTOR);

    expect(metas).toHaveLength(1);
    expect(metas[0]?.getAttribute("content")).toBe("width=device-width, initial-scale=1");
  });

  it("should keep a viewport declared by the page", () => {
    const meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content = "width=1024";
    document.head.append(meta);

    ensureViewport();

    expect(document.querySelectorAll(VIEWPORT_SELECTOR)).toHaveLength(1);
    expect(meta.content).toBe("width=1024");
  });
});
