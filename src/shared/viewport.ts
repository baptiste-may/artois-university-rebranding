import { waitForElement } from "../core/dom";

export function ensureViewport(): void {
  if (document.querySelector('meta[name="viewport"]')) {
    return;
  }

  const meta = document.createElement("meta");
  meta.name = "viewport";
  meta.content = "width=device-width, initial-scale=1";

  if (document.head) {
    document.head.append(meta);
    return;
  }

  void waitForElement("head")
    .then((head) => {
      if (!document.querySelector('meta[name="viewport"]')) {
        head.append(meta);
      }
    })
    .catch(() => {
      document.documentElement.append(meta);
    });
}
