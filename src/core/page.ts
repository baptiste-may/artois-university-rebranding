import { createLogger, type Logger } from "./logger";

export type Step = {
  name: string;
  run: () => void | Promise<void>;
};

export type Page = {
  id: string;
  match: (url: URL) => boolean;
  preflight?: () => void | Promise<void>;
  steps: readonly Step[];
};

export type StepResult = {
  name: string;
  status: "ok" | "failed";
  durationMs: number;
  error?: unknown;
};

export type RunReport = {
  pageId: string;
  status: "ok" | "partial" | "aborted";
  steps: readonly StepResult[];
  error?: unknown;
};

export async function runPage(page: Page, log: Logger = createLogger(page.id)): Promise<RunReport> {
  if (document.documentElement.dataset.rebrandingApplied === page.id) {
    return { pageId: page.id, status: "ok", steps: [] };
  }

  if (page.preflight) {
    try {
      await page.preflight();
    } catch (error) {
      log.error("preflight failed: page left untouched", error);
      return { pageId: page.id, status: "aborted", steps: [], error };
    }
  }

  if (document.documentElement.dataset.rebrandingApplied === page.id) {
    return { pageId: page.id, status: "ok", steps: [] };
  }
  document.documentElement.dataset.rebrandingApplied = page.id;

  const results: StepResult[] = [];

  for (const step of page.steps) {
    const startedAt = performance.now();

    try {
      await step.run();
      const durationMs = Math.round(performance.now() - startedAt);
      log.debug(`✓ ${step.name} (${durationMs} ms)`);
      results.push({ name: step.name, status: "ok", durationMs });
    } catch (error) {
      const durationMs = Math.round(performance.now() - startedAt);
      log.error(`✗ ${step.name} (${durationMs} ms)`, error);
      results.push({ name: step.name, status: "failed", durationMs, error });
    }
  }

  const failed = results.filter((step) => step.status === "failed");
  if (failed.length > 0) {
    log.warn(
      `${failed.length}/${results.length} step(s) failed: ` +
        failed.map((step) => step.name).join(", "),
    );
    return { pageId: page.id, status: "partial", steps: results };
  }

  log.info(`page applied (${results.length} steps)`);
  return { pageId: page.id, status: "ok", steps: results };
}
