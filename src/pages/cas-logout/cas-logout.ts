import type { Page } from "../../core/page";
import { matchers } from "../../core/router";

const ENT_LOGIN_URL = "https://ent.univ-artois.fr/uPortal/Login";

function isArtoisHost(hostname: string): boolean {
  return hostname === "univ-artois.fr" || hostname.endsWith(".univ-artois.fr");
}

export function resolveLogoutRedirect(url: URL): string {
  const service = url.searchParams.get("service");
  if (!service) {
    return ENT_LOGIN_URL;
  }

  try {
    const target = new URL(service);
    if (target.protocol !== "https:" || !isArtoisHost(target.hostname)) {
      return ENT_LOGIN_URL;
    }

    return target.href;
  } catch {
    return ENT_LOGIN_URL;
  }
}

export function redirectToService(
  location: Pick<Location, "href" | "replace"> = window.location,
): void {
  location.replace(resolveLogoutRedirect(new URL(location.href)));
}

export const casLogoutPage = {
  id: "cas-logout",
  match: matchers.all(matchers.host("sso.univ-artois.fr"), matchers.path(/^\/cas\/logout\/?$/)),
  steps: [{ name: "redirect", run: redirectToService }],
} satisfies Page;
