import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Logger } from "./logger";
import { runPage, type Page } from "./page";

const silentLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

describe("runPage", () => {
  beforeEach(() => {
    delete document.documentElement.dataset.rebrandingApplied;
  });

  it("should apply a page only once, including concurrent calls", async () => {
    const run = vi.fn();
    const preflight = vi.fn(async () => {});
    const page: Page = {
      id: "test",
      match: () => true,
      preflight,
      steps: [{ name: "first", run }],
    };

    await Promise.all([runPage(page, silentLogger), runPage(page, silentLogger)]);
    const report = await runPage(page, silentLogger);

    expect(run).toHaveBeenCalledOnce();
    expect(preflight).toHaveBeenCalledTimes(2);
    expect(report.steps).toEqual([]);
    expect(document.documentElement.dataset.rebrandingApplied).toBe("test");
  });

  it("should allow retrying after a failed preflight", async () => {
    const run = vi.fn();
    const page: Page = {
      id: "test",
      match: () => true,
      preflight: vi.fn().mockRejectedValueOnce(new Error("not ready")),
      steps: [{ name: "first", run }],
    };

    expect((await runPage(page, silentLogger)).status).toBe("aborted");
    expect(document.documentElement.dataset.rebrandingApplied).toBeUndefined();
    expect((await runPage(page, silentLogger)).status).toBe("ok");
    expect(run).toHaveBeenCalledOnce();
  });

  it("should run every step in order", async () => {
    const first = vi.fn();
    const second = vi.fn();
    const page: Page = {
      id: "test",
      match: () => true,
      steps: [
        { name: "first", run: first },
        { name: "second", run: second },
      ],
    };

    const report = await runPage(page, silentLogger);

    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
    expect(report.status).toBe("ok");
    expect(report.steps.map((step) => step.status)).toEqual(["ok", "ok"]);
  });

  it("should keep running when a step fails", async () => {
    const next = vi.fn();
    const page: Page = {
      id: "test",
      match: () => true,
      steps: [
        {
          name: "broken",
          run: () => {
            throw new Error("boom");
          },
        },
        { name: "next", run: next },
      ],
    };

    const report = await runPage(page, silentLogger);

    expect(next).toHaveBeenCalledOnce();
    expect(report.status).toBe("partial");
    expect(report.steps.map((step) => step.status)).toEqual(["failed", "ok"]);
    expect(report.steps[0]?.error).toBeInstanceOf(Error);
  });

  it("should abort before running any step when preflight fails", async () => {
    const run = vi.fn();
    const page: Page = {
      id: "test",
      match: () => true,
      preflight: () => {
        throw new Error("unexpected page");
      },
      steps: [{ name: "first", run }],
    };

    const report = await runPage(page, silentLogger);

    expect(run).not.toHaveBeenCalled();
    expect(report.status).toBe("aborted");
    expect(report.error).toBeInstanceOf(Error);
  });
});
