import { beforeEach, describe, expect, it } from "vitest";

import { ensurePageLanguage } from "./a11y";

describe("ensurePageLanguage", () => {
  beforeEach(() => {
    document.documentElement.lang = "";
  });

  it("should declare French when the page has no language", () => {
    ensurePageLanguage();

    expect(document.documentElement.lang).toBe("fr");
  });

  it("should keep a language explicitly set by the page", () => {
    document.documentElement.lang = "en";

    ensurePageLanguage();

    expect(document.documentElement.lang).toBe("en");
  });
});
