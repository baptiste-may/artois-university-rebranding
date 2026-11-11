export class MissingElementError extends Error {
  readonly selector: string;

  constructor(selector: string) {
    super(`Element not found: ${selector}`);
    this.name = "MissingElementError";
    this.selector = selector;
  }
}

export function requireElement<T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document,
): T {
  const element = root.querySelector<T>(selector);
  if (!element) {
    throw new MissingElementError(selector);
  }

  return element;
}

export type WaitForElementOptions = {
  root?: Document | Element;
  timeoutMs?: number;
};

export function waitForElement<T extends Element = HTMLElement>(
  selector: string,
  { root = document, timeoutMs = 5_000 }: WaitForElementOptions = {},
): Promise<T> {
  const existing = root.querySelector<T>(selector);
  if (existing) {
    return Promise.resolve(existing);
  }

  return new Promise<T>((resolve, reject) => {
    let observer: MutationObserver | null = null;

    const timeoutId = window.setTimeout(() => {
      observer?.disconnect();
      reject(new MissingElementError(selector));
    }, timeoutMs);

    observer = new MutationObserver(() => {
      const element = root.querySelector<T>(selector);
      if (!element) {
        return;
      }

      observer?.disconnect();
      window.clearTimeout(timeoutId);
      resolve(element);
    });

    // Child-list mutations only: attribute/class-based waits would need more options.
    observer.observe(root, { childList: true, subtree: true });
  });
}
