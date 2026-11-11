import interLatinUrl from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?inline";
import appCss from "../style.css?inline";

import { waitForElement } from "../core/dom";

const STYLE_ID = "artois-rebranding-styles";

export function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `@font-face {
  font-family: "Inter Variable";
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("${interLatinUrl}") format("woff2");
}\n${appCss}`;

  if (document.head) {
    document.head.append(style);
    return;
  }

  void waitForElement("head")
    .then((head) => {
      if (!document.getElementById(STYLE_ID)) {
        head.append(style);
      }
    })
    .catch(() => {
      document.documentElement.append(style);
    });
}
