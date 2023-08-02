import { Ref } from 'vue';
import VueRouter from 'vue-router';
import { Store } from 'vuex';
import { NavbarMode } from '@/components/page-header';
import { createRouteTable } from '@/router';
import { AddAlert, ErrorAlert, RemoveAlert, Source, State } from '@/store';

export function create(store: Store<State>, loading: Ref<number>, navbarMode: Ref<NavbarMode>): VueRouter {
  // create router
  const router = new VueRouter({
    mode: 'history',
    linkActiveClass: 'active',
    linkExactActiveClass: 'active',
    routes: createRouteTable(navbarMode),
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition;
      } else {
        return { x: 0, y: 0};
      }
    }
  });

  // subscribe router events
  router.beforeEach(function (to, from, next) {
    // toggle loading and clear all alerts before navigating
    store.commit(new RemoveAlert(Source.App));
    loading.value++;

    next();
  });

  router.afterEach(function () {
    loading.value--;
  });

  router.onError(function (e) {
    const alert = new ErrorAlert('navigate.message.error', e);

    store.commit(new AddAlert(Source.App, alert));
    loading.value--;
  });

  return router;
}
