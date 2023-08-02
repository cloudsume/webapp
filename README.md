# Cloudsumé Web Application

Web Application for using with [Cloudsumé Server](https://github.com/cloudsume/server), written in TypeScript with Vue 2 and Bootstrap 4.

## Build configurations

You can configure the building with the following environment variables:

- `CSM_BASE_URI`: Absolute URL of the web server be host the built.
- `CSM_SERVER_URI`: Absolute URL of the [Cloudsumé Server](https://github.com/cloudsume/server) to use.
- `CSM_OIDC_PROVIDER`: Absolute URL of the OIDC provider to use.
- `CSM_STRIPE_KEY`: The **publishable key** of your Stripe account, **NOT A SECRET KEY!!**
- `CSM_CAPTCHA_KEY`: The **site key** of reCAPTCHA to use, **NOT A SECRET KEY!!**

## Building from source

### Prerequisites

- Node.js
- NPM

### Install dependencies

```sh
npm install
```

### Build the distribution

```sh
npm run build -- --env production --output-path dist
```

`dist` directory will be contains the files that are ready to publish to the web server.

## Development

You can start the development server with the following command:

```sh
npm start
```

Please note that the above environment variables must be set before starting the development server.

### Localize key naming convention

`COMPONENT_NAME.TYPE.NAME`

#### COMPONENT_NAME

Name of the component or page who will use this translation.

#### TYPE

Type of the translation, 2 is available at the moment:

- `label` for the label. The text must not have full stop.
- `message` for the message. The text must have full stop at the end.

#### NAME

Name of the translation.

### Using Bootstrap Sass variables & functions

Just imports `src/styles/_bootstrap.scss` in your `scss` file and you are ready to use any variables and functions from Bootstrap. e.g.

```scss
@import '~@/styles/bootstrap';
```

### Add a new country

- Add country by editing `src/locales/countries.ts`.
- Add divisions by editing `src/locales/subdivisions.ts`.
- Add country flag by editing `src/styles/_config.scss`.
- Updates function `getSubdivisions` in `src/i18n/country.ts`.
- Updates `getPreferredCurrency` in `src/i18n/country.ts`.

### Add a new data property.

- Add a new field to DTO.
- Update `table` in `src/components/data-editor/metadata.ts`.
- Update `src/components/property-viewer` if introduced a new property type.
- Update editor (e.g. `src/components/skill-editor`).

### Add a new template culture

- Update `Languages` in `src/i18n/language.ts`.
- Update `AllowedTemplateCultures` in `src/config.ts`.

### Add a new data type

- Update `src/resume-data/defs.ts`.
- Update `src/components/data-editor/types.ts`.
- Update `table` in `src/components/data-editor/metadata.ts`.
- Update `description` in `src/pages/template-editor/type-item.vue`.
- Update `getDataType` in `src/clients/resume-data/models.ts`.
- Implement an editor then add it to `src/pages/resume-editor/data-card.vue`, `src/pages/global-editor/edit-modal.vue` and `src/pages/sample-data/edit-pane.vue`.
- Update `createImport`, `createFallback` and `createExportedUpdate` in `src/pages/resume-editor/global-modal.vue`.
- Update `format` in `src/components/parent-selector/index.vue`.

### Development notes

- Never invoke `next` in the navigation guard with `false` value due to it will cause loading indicator to show forever. Pass `Error` instead of `false` if you want to abort the navigation. It is the limitation of Vue Router.
- Always use scoped slot instead of normal slot when possible. The reason is scoped slot will be lazy render instead of normal slot that will render alongside the component. That mean it will be a dependency of the component that using it so it will re-render together with that component without causing the component that define it to re-render.

## License

GNU AGPLv3
