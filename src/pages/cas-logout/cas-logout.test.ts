import { describe, expect, it, vi } from "vitest";

import { casLogoutPage, redirectToService, resolveLogoutRedirect } from "./cas-logout";

const LOGOUT_URL = "https://sso.univ-artois.fr/cas/logout";
const ENT_LOGIN_URL = "https://ent.univ-artois.fr/uPortal/Login";

describe("casLogoutPage", () => {
  it("should match the CAS logout page", () => {
    expect(casLogoutPage.match(new URL(LOGOUT_URL))).toBe(true);
    expect(casLogoutPage.match(new URL(`${LOGOUT_URL}/`))).toBe(true);
  });

  it("should ignore other pages", () => {
    expect(casLogoutPage.match(new URL("https://sso.univ-artois.fr/cas/login"))).toBe(false);
    expect(casLogoutPage.match(new URL("https://ent.univ-artois.fr/cas/logout"))).toBe(false);
  });
});

describe("resolveLogoutRedirect", () => {
  it("should redirect to the service URL", () => {
    const url = new URL(`${LOGOUT_URL}?service=${encodeURIComponent(ENT_LOGIN_URL)}`);

    expect(resolveLogoutRedirect(url)).toBe(ENT_LOGIN_URL);
  });

  it("should fall back to the ENT login page without a service", () => {
    expect(resolveLogoutRedirect(new URL(LOGOUT_URL))).toBe(ENT_LOGIN_URL);
  });

  it("should ignore invalid service URLs", () => {
    expect(resolveLogoutRedirect(new URL(`${LOGOUT_URL}?service=not-a-url`))).toBe(ENT_LOGIN_URL);
  });

  it("should ignore external service URLs", () => {
    const url = new URL(`${LOGOUT_URL}?service=${encodeURIComponent("https://example.com/")}`);

    expect(resolveLogoutRedirect(url)).toBe(ENT_LOGIN_URL);
  });

  it("should ignore non-HTTPS service URLs", () => {
    const url = new URL(
      `${LOGOUT_URL}?service=${encodeURIComponent("http://ent.univ-artois.fr/")}`,
    );

    expect(resolveLogoutRedirect(url)).toBe(ENT_LOGIN_URL);
  });
});

describe("redirectToService", () => {
  it("should replace the current location with the resolved target", () => {
    const replace = vi.fn();
    const href = `${LOGOUT_URL}?service=${encodeURIComponent(ENT_LOGIN_URL)}`;

    redirectToService({ href, replace });

    expect(replace).toHaveBeenCalledExactlyOnceWith(ENT_LOGIN_URL);
  });
});
