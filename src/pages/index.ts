import type { Page } from "../core/page";
import { casLoginPage } from "./cas-login/cas-login";
import { casLogoutPage } from "./cas-logout/cas-logout";

export const pages: readonly Page[] = [casLoginPage, casLogoutPage];
