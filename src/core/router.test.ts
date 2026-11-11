import { describe, expect, it } from "vitest";

import { casLoginPage } from "../pages/cas-login/cas-login";
import type { Page } from "./page";
import { matchers, resolvePage } from "./router";

describe("resolvePage", () => {
  it("should resolve a supported page", () => {
    const page = resolvePage([casLoginPage], new URL("https://sso.univ-artois.fr/cas/login"));

    expect(page).toBe(casLoginPage);
  });

  it("should ignore unsupported paths on the same host", () => {
    const page = resolvePage([casLoginPage], new URL("https://sso.univ-artois.fr/cas/logout"));

    expect(page).toBeUndefined();
  });

  it("should ignore the same path on another host", () => {
    const page = resolvePage([casLoginPage], new URL("https://ent.univ-artois.fr/cas/login"));

    expect(page).toBeUndefined();
  });

  it("should return the first matching page", () => {
    const genericPage: Page = { id: "generic", match: () => true, steps: [] };

    const page = resolvePage(
      [casLoginPage, genericPage],
      new URL("https://sso.univ-artois.fr/cas/login"),
    );

    expect(page).toBe(casLoginPage);
  });

  it("should support stateful regular expressions", () => {
    const matcher = matchers.path(/^\/cas\/login\/?$/g);
    const url = new URL("https://sso.univ-artois.fr/cas/login");

    expect(matcher(url)).toBe(true);
    expect(matcher(url)).toBe(true);
  });
});
