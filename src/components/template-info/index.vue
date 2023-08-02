<template>
  <ul class="list-unstyled">
    <!-- website -->
    <li v-if="website" class="text-truncate">
      <BIconHouseDoor></BIconHouseDoor>
      <a :href="website" target="_blank">{{ website }}</a>
    </li>
    <!-- category -->
    <li>
      <BIconFileEarmarkLock></BIconFileEarmarkLock>
      <span v-if="isFree" class="text-success">
        <strong>{{ t('template-viewer.label.category-free') }}</strong>
      </span>
      <span v-else-if="isPrivate">
        <strong>{{ t('template-viewer.label.category-private') }}</strong>
      </span>
      <span v-else-if="isPaid" class="text-danger">
        <strong>{{ price }}</strong>
      </span>
    </li>
    <!-- resume count -->
    <li v-if="props.showResumeCount">
      <BIconFileEarmarkText></BIconFileEarmarkText>
      {{ resumeCount }}
    </li>
    <!-- locale -->
    <li v-if="props.showLocale">
      <BIconGlobe></BIconGlobe>
      {{ templateLocale }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { BIconFileEarmarkText, BIconFileEarmarkLock, BIconGlobe, BIconHouseDoor } from 'bootstrap-vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n-composable';
import { RegistrationCategory } from '@/clients/template-registration';
import { getLanguageName, getLanguageRegion, getPreferredCurrency } from '@/i18n';
import { Locale } from '@/state';
import { inject } from '@/util/injector';
import { Template } from './models';

const { t } = useI18n();

// props & emit
const props = defineProps({
  data: {
    type: Template,
    required: true
  },
  showResumeCount: Boolean,
  showLocale: Boolean
});

// global states
const locale = inject(Locale);

// computed
const website = computed(function () {
  return props.data.website;
});

const isFree = computed(function () {
  return props.data.category === RegistrationCategory.Free;
});

const isPrivate = computed(function () {
  return props.data.category === RegistrationCategory.Private;
});

const isPaid = computed(function () {
  return props.data.category === RegistrationCategory.Paid;
});

const price = computed(function () {
  // try preferred currency first
  const country = getLanguageRegion(locale.value);
  let currency = getPreferredCurrency(country);
  let price = props.data.prices.get(currency);

  if (price === undefined) {
    // no preferred currency available
    let first: [string, number];

    switch (props.data.prices.size) {
      case 0:
        return t('template-viewer.label.category-paid');
      case 1: // only one currency available
        first = props.data.prices.entries().next().value;
        currency = first[0];
        price = first[1];
        break;
      default:
        // try usd first if multiple currencies available, if usd not available use any first currency
        price = props.data.prices.get('USD');

        if (price !== undefined) {
          currency = 'USD';
        } else {
          first = props.data.prices.entries().next().value;
          currency = first[0];
          price = first[1];
        }
    }
  }

  // format price
  const format = new Intl.NumberFormat(locale.value, { style: 'currency', currency });

  return format.format(price);
});

const resumeCount = computed(function () {
  const f = new Intl.NumberFormat(locale.value);

  return f.format(props.data.resumeCount);
});

const templateLocale = computed(function () {
  return getLanguageName(props.data.locale, locale.value);
});
</script>
