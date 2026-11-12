import $ from "jquery";

import { MissingElementError, requireElement } from "../../core/dom";
import type { Page } from "../../core/page";
import { matchers } from "../../core/router";
import { ensureIconSprite } from "../../shared/icons";
import {
  CARD_ATTRIBUTE,
  CARD_SELECTOR,
  ERROR_HEADING_SELECTOR,
  ERROR_ID,
  ERROR_MESSAGE_SELECTOR,
  FORM_ID,
  ROOT_CLASS,
  TITLE_ID,
} from "./cas-login.constants";
import { renderErrorCard, renderFooter, renderForm, renderHeader } from "./cas-login.templates";

type CasVariant = "login" | "error";

function detectCasVariant(): CasVariant {
  if (document.getElementById(FORM_ID)) {
    return "login";
  }

  if (
    document.querySelector(ERROR_HEADING_SELECTOR) &&
    document.querySelector(ERROR_MESSAGE_SELECTOR)
  ) {
    return "error";
  }

  if (document.querySelector(`[${CARD_ATTRIBUTE}] #${ERROR_ID}`)) {
    return "error";
  }

  throw new MissingElementError(
    `#${FORM_ID} ou page d'erreur CAS (${ERROR_HEADING_SELECTOR}, ${ERROR_MESSAGE_SELECTOR})`,
  );
}

function readText(element: Element | null): string {
  return (element?.textContent ?? "").replace(/\s+/g, " ").trim();
}

function readErrorContent(): { title: string; message: string } {
  const title = readText(document.querySelector(ERROR_HEADING_SELECTOR));
  const message = readText(document.querySelector(ERROR_MESSAGE_SELECTOR));

  if (!title || !message) {
    throw new MissingElementError(
      `${ERROR_HEADING_SELECTOR} / ${ERROR_MESSAGE_SELECTOR} (contenu de l'erreur)`,
    );
  }

  return { title, message };
}

function setHelpExpanded(button: HTMLElement, expanded: boolean): void {
  button.setAttribute("aria-expanded", String(expanded));

  const panelId = button.getAttribute("aria-controls");
  if (!panelId) return;

  const panel = document.getElementById(panelId);
  if (panel) {
    panel.hidden = !expanded;
  }

  const input = document.getElementById(panelId.replace(/-help$/, ""));
  if (!input) return;

  const describedBy = new Set(
    (input.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean),
  );

  if (expanded) {
    describedBy.add(panelId);
  } else {
    describedBy.delete(panelId);
  }

  if (describedBy.size > 0) {
    input.setAttribute("aria-describedby", [...describedBy].join(" "));
  } else {
    input.removeAttribute("aria-describedby");
  }
}

function getCard(): HTMLTableElement {
  return requireElement<HTMLTableElement>(CARD_SELECTOR);
}

function getCardBody(): HTMLTableSectionElement {
  const body = getCard().tBodies[0];
  if (!body) {
    throw new MissingElementError("table[background] > tbody");
  }

  return body;
}

function getCardCell(): HTMLTableCellElement {
  const cell = getCard().closest("td");
  if (!cell) {
    throw new MissingElementError("td (conteneur de la carte CAS)");
  }

  return cell;
}

function getForm(): HTMLFormElement {
  return requireElement<HTMLFormElement>(`#${FORM_ID}`);
}

function assertCasLoginShape(): void {
  if (detectCasVariant() === "error") {
    readErrorContent();
    return;
  }

  const form = getForm();
  getCardBody();
  getCardCell();

  if (!form.querySelector("blockquote")) {
    throw new MissingElementError(`#${FORM_ID} blockquote`);
  }

  if (!form.querySelector("#login-form-controls")) {
    throw new MissingElementError("#login-form-controls");
  }
}

function applyBodyTheme(): void {
  const body = requireElement<HTMLBodyElement>("body");

  document.documentElement.classList.add(ROOT_CLASS);
  body.removeAttribute("style");
  body.classList.add("tw:bg-teal-blue", "tw:font-display");

  if (detectCasVariant() === "error") {
    body.classList.add(
      "tw:grid",
      "tw:place-items-center",
      "tw:min-h-screen",
      "tw:m-0",
      "tw:p-4",
      "tw:box-border",
    );
  }
}

