import {
  BIcon,
  BIconChevronLeft,
  BIconChevronRight,
  BIconDash,
  BIconEnvelopeFill,
  BIconExclamationTriangleFill,
  BIconEye,
  BIconFacebook,
  BIconGlobe,
  BIconLink,
  BIconPencilSquare,
  BIconPeople,
  BIconPlus,
  BIconSearch,
  BIconThreeDotsVertical,
  BIconTrash,
  BIconXCircleFill,
  BreadcrumbPlugin,
  ButtonPlugin,
  CardPlugin,
  CollapsePlugin,
  DropdownPlugin,
  FormCheckboxPlugin,
  FormFilePlugin,
  FormGroupPlugin,
  FormInputPlugin,
  FormPlugin,
  FormRadioPlugin,
  FormSelectPlugin,
  FormTagsPlugin,
  FormTextareaPlugin,
  ImagePlugin,
  InputGroupPlugin,
  LayoutPlugin,
  LinkPlugin,
  ListGroupPlugin,
  ModalPlugin,
  NavbarPlugin,
  NavPlugin,
  OverlayPlugin,
  SkeletonPlugin,
  SpinnerPlugin,
  TablePlugin,
  TabsPlugin,
  TooltipPlugin,
  VBScrollspyPlugin,
  VBTogglePlugin
} from 'bootstrap-vue';
import PortalVue from 'portal-vue';
import Vue, { Ref } from 'vue';
import VueI18n, { Locale } from 'vue-i18n';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import { isProduction } from '@/config';
import VueAlert from '@/extensions/alert';
import VueDataFetcher from '@/extensions/data-fetcher';
import { getCountryName, getLanguageName, getSubdivisionName } from '@/i18n';

export function init(loading: Ref<number>): void {
  // configure global options
  if (!isProduction()) {
    Vue.config.performance = true;
  }

  // official and external plugins
  Vue.use(PortalVue);
  Vue.use(VueI18n);
  Vue.use(VueRouter);
  Vue.use(Vuex);

  // bootstrap vue
  Vue.use(BreadcrumbPlugin);
  Vue.use(ButtonPlugin);
  Vue.use(CardPlugin);
  Vue.use(CollapsePlugin);
  Vue.use(DropdownPlugin);
  Vue.use(FormCheckboxPlugin);
  Vue.use(FormFilePlugin);
  Vue.use(FormGroupPlugin);
  Vue.use(FormInputPlugin);
  Vue.use(FormPlugin);
  Vue.use(FormRadioPlugin);
  Vue.use(FormSelectPlugin);
  Vue.use(FormTagsPlugin);
  Vue.use(FormTextareaPlugin);
  Vue.use(ImagePlugin);
  Vue.use(InputGroupPlugin);
  Vue.use(LayoutPlugin);
  Vue.use(LinkPlugin);
  Vue.use(ListGroupPlugin);
  Vue.use(ModalPlugin);
  Vue.use(NavbarPlugin);
  Vue.use(NavPlugin);
  Vue.use(OverlayPlugin);
  Vue.use(SkeletonPlugin);
  Vue.use(SpinnerPlugin);
  Vue.use(TablePlugin);
  Vue.use(TabsPlugin);
  Vue.use(TooltipPlugin);
  Vue.use(VBScrollspyPlugin);
  Vue.use(VBTogglePlugin);

  Vue.component('BIcon', BIcon);
  Vue.component('BIconChevronLeft', BIconChevronLeft);
  Vue.component('BIconChevronRight', BIconChevronRight);
  Vue.component('BIconDash', BIconDash);
  Vue.component('BIconEnvelopeFill', BIconEnvelopeFill);
  Vue.component('BIconExclamationTriangleFill', BIconExclamationTriangleFill);
  Vue.component('BIconEye', BIconEye);
  Vue.component('BIconFacebook', BIconFacebook);
  Vue.component('BIconGlobe', BIconGlobe);
  Vue.component('BIconLink', BIconLink);
  Vue.component('BIconPencilSquare', BIconPencilSquare);
  Vue.component('BIconPeople', BIconPeople);
  Vue.component('BIconPlus', BIconPlus);
  Vue.component('BIconSearch', BIconSearch);
  Vue.component('BIconThreeDotsVertical', BIconThreeDotsVertical);
  Vue.component('BIconTrash', BIconTrash);
  Vue.component('BIconXCircleFill', BIconXCircleFill);

  // our plugins
  Vue.use(VueAlert);

  Vue.use(VueDataFetcher, {
    beforeFetch: function () {
      loading.value++;
    },
    fetched: function () {
      loading.value--;
    },
    createCompleted: function () {
      // negate the persistent loading from "beforeCreate"
      loading.value--;
    }
  });

  Vue.mixin({
    beforeCreate: function () {
      const options = this.$options;

      if (options.rest) {
        this.$rest = options.rest;
      } else if (options.parent?.$rest) {
        this.$rest = options.parent.$rest;
      }

      if (options.fetch) {
        // make loading persistence until the first fetching is completed
        loading.value++;
      }
    }
  });

  (VueI18n.prototype as any).l = function (this: VueI18n, t: string, l?: Locale) {
    return getLanguageName(t, l || this.locale);
  };

  (VueI18n.prototype as any).c = function (this: VueI18n, c: string, l?: Locale) {
    return getCountryName(c, l || this.locale);
  };

  (VueI18n.prototype as any).s = function (this: VueI18n, c: string, l?: Locale) {
    return getSubdivisionName(c, l || this.locale);
  };
}
