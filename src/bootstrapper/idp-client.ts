import { UserManager, WebStorageStateStore } from 'oidc-client';
import { StorageKey } from '@/config';

export function create(): UserManager {
  return new UserManager({
    authority: process.env.OIDC_PROVIDER,
    client_id: '4dcc3953-6c7d-42ed-a642-c6ad84526a8a',
    redirect_uri: process.env.OIDC_REDIRECT_URI,
    response_type: 'code',
    scope: scopes.join(' '),
    post_logout_redirect_uri: process.env.OIDC_SIGNEDOUT_URI,
    userStore: new WebStorageStateStore({ prefix: StorageKey.OidcClientPrefix, store: localStorage }),
    monitorSession: false // this will cause safari to sign user out automatically due to it does not allow iframe to send cookie
  });
}

const scopes = [
  'openid',
  'profile',
  'email',
  'offline_access',
  'cloudsume.payment-receiving-method.read',
  'cloudsume.payment-receiving-method.write',
  'cloudsume.resume.read',
  'cloudsume.resume.write',
  'cloudsume.template.read',
  'cloudsume.template.write',
  'cloudsume.template-license.read',
  'cloudsume.template-license.write'
];