function applyCardLayout(): void {
  if (detectCasVariant() !== "login") return;

  const card = getCard();
  const cell = getCardCell();

  // This page only contains layout tables: mask their table semantics for screen readers.
  $("table").attr("role", "presentation");

  $(card)
    .attr(CARD_ATTRIBUTE, "")
    .removeAttr("background width height")
    .addClass("card tw:w-full! tw:max-w-xl!");
  $(cell).removeAttr("height").addClass("tw:px-4 tw:py-8");

  $(card).wrap('<main class="tw:w-full tw:max-w-xl tw:mx-auto"></main>');
}

function injectHeader(): void {
  if (detectCasVariant() !== "login") return;

  $(getCardBody()).prepend(renderHeader());
}

function renderErrorVariant(): void {
  if (detectCasVariant() !== "error") return;

  const { title, message } = readErrorContent();
  document.body.insertAdjacentHTML("beforeend", renderErrorCard(title, message));
  document.querySelector(ERROR_HEADING_SELECTOR)?.remove();
  document.querySelector(ERROR_MESSAGE_SELECTOR)?.remove();
}

function applyFavicon(): void {
  const logo = getCard().querySelector<HTMLImageElement>("img");
  if (!logo) {
    throw new MissingElementError("img (logo de l'université)");
  }

  document.head.querySelectorAll('link[rel~="icon"]').forEach((icon) => icon.remove());
  const icon = document.createElement("link");
  icon.rel = "icon";
  icon.type = "image/png";
  icon.href = logo.src;
  document.head.append(icon);
}

function readStatusText(): string {
  const status = document.getElementById("status");
  if (!status) {
    return "";
  }

  return Array.from(status.childNodes)
    .map((node) => node.textContent ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function replaceFormFields(): void {
  if (detectCasVariant() !== "login") return;

  const $form = $(getForm());
  const error = readStatusText();

  $form.addClass("tw:flex tw:flex-col tw:gap-4 tw:p-6 tw:sm:p-8");
  $form.attr("aria-labelledby", TITLE_ID);
  $form.children("span").remove();
  $form.children("blockquote").replaceWith(renderForm(error));

  $("#status").remove();

  const $error = $(`#${ERROR_ID}`);
  if ($error.length > 0) {
    $error.find(".alert-text").text(error);
  }
}

function bindHelpPanels(): void {
  if (detectCasVariant() !== "login") return;

  const $form = $(getForm());
  const $helpButtons = $form.find(".field-help");

  $form.off("click.rebranding-help").on("click.rebranding-help", ".field-help", (event) => {
    const button = event.currentTarget as HTMLElement;
    const expanded = button.getAttribute("aria-expanded") === "true";

    $helpButtons.each((_, other) => {
      if (other !== button) {
        setHelpExpanded(other, false);
      }
    });

    setHelpExpanded(button, !expanded);
  });

  $(document)
    .off("click.rebranding-help")
    .on("click.rebranding-help", (event) => {
      if ($(event.target).closest(".field-help, .field-help-panel").length > 0) {
        return;
      }

      $helpButtons.each((_, button) => setHelpExpanded(button, false));
    })
    .off("keydown.rebranding-help")
    .on("keydown.rebranding-help", (event) => {
      if (event.key !== "Escape") return;

      const $openHelp = $helpButtons.filter('[aria-expanded="true"]');
      if ($openHelp.length === 0) return;

      event.preventDefault();
      $openHelp.each((_, button) => setHelpExpanded(button, false));
    });
}

function injectFooter(): void {
  if (detectCasVariant() !== "login") return;

  $(getCardBody()).append(renderFooter());
}

function focusFirstField(): void {
  const error = document.getElementById(ERROR_ID);
  if (error) {
    error.focus();
    return;
  }

  document.getElementById("username")?.focus();
}

export const casLoginPage = {
  id: "cas-login",
  match: matchers.all(matchers.host("sso.univ-artois.fr"), matchers.path(/^\/cas\/login\/?$/)),
  preflight: assertCasLoginShape,
  steps: [
    { name: "icons", run: ensureIconSprite },
    { name: "body", run: applyBodyTheme },
    { name: "card-layout", run: applyCardLayout },
    { name: "header", run: injectHeader },
    { name: "error-card", run: renderErrorVariant },
    { name: "favicon", run: applyFavicon },
    { name: "form", run: replaceFormFields },
    { name: "help-panels", run: bindHelpPanels },
    { name: "footer", run: injectFooter },
    { name: "focus", run: focusFirstField },
  ],
} satisfies Page;
