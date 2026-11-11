import { beforeEach, describe, expect, it } from "vitest";

import { injectStyles } from "./styles";

const STYLE_ID = "artois-rebranding-styles";

describe("injectStyles", () => {
  beforeEach(() => {
    document.getElementById(STYLE_ID)?.remove();
  });

  it("should inject the stylesheet once", () => {
    injectStyles();
    injectStyles();

    const styles = document.querySelectorAll(`#${STYLE_ID}`);

    expect(styles).toHaveLength(1);
    expect(styles[0]?.textContent).toContain(".artois-rebranding");
    expect(styles[0]?.textContent?.match(/@font-face/g)).toHaveLength(1);
    expect(styles[0]?.textContent).toContain("font-weight: 100 900");
    expect(styles[0]?.textContent).toContain("font-display: swap");
  });
});
