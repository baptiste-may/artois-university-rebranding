import { beforeEach, describe, expect, it } from "vitest";

import type { Logger } from "../../core/logger";
import { runPage, type RunReport } from "../../core/page";
import { ICON_NAMES, ICON_SPRITE_ID } from "../../shared/icons";
import casLoginHtml from "./__fixtures__/cas-login.html?raw";
import casUnauthorizedHtml from "./__fixtures__/cas-unauthorized.html?raw";
import { casLoginPage } from "./cas-login";

const silentLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

function runCasLogin(): Promise<RunReport> {
  return runPage(casLoginPage, silentLogger);
}

async function runSuccessfulCasLogin(): Promise<void> {
  const report = await runCasLogin();
  expect(report.status).toBe("ok");
}

function getCard(): HTMLTableElement {
  const card = document.querySelector<HTMLTableElement>("table.card");
  if (!card) throw new Error("Login card not found in fixture");
  return card;
}

function getForm(): HTMLFormElement {
  const form = document.querySelector<HTMLFormElement>("#fm1");
  if (!form) throw new Error("Login form not found in fixture");
  return form;
}

describe("casLoginPage", () => {
  beforeEach(() => {
    delete document.documentElement.dataset.rebrandingApplied;
    document.head.querySelectorAll('link[rel~="icon"]').forEach((icon) => icon.remove());
    document.documentElement.classList.remove("artois-rebranding");
    document.body.className = "";
    document.body.setAttribute("style", "background: url('fake.png')");
    document.body.innerHTML = casLoginHtml;
  });

  it("should leave the transformed page unchanged on a second run", async () => {
    await runSuccessfulCasLogin();
    const html = document.body.innerHTML;

    const report = await runCasLogin();

    expect(report.status).toBe("ok");
    expect(report.steps).toEqual([]);
    expect(document.body.innerHTML).toBe(html);
  });

  it("should replace legacy favicons with the university logo", async () => {
    const legacyIcon = document.createElement("link");
    legacyIcon.rel = "shortcut icon";
    legacyIcon.href = "/old-favicon.ico";
    document.head.append(legacyIcon);

    await runSuccessfulCasLogin();
    await runCasLogin();

    const icons = document.head.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]');
    expect(icons).toHaveLength(1);
    expect(icons[0]?.type).toBe("image/png");
    expect(icons[0]?.href).toBe(getCard().querySelector("img")?.src);
    expect(icons[0]?.href).toMatch(/^data:image\/png;base64,/);
    expect(legacyIcon.isConnected).toBe(false);
  });

  it("should style the page and inject an accessible header and footer", async () => {
    const report = await runCasLogin();

    expect(report.status).toBe("ok");
    expect(document.documentElement.classList.contains("artois-rebranding")).toBe(true);
    expect(document.body.classList.contains("tw:bg-teal-blue")).toBe(true);
    expect(document.body.classList.contains("tw:font-display")).toBe(true);
    expect(document.body.hasAttribute("style")).toBe(false);

    const card = getCard();
    expect(card.classList.contains("card")).toBe(true);
    expect(card.classList.contains("tw:w-full!")).toBe(true);
    expect(card.hasAttribute("background")).toBe(false);
    expect(card.getAttribute("role")).toBe("presentation");
    expect(card.closest("main")).not.toBeNull();

    const cell = card.closest("td");
    expect(cell?.hasAttribute("height")).toBe(false);
    expect(cell?.classList.contains("tw:py-8")).toBe(true);

    expect(document.querySelector("h1#login-title")?.textContent).toContain(
      "Service d'Authentification Artois",
    );
    expect(card.querySelectorAll("tbody > tr")).toHaveLength(3);
    expect(card.querySelector('img[alt="Université d\'Artois"]')).not.toBeNull();
    expect(card.textContent).toContain("Pour des raisons de sécurité");
    expect(document.querySelectorAll("table:not([role='presentation'])")).toHaveLength(0);

    expect(document.querySelector(`#${ICON_SPRITE_ID}`)).not.toBeNull();
    expect(document.querySelectorAll(`#${ICON_SPRITE_ID} symbol`)).toHaveLength(ICON_NAMES.length);
    expect(card.querySelector("#username-help-button use")?.getAttribute("href")).toBe(
      "#artois-icon-info",
    );
    expect(card.querySelector("button[type='submit'] use")?.getAttribute("href")).toBe(
      "#artois-icon-arrow-right",
    );
    expect(card.querySelector('use[href="#artois-icon-alert-circle"]')).not.toBeNull();
  });

  it("should replace the form content with accessible fields", async () => {
    await runSuccessfulCasLogin();

    const form = getForm();
    const directChildren = Array.from(form.children);

    expect(directChildren.some((child) => child.tagName === "SPAN")).toBe(false);
    expect(form.querySelector("blockquote")).toBeNull();
    expect(form.classList.contains("tw:flex")).toBe(true);
    expect(form.getAttribute("aria-labelledby")).toBe("login-title");
    expect(form.querySelector("label[for='username']")).not.toBeNull();
    expect(form.querySelector("label[for='password']")).not.toBeNull();
    expect(form.querySelector("label.field[for='username']")).toBeNull();
    expect(form.querySelector("#username")).not.toBeNull();
    expect(form.querySelector("#password")).not.toBeNull();
    expect(form.querySelector("#warn")).not.toBeNull();
    expect(form.querySelector("button[type='submit']")).not.toBeNull();
    expect(form.querySelector("#login-form-controls")).not.toBeNull();
    expect(form.querySelector('input[name="_eventId"]')?.getAttribute("value")).toBe("submit");
    expect(form.querySelectorAll("svg:not([aria-hidden='true'])")).toHaveLength(0);
  });

  it("should expose field purposes", async () => {
    await runSuccessfulCasLogin();

    const form = getForm();
    const username = form.querySelector<HTMLInputElement>("#username");
    const password = form.querySelector<HTMLInputElement>("#password");
    const warn = form.querySelector<HTMLInputElement>("#warn");

    expect(username?.getAttribute("autocomplete")).toBe("username");
    expect(password?.getAttribute("autocomplete")).toBe("current-password");
    expect(username?.name).toBe("username");
    expect(password?.name).toBe("password");
    expect(password?.type).toBe("password");
    expect(username?.placeholder).toBe("prenom_nom");
    expect(password?.placeholder).toBe("************");
    expect(username?.hasAttribute("aria-describedby")).toBe(false);
    expect(password?.hasAttribute("aria-describedby")).toBe(false);
    expect(username?.required).toBe(true);
    expect(password?.required).toBe(true);
    expect(warn?.value).toBe("true");
    expect(warn?.checked).toBe(false);
    expect(warn?.hasAttribute("checked")).toBe(false);
    expect(form.querySelector(".field-hint")).toBeNull();
  });

  it("should keep the password recovery link outside the field label", async () => {
    await runSuccessfulCasLogin();

    const form = getForm();
    const passwordLabel = form.querySelector("label[for='password']");
    const recoveryLink = form.querySelector<HTMLAnchorElement>(
      'a[href="https://monmotdepasse.univ-artois.fr"]',
    );

    expect(passwordLabel?.querySelector("a")).toBeNull();
    expect(recoveryLink).not.toBeNull();
    expect(recoveryLink?.target).toBe("_blank");
    expect(recoveryLink?.rel).toBe("noopener noreferrer");
    expect(recoveryLink?.textContent).toContain("(nouvel onglet)");
    expect(form.querySelectorAll('[tabindex="1"], [tabindex="2"], [tabindex="3"]')).toHaveLength(0);
    expect(form.querySelectorAll("[accesskey]")).toHaveLength(0);
  });

  it("should toggle accessible help panels for each field", async () => {
    await runSuccessfulCasLogin();

    const form = getForm();
    const username = form.querySelector<HTMLInputElement>("#username");
    const password = form.querySelector<HTMLInputElement>("#password");
    const usernameButton = form.querySelector<HTMLButtonElement>("#username-help-button");
    const passwordButton = form.querySelector<HTMLButtonElement>("#password-help-button");
    const usernamePanel = document.querySelector<HTMLElement>("#username-help");
    const passwordPanel = document.querySelector<HTMLElement>("#password-help");

    expect(usernameButton?.getAttribute("aria-label")).toBe("Aide sur l'identifiant");
    expect(passwordButton?.getAttribute("aria-label")).toBe("Aide sur le mot de passe");
    expect(usernameButton?.getAttribute("aria-expanded")).toBe("false");
    expect(usernamePanel?.hidden).toBe(true);
    expect(usernamePanel?.textContent).toContain("@ens.univ-artois.fr");
    expect(passwordPanel?.textContent).toContain("messagerie");
    expect(username?.hasAttribute("aria-describedby")).toBe(false);
    expect(password?.hasAttribute("aria-describedby")).toBe(false);

    usernameButton?.click();

    expect(usernameButton?.getAttribute("aria-expanded")).toBe("true");
    expect(usernamePanel?.hidden).toBe(false);
    expect(username?.getAttribute("aria-describedby")).toBe("username-help");

    passwordButton?.click();

    expect(usernameButton?.getAttribute("aria-expanded")).toBe("false");
    expect(usernamePanel?.hidden).toBe(true);
    expect(passwordButton?.getAttribute("aria-expanded")).toBe("true");
    expect(passwordPanel?.hidden).toBe(false);
    expect(username?.hasAttribute("aria-describedby")).toBe(false);
    expect(password?.getAttribute("aria-describedby")).toBe("password-help");

    passwordButton?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

    expect(passwordButton?.getAttribute("aria-expanded")).toBe("false");
    expect(passwordPanel?.hidden).toBe(true);
    expect(password?.hasAttribute("aria-describedby")).toBe(false);

    passwordButton?.click();
    expect(passwordPanel?.hidden).toBe(false);
    expect(password?.getAttribute("aria-describedby")).toBe("password-help");

    document.body.click();
    expect(passwordPanel?.hidden).toBe(true);
    expect(password?.hasAttribute("aria-describedby")).toBe(false);
  });

  it("should display and announce the error returned by CAS", async () => {
    // CAS only adds #status when authentication fails.
    const status = document.createElement("div");
    status.id = "status";
    status.innerHTML = "<strong>Échec de l'authentification</strong><p>Identifiants invalides</p>";
    document.body.append(status);

    await runSuccessfulCasLogin();

    const form = getForm();
    const alert = document.querySelector("#login-error");
    const username = form.querySelector("#username");
    const usernameButton = form.querySelector<HTMLButtonElement>("#username-help-button");
    const password = form.querySelector("#password");

    expect(document.querySelector("#status")).toBeNull();
    expect(alert?.getAttribute("role")).toBe("alert");
    expect(alert?.getAttribute("aria-live")).toBe("assertive");
    expect(alert?.getAttribute("aria-atomic")).toBe("true");
    expect(alert?.classList.contains("alert-error")).toBe(true);
    expect(alert?.querySelector("use")?.getAttribute("href")).toBe("#artois-icon-alert-triangle");
    expect(alert?.querySelector(".alert-text")?.textContent).toBe(
      "Échec de l'authentification Identifiants invalides",
    );
    expect(document.activeElement?.id).toBe("login-error");
    expect(username?.getAttribute("aria-invalid")).toBe("true");
    expect(password?.getAttribute("aria-invalid")).toBe("true");
    expect(username?.getAttribute("aria-describedby")).toBe("login-error");
    expect(password?.getAttribute("aria-describedby")).toBe("login-error");

    usernameButton?.click();

    expect(username?.getAttribute("aria-describedby")).toBe("login-error username-help");
  });

  it("should not display an alert without an error message", async () => {
    await runSuccessfulCasLogin();

    const form = getForm();
    const password = form.querySelector("#password");

    expect(document.querySelector(".alert")).toBeNull();
    expect(document.activeElement?.id).toBe("username");
    expect(form.querySelector("#username")?.hasAttribute("aria-invalid")).toBe(false);
    expect(password?.hasAttribute("aria-invalid")).toBe(false);
  });

  it("should rebrand the unauthorized-service page with the shared card shell", async () => {
    document.body.innerHTML = casUnauthorizedHtml;

    const report = await runCasLogin();

    expect(report.status).toBe("ok");
    expect(document.documentElement.classList.contains("artois-rebranding")).toBe(true);
    expect(document.body.classList.contains("tw:bg-teal-blue")).toBe(true);
    expect(document.body.classList.contains("tw:font-display")).toBe(true);
    expect(document.body.classList.contains("tw:grid")).toBe(true);
    expect(document.body.classList.contains("tw:place-items-center")).toBe(true);
    expect(document.body.classList.contains("tw:min-h-screen")).toBe(true);
    expect(document.body.hasAttribute("style")).toBe(false);
    expect(document.querySelector("body > h2")).toBeNull();
    expect(document.querySelector("body > p")).toBeNull();

    const card = getCard();
    expect(card.closest("main")).not.toBeNull();
    expect(card.getAttribute("role")).toBe("presentation");
    expect(card.querySelectorAll("tbody > tr")).toHaveLength(3);
    expect(card.querySelector("h1#login-title")?.textContent).toContain(
      "Service d'Authentification Artois",
    );
    expect(card.textContent).toContain("Pour des raisons de sécurité");
    expect(card.querySelector("form")).toBeNull();

    const alert = card.querySelector("#login-error");
    expect(alert?.getAttribute("role")).toBe("alert");
    expect(alert?.getAttribute("aria-live")).toBe("assertive");
    expect(alert?.getAttribute("aria-atomic")).toBe("true");
    expect(alert?.classList.contains("alert-error")).toBe(true);
    expect(alert?.querySelector("h2")?.textContent).toBe(
      "Application non autorisée à utiliser CAS",
    );
    expect(alert?.querySelector("p")?.textContent).toContain("n'est pas autorisée à utiliser CAS");
    expect(alert?.querySelector("use")?.getAttribute("href")).toBe("#artois-icon-alert-triangle");
    expect(document.activeElement?.id).toBe("login-error");

    const icons = document.head.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]');
    expect(icons).toHaveLength(1);
    expect(icons[0]?.href).toBe(card.querySelector("img")?.src);
  });

  it("should abort the error variant when its message is missing", async () => {
    const html = "<h2>Application non autorisée à utiliser CAS</h2>";
    document.body.innerHTML = html;

    const report = await runCasLogin();

    expect(report.status).toBe("aborted");
    expect(document.body.innerHTML).toBe(html);
    expect(document.body.classList.contains("tw:bg-teal-blue")).toBe(false);
    expect(document.documentElement.classList.contains("artois-rebranding")).toBe(false);
  });

  it("should abort without touching the page when the expected structure is missing", async () => {
    document.body.innerHTML = "";

    const report = await runCasLogin();

    expect(report.status).toBe("aborted");
    expect(report.error).toBeInstanceOf(Error);
    expect(document.body.innerHTML).toBe("");
    expect(document.body.classList.contains("tw:bg-teal-blue")).toBe(false);
    expect(document.documentElement.classList.contains("artois-rebranding")).toBe(false);
  });
});
