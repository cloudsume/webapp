// polyfills
import 'reflect-metadata';
import './polyfills';

// modules
import Vue, { ref, Ref, watch } from 'vue';
import VueRouter from 'vue-router';
import { AlertManager } from '@/alert';
import { Client, ClientKey } from '@/clients/rest';
import Footer from '@/components/page-footer';
import Header, { NavbarMode as NavbarModeValue } from '@/components/page-header';
import { getServerURL, StorageKey } from '@/config';
import { Alert, I18n, IDP, REST, Router, Stash } from '@/services';
import { ObjectStash } from '@/services/object-stash';
import { Loading, Locale, NavbarMode, Session } from '@/state';
import { GuestAccount, Session as SessionData } from '@/state/session';
import { AddAlert, ErrorAlert, Payload, RefreshSession, SetSession, Source } from '@/store';
import { init as initCaptcha } from './captcha';
import { create as createI18n } from './i18n';
import { create as createIdpClient } from './idp-client';
import { init as initJsonMapper } from './json-mapper';
import { create as createRouter } from './router';
import { create as createStore } from './store';
import { init as initVue } from './vue';

export async function bootstrap(): Promise<void> {
  // initialize app settings
  const loading = ref(0);
  const navbarMode = ref(localStorage.getItem(StorageKey.NavbarMode) as NavbarModeValue || NavbarModeValue.ResumeBuilder);

  watch(navbarMode, function (v) {
    try {
      localStorage.setItem(StorageKey.NavbarMode, v);
    } catch (e) {
      console.warn('Cannot write navigation bar mode: ', e);
    }
  });

  // initialize libraries
  initJsonMapper();
  await initCaptcha();
  initVue(loading);

  // initialize application modules
  const stash = new ObjectStash();
  const idp = createIdpClient();
  const store = createStore(idp);
  const i18n = await createI18n(store);
  const alert = new AlertManager(store);

  // proxy locale setting
  const locale = ref(store.state.locale);

  store.watch(s => s.locale, v => locale.value = v);

  // setup rest client
  const rest = new Client(getServerURL(), locale);

  // listen for mutation
  store.subscribe(m => {
    const p = m.payload as Payload;

    if (p instanceof SetSession) {
      rest.accessToken = p.session?.accessToken;
    }
  });

  // renew access token automatically before it expire
  idp.events.addAccessTokenExpiring(async function () {
    let release, account;

    try {
      // on mobile browser the timer will be suspended when it is not active so we need mutex here to prevent the
      // client from accessing the expired token when it was timeout while browser is not active
      release = await rest.mutex.acquire();
      account = await idp.getUser();

      if (account?.refresh_token) {
        account = await idp.signinSilent();
      } else {
        account = null;
      }

      // create session
      let session;

      if (account) {
        session = new SessionData(GuestAccount.load(), account);
      } else {
        // do not load guest session to confuse the user
        session = null;
      }

      store.commit(new SetSession(Source.App, session));
    } catch (e) {
      const alert = new ErrorAlert('renew-token.message.error', e as Error);
      const mutation = new AddAlert(Source.App, alert);
      store.commit(mutation);
      return;
    } finally {
      if (release !== undefined) {
        release();
      }
    }

    if (!account) {
      window.location.replace('/');
    }
  });

  // now the renew token handler has been setting up we can load the session
  await store.dispatch(new RefreshSession(Source.App));

  // proxy composition api to vuex until we get rid of vuex
  const session: Ref<SessionData | null> = ref(null);

  session.value = store.state.session; // we cannot assign it via ref somehow

  store.watch(s => s.session, v => session.value = v);

  // load top-level components
  let main: typeof Vue;
  let router: VueRouter | undefined;

  if (store.state.session || location.pathname && location.pathname !== '/') {
    main = (await import(/* webpackChunkName: "page-router" */ '@/components/page-router')).default;
    router = createRouter(store, loading, navbarMode);
  } else {
    main = (await import(/* webpackChunkName: "landing" */ '@/pages/landing')).default;
  }

  // render application
  const render = (el: string, component: typeof Vue, props?: object) => {
    const provide: { [k: symbol]: any } = {};

    // states
    provide[Loading as symbol] = loading;
    provide[Locale as symbol] = locale;
    provide[NavbarMode as symbol] = navbarMode;
    provide[Session as symbol] = session;

    // services
    provide[Alert as symbol] = alert;
    provide[I18n as symbol] = i18n;
    provide[IDP as symbol] = idp;
    provide[REST as symbol] = rest;
    provide[ClientKey as symbol] = rest;
    provide[Stash as symbol] = stash;

    if (router) {
      provide[Router as symbol] = router;
    }

    return new Vue({
      el,
      store,
      router,
      i18n,
      rest,
      provide,
      render: function (h) {
        return h(component, { props });
      }
    });
  };

  render('#header', Header);
  render('#main', main);
  render('#footer', Footer);
}
