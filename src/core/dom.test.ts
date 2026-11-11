import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MissingElementError, requireElement, waitForElement } from "./dom";

describe("requireElement", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should return the matching element", () => {
    document.body.innerHTML = '<div id="target"></div>';

    expect(requireElement("#target").id).toBe("target");
  });

  it("should throw a MissingElementError when the element is absent", () => {
    expect(() => requireElement("#missing")).toThrow(MissingElementError);
  });
});

describe("waitForElement", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should resolve immediately when the element already exists", async () => {
    document.body.innerHTML = '<div id="target"></div>';

    await expect(waitForElement("#target")).resolves.toBe(document.querySelector("#target"));
  });

  it("should resolve when the element is added later", async () => {
    const promise = waitForElement("#late");
    const element = document.createElement("div");
    element.id = "late";
    document.body.append(element);

    await expect(promise).resolves.toBe(element);
  });

  it("should reject when the element never appears", async () => {
    vi.useFakeTimers();
    const promise = waitForElement("#never", { timeoutMs: 50 });
    const assertion = expect(promise).rejects.toBeInstanceOf(MissingElementError);

    await vi.advanceTimersByTimeAsync(60);
    await assertion;
  });
});
