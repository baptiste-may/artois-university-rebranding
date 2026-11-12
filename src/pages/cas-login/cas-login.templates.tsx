import { renderToStaticMarkup } from "preact-render-to-string";

import { Icon } from "../../shared/icons";
import logo from "../../shared/logo.png?inline";
import { ERROR_ID, TITLE_ID } from "./cas-login.constants";

type LoginFormProps = {
  error: string;
};

type ErrorAlertProps = {
  title: string;
  message: string;
};

function Header() {
  return (
    <tr>
      <td className="tw:flex tw:flex-col tw:gap-2 tw:items-center tw:justify-center tw:px-6 tw:py-6 tw:text-center tw:border-b tw:border-gray tw:sm:grid tw:sm:grid-cols-[auto_max-content] tw:sm:gap-4 tw:sm:px-8 tw:sm:text-left">
        <img src={logo} alt="Université d'Artois" className="tw:h-12 tw:w-auto" />
        <div>
          <h1
            id={TITLE_ID}
            className="tw:m-0 tw:text-vibrant-orange tw:font-bold tw:text-xl tw:leading-tight"
          >
            Service d'Authentification Artois
          </h1>
          <p className="tw:m-0">Ce service nécessite une authentification</p>
        </div>
      </td>
    </tr>
  );
}

function LoginForm({ error }: LoginFormProps) {
  return (
    <>
      {error && (
        <div
          id={ERROR_ID}
          className="alert alert-error"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          tabIndex={-1}
        >
          <Icon name="alert-triangle" className="tw:shrink-0" />
          <span className="alert-text" />
        </div>
      )}
      <div className="field">
        <div className="field-label">
          <label htmlFor="username">Votre identifiant</label>
          <button
            type="button"
            id="username-help-button"
            className="field-help"
            aria-label="Aide sur l'identifiant"
            aria-expanded="false"
            aria-controls="username-help"
          >
            <Icon name="info" />
          </button>
        </div>
        <input
          id="username"
          name="username"
          placeholder="prenom_nom"
          type="text"
          autocomplete="username"
          autocapitalize="none"
          spellcheck={false}
          aria-describedby={error ? ERROR_ID : undefined}
          aria-invalid={error ? "true" : undefined}
          required
        />
        <div id="username-help" className="field-help-panel" hidden>
          <p className="tw:m-0">
            <b>Personnels :</b> saisissez <b>prenom.nom</b> (ou ce qui précède « @univ-artois.fr »).
          </p>
          <p className="tw:m-0 tw:mt-2">
            <b>Étudiants :</b> saisissez <b>prenom_nom</b> (ou ce qui précède « @ens.univ-artois.fr
            »). Votre adresse complète figure sur votre carte d'étudiant.
          </p>
        </div>
      </div>
      <div className="field">
        <div className="field-label">
          <label htmlFor="password">Votre mot de passe</label>
          <button
            type="button"
            id="password-help-button"
            className="field-help"
            aria-label="Aide sur le mot de passe"
            aria-expanded="false"
            aria-controls="password-help"
          >
            <Icon name="info" />
          </button>
          <a
            href="https://monmotdepasse.univ-artois.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="tw:ml-auto tw:inline-flex tw:min-h-6 tw:items-center tw:text-teal-blue tw:underline tw:underline-offset-2"
          >
            Mot de passe oublié<span className="tw:sr-only"> (nouvel onglet)</span>
          </a>
        </div>
        <input
          id="password"
          name="password"
          placeholder="************"
          type="password"
          autocomplete="current-password"
          aria-describedby={error ? ERROR_ID : undefined}
          aria-invalid={error ? "true" : undefined}
          required
        />
        <div id="password-help" className="field-help-panel" hidden>
          <p className="tw:m-0">
            Il s'agit du mot de passe de votre messagerie électronique. Pour le réinitialiser,
            utilisez le lien « Mot de passe oublié ».
          </p>
        </div>
      </div>
      <label className="field" htmlFor="warn">
        <input id="warn" name="warn" value="true" type="checkbox" />
        Prévenez-moi avant de me connecter à d'autres services
      </label>
      <button type="submit" className="btn btn-vibrant-orange">
        <Icon name="arrow-right" />
        Se connecter
      </button>
    </>
  );
}

function ErrorAlert({ title, message }: ErrorAlertProps) {
  return (
    <tr>
      <td className="tw:p-6 tw:sm:p-8">
        <div
          id={ERROR_ID}
          className="alert alert-error"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          tabIndex={-1}
        >
          <Icon name="alert-triangle" className="tw:shrink-0" />
          <div className="tw:min-w-0">
            <h2 className="tw:m-0 tw:text-lg tw:font-bold">{title}</h2>
            <p className="tw:m-0 tw:mt-2">{message}</p>
          </div>
        </div>
      </td>
    </tr>
  );
}

function Footer() {
  return (
    <tr>
      <td className="tw:px-4 tw:py-2 tw:border-t tw:border-gray">
        <p className="tw:m-0 tw:p-4 tw:text-sm tw:leading-relaxed">
          <span className="tw:inline-flex tw:gap-2 tw:items-start tw:text-vibrant-orange tw:font-bold tw:text-sm tw:mb-2">
            <Icon name="alert-circle" className="tw:size-12 tw:shrink-0" />
            Pour des raisons de sécurité, fermez votre navigateur web après avoir accédé aux
            services protégés !
          </span>
          <br />
          Méfiez-vous de tous les programmes et pages web qui vous demandent de vous authentifier.
          Les pages web de l'Université d'Artois vous demandant votre nom d'utilisateur et votre mot
          de passe ont des URLs de la forme{" "}
          <b className="tw:text-teal-blue">https://sso.univ-artois.fr/cas</b>. De plus, votre
          navigateur doit indiquer que vous accédez à une page sécurisée.
        </p>
      </td>
    </tr>
  );
}

function ErrorCard({ title, message }: ErrorAlertProps) {
  return (
    <main className="tw:w-full tw:max-w-xl tw:mx-auto">
      <table
        className="card tw:w-full! tw:max-w-xl!"
        role="presentation"
        data-rebranding-card="true"
      >
        <tbody>
          <Header />
          <ErrorAlert title={title} message={message} />
          <Footer />
        </tbody>
      </table>
    </main>
  );
}

export function renderHeader(): string {
  return renderToStaticMarkup(<Header />);
}

export function renderForm(error: string): string {
  return renderToStaticMarkup(<LoginForm error={error} />);
}

export function renderErrorCard(title: string, message: string): string {
  return renderToStaticMarkup(<ErrorCard title={title} message={message} />);
}

export function renderFooter(): string {
  return renderToStaticMarkup(<Footer />);
}
