import { renderToStaticMarkup } from "preact-render-to-string";

import alertCircleIcon from "./papicons/alert-circle.svg?raw";
import alertTriangleIcon from "./papicons/alert-triangle.svg?raw";
import arrowRightIcon from "./papicons/arrow-right.svg?raw";
import infoIcon from "./papicons/info.svg?raw";

export const ICON_SPRITE_ID = "artois-icon-sprite";

const SPRITE_PREFIX = "artois-icon-";

const icons = {
  "alert-circle": alertCircleIcon,
  "alert-triangle": alertTriangleIcon,
  "arrow-right": arrowRightIcon,
  info: infoIcon,
} as const;

export type IconName = keyof typeof icons;

export const ICON_NAMES: readonly IconName[] = Object.keys(icons) as IconName[];

type IconProps = {
  name: IconName;
  className?: string;
};

type IconDefinition = {
  name: IconName;
  viewBox: string;
  content: string;
};

function toIconDefinition(name: IconName, svg: string): IconDefinition {
  const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1] ?? "0 0 24 24";
  const content = svg
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .trim();

  return { name, viewBox, content };
}

const iconDefinitions = ICON_NAMES.map((name) => toIconDefinition(name, icons[name]));

export function Icon({ name, className }: IconProps) {
  return (
    <svg className={className} width="24" height="24" aria-hidden="true" focusable="false">
      <use href={`#${SPRITE_PREFIX}${name}`} />
    </svg>
  );
}

export function renderIcon(name: IconName, className?: string): string {
  return renderToStaticMarkup(<Icon name={name} className={className} />);
}

export function renderIconSprite(): string {
  const symbols = iconDefinitions
    .map(
      ({ name, viewBox, content }) =>
        `<symbol id="${SPRITE_PREFIX}${name}" viewBox="${viewBox}">${content}</symbol>`,
    )
    .join("");

  return `<svg id="${ICON_SPRITE_ID}" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;overflow:hidden">${symbols}</svg>`;
}

export function ensureIconSprite(): void {
  if (document.getElementById(ICON_SPRITE_ID)) {
    return;
  }

  if (!document.body) {
    throw new Error("Cannot inject the icon sprite before document.body exists");
  }

  const template = document.createElement("template");
  template.innerHTML = renderIconSprite();

  const sprite = template.content.firstElementChild;
  if (sprite) {
    document.body.prepend(sprite);
  }
}
