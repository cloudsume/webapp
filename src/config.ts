export const enum StorageKey {
  // guest
  GuestToken = 'guest.token',
  GuestTOSAcceptance = 'guest.tos-acceptance',

  // settings
  LanguageSetting = 'settings.language',
  NavbarMode = 'settings.navbar-mode',

  // states
  WelcomeDisplayed = 'states.welcome-displayed',
  ResumeEditingDisplayed = 'states.resume-editing-displayed',

  // others
  OidcClientPrefix = 'oidc.'
}

// the value must be synchronized with SCSS variable $grid-breakpoints
export const GridBreakpoints = {
  md: '768px',
  lg: '992px'
};

// the value must be ordered because we use binary search tree on this
export const AllowedTemplateCultures = [
  'en-IN',
  'en-SG',
  'en-TH',
  'en-US'
];

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function getServerURL(): string {
  const url = process.env.SERVER_URI;

  if (url === undefined) {
    throw new Error('No SERVER_URI environment variable has been set.');
  }

  return url;
}

export function getStripeKey(): string {
  const key = process.env.STRIPE_KEY;

  if (key === undefined) {
    throw new Error('No STRIPE_KEY environment variable has been set.');
  }

  return key;
}

export function getCaptchaKey(): string {
  const key = process.env.CAPTCHA_KEY;

  if (key === undefined) {
    throw new Error('No CAPTCHA_KEY environment variable has been set.');
  }

  return key;
}
