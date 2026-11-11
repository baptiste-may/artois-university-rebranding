import type { Page } from "./page";

export type UrlMatcher = (url: URL) => boolean;

export function resolvePage(
  pages: readonly Page[],
  url = new URL(window.location.href),
): Page | undefined {
  return pages.find((page) => page.match(url));
}

export const matchers = {
  host:
    (hostname: string): UrlMatcher =>
    (url) =>
      url.hostname === hostname,
  path: (pattern: RegExp): UrlMatcher => {
    const statelessPattern = new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, ""));
    return (url) => statelessPattern.test(url.pathname);
  },
  all:
    (...predicates: UrlMatcher[]): UrlMatcher =>
    (url) =>
      predicates.every((predicate) => predicate(url)),
};
