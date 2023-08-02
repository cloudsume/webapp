import type { InjectionKey, Ref } from 'vue';
import type { NavbarMode as NavbarModeType } from '@/components/page-header';
import type { Session as SessionType } from './session';

export * from './session';

export const Loading = Symbol('loading') as InjectionKey<Ref<number>>;
export const Locale = Symbol('locale') as InjectionKey<Ref<string>>;
export const NavbarMode = Symbol('navigation bar mode') as InjectionKey<Ref<NavbarModeType>>;
export const Session = Symbol('session') as InjectionKey<Ref<SessionType | null>>;
