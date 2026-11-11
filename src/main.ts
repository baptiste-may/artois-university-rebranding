import { createLogger } from "./core/logger";
import { runPage } from "./core/page";
import { resolvePage } from "./core/router";
import { pages } from "./pages";
import { ensurePageLanguage } from "./shared/a11y";
import { injectStyles } from "./shared/styles";
import { ensureViewport } from "./shared/viewport";

const log = createLogger("app");
const page = resolvePage(pages);

if (page) {
  ensureViewport();
  ensurePageLanguage();

  try {
    injectStyles();
  } catch (error) {
    log.error("styles not injected", error);
  }
}

function start(): void {
  if (!page) {
    log.debug("no supported page");
    return;
  }

  void runPage(page).catch((error) => {
    log.error("page execution failed", error);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
