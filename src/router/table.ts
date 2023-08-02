import { Ref } from 'vue';
import { RouteConfig } from 'vue-router';
import { NavbarMode } from '@/components/page-header';
import { RouteMeta } from './meta';

export function createRouteTable(navbarMode: Ref<NavbarMode>): RouteConfig[] {
  return [
    {
      name: 'index',
      path: '/',
      redirect: () => ({ name: navbarMode.value === NavbarMode.TemplateAuthoring ? 'account-templates' : 'resume-list' })
    },
    {
      name: 'payment-receiving-methods',
      path: '/account/payment-receiving-methods',
      component: () => import(/* webpackChunkName: "payment-receiving-methods" */ '@/pages/payment-receiving-methods'),
      props: r => ({ setupExpired: r.query['setup-expired'] }),
      meta: new RouteMeta(false)
    },
    {
      name: 'account-templates',
      path: '/account/templates',
      component: () => import(/* webpackChunkName: "account-templates" */ '@/pages/account-templates'),
      meta: new RouteMeta(false)
    },
    {
      name: 'template-editor',
      path: '/account/templates/:id',
      component: () => import(/* webpackChunkName: "template-editor" */ '@/pages/template-editor'),
      props: r => ({ templateId: r.params.id }),
      meta: new RouteMeta(false)
    },
    {
      name: 'edit-global',
      path: '/data',
      component: () => import(/* webpackChunkName: "global-editor" */ '@/pages/global-editor'),
      meta: new RouteMeta(true)
    },
    {
      name: 'resume-list',
      path: '/resumes',
      component: () => import(/* webpackChunkName: "resume-list" */ '@/pages/resume-list'),
      props: r => ({
        purchaseResume: r.query['purchase-resume'],
        stripePayment: r.query['payment_intent'],
        stripeSecret: r.query['payment_intent_client_secret']
      }),
      meta: new RouteMeta(true)
    },
    {
      name: 'edit-resume',
      path: '/resumes/:id',
      component: () => import(/* webpackChunkName: "resume-editor" */ '@/pages/resume-editor'),
      props: r => ({
        resumeId: r.params.id,
        stripePayment: r.query['payment_intent'],
        stripeSecret: r.query['payment_intent_client_secret']
      }),
      meta: new RouteMeta(true)
    },
    {
      name: 'sample-data',
      path: '/sample-data',
      component: () => import(/* webpackChunkName: "sample-data" */ '@/pages/sample-data'),
      meta: new RouteMeta(false)
    },
    {
      name: 'signed-in',
      path: '/signed-in',
      component: () => import(/* webpackChunkName: "signed-in" */ '@/pages/signed-in'),
      meta: new RouteMeta(true)
    },
    {
      name: 'template-list',
      path: '/templates',
      component: () => import(/* webpackChunkName: "template-list" */ '@/pages/template-list'),
      meta: new RouteMeta(true)
    },
    {
      name: 'template-details',
      path: '/templates/:id',
      component: () => import(/* webpackChunkName: "template" */ '@/pages/template'),
      props: r => ({ templateId: r.params.id }),
      meta: new RouteMeta(true)
    },
    {
      name: 'not-found',
      path: '*',
      component: () => import(/* webpackChunkName: "not-found" */ '@/pages/com-not-found'),
      meta: new RouteMeta(true)
    }
  ];
}
