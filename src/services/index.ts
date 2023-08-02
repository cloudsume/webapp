import type { UserManager } from 'oidc-client';
import type { InjectionKey } from 'vue';
import type VueI18n from 'vue-i18n';
import type VueRouter from 'vue-router';
import type { AlertManager } from '@/alert';
import type { Client } from '@/clients/rest';
import type { ObjectStash } from './object-stash';

export const Alert = Symbol('alert manager') as InjectionKey<AlertManager>;
export const I18n = Symbol('I18N') as InjectionKey<VueI18n>;
export const IDP = Symbol('IDP client') as InjectionKey<UserManager>;
export const REST = Symbol('REST client') as InjectionKey<Client>;
export const Router = Symbol('router') as InjectionKey<VueRouter>;
export const Stash = Symbol('Object stash') as InjectionKey<ObjectStash>;
