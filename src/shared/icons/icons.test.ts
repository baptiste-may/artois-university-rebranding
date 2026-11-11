import { beforeEach, describe, expect, it } from "vitest";

import {
  ICON_NAMES,
  ICON_SPRITE_ID,
  ensureIconSprite,
  renderIcon,
  renderIconSprite,
} from "./index";

function parseSprite(markup: string): HTMLElement {
  const container = document.createElement("div");
  container.innerHTML = markup;
  return container;
}

describe("icons", () => {
  beforeEach(() => {
    document.getElementById(ICON_SPRITE_ID)?.remove();
  });

  it("should render an icon reference", () => {
    const markup = renderIcon("info", "tw:size-6");

    expect(markup).toContain('class="tw:size-6"');
    expect(markup).toContain('href="#artois-icon-info"');
    expect(markup).toContain('aria-hidden="true"');
  });

  it("should inject the sprite once", () => {
    ensureIconSprite();
    ensureIconSprite();

    const sprites = document.querySelectorAll(`#${ICON_SPRITE_ID}`);

    expect(sprites).toHaveLength(1);
    expect(sprites[0]?.querySelectorAll("symbol")).toHaveLength(ICON_NAMES.length);
  });

  it("should expose every icon with a paint", () => {
    const container = parseSprite(renderIconSprite());

    for (const name of ICON_NAMES) {
      const symbol = container.querySelector(`#artois-icon-${name}`);

      expect(symbol).not.toBeNull();
      expect(symbol?.getAttribute("viewBox")).toBe("0 0 24 24");
      expect(symbol?.querySelector("path")?.getAttribute("fill")).toBe("currentColor");
    }
  });

  it("should fail loudly when the body is missing", () => {
    const body = document.body;
    body.remove();

    try {
      expect(() => ensureIconSprite()).toThrow("document.body");
    } finally {
      document.documentElement.append(body);
    }
  });
});
