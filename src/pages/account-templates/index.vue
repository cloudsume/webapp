<template>
  <page class="flex-grow-1 d-flex flex-column">
    <!-- actions -->
    <b-row>
      <b-col class="d-flex">
        <b-form-select class="mb-3 mr-2" v-model="sorting">
          <b-form-select-option :value="0">{{ $t('account-templates.label.sort-last-updated') }}</b-form-select-option>
          <b-form-select-option :value="1">{{ $t('account-templates.label.sort-least-updated') }}</b-form-select-option>
        </b-form-select>
        <!-- new -->
        <span id="register-template" class="d-inline-block" tabindex="0">
          <b-button variant="primary" :disabled="!canRegister" class="mb-3" @click="creating = true">
            {{ $t('account-templates.label.new') }}
          </b-button>
        </span>
        <BTooltip v-if="!canRegister" target="register-template">
          <template v-if="isGuest">{{ $t('account-templates.message.require-non-guest-account') }}</template>
          <template v-else-if="!emailVerified">{{ $t('account-templates.message.require-verified') }}</template>
          <template v-else>{{ $t('account-templates.message.limit-reached') }}</template>
        </BTooltip>
      </b-col>
    </b-row>
    <!-- list -->
    <b-row v-if="!items.length" class="flex-grow-1 align-items-center justify-content-center">
      <p class="lead">{{ $t('account-templates.message.no-templates') }}</p>
    </b-row>
    <template v-else>
      <card-deck :items="sorted" :primary-key="cardId" md="12" lg="6" xl="4" v-slot="{ item }">
        <template-viewer :data="item" class="h-100" show-locale>
          <!-- actions -->
          <b-dropdown
            class="mt-auto"
            :text="$t('account-templates.label.workspace')"
            :split-to="{ name: 'template-editor', params: { id: item.id.toString() }}"
            variant="primary"
            split
            block
            right>
            <BDropdownItemButton @click="setUpdateName(item)">{{ $t('account-templates.label.rename-template') }}</BDropdownItemButton>
            <BDropdownItemButton @click="setUpdatingDescription(item)">{{ $t('account-templates.label.update-description') }}</BDropdownItemButton>
            <BDropdownItemButton @click="setUpdatingJobs(item)">{{ $t('account-templates.label.update-jobs') }}</BDropdownItemButton>
            <BDropdownItemButton @click="setUpdatingWebsite(item)">{{ $t('account-templates.label.update-website') }}</BDropdownItemButton>
            <BDropdownItemButton @click="setUpdatingCategory(item)">{{ $t('account-templates.label.change-category') }}</BDropdownItemButton>
            <b-dropdown-divider></b-dropdown-divider>
            <BDropdownItemButton :disabled="!isPaid(item)" @click="setUpdatingPrices(item)">
              {{ $t('account-templates.label.update-prices') }}
            </BDropdownItemButton>
          </b-dropdown>
          <!-- title -->
          <template #title>
            <div class="d-flex justify-content-between">
              <b-card-title>{{ item.name }}</b-card-title>
              <b-card-title v-if="item.published">
                <b-badge variant="primary">{{ $t('account-templates.label.published') }}</b-badge>
              </b-card-title>
            </div>
          </template>
        </template-viewer>
      </card-deck>
    </template>
    <!-- modals -->
    <NewRegistration v-if="creating" @input="registrationCompleted" @hidden="creating = false"></NewRegistration>
    <UpdateName v-if="updatingName" :template="updatingName" @input="nameUpdated" @hidden="updatingName = null"></UpdateName>
    <UpdateDescription v-if="updatingDescription" :template="updatingDescription" @input="descriptionUpdated" @hidden="updatingDescription = null">
    </UpdateDescription>
    <UpdateJobs v-if="updatingJobs" :template="updatingJobs" @input="jobsUpdated" @hidden="updatingJobs = null"></UpdateJobs>
    <UpdateWebsite v-if="updatingWebsite" :template="updatingWebsite" @input="websiteUpdated" @hidden="updatingWebsite = null"></UpdateWebsite>
    <UpdateCategory v-if="updatingCategory" :template="updatingCategory" @input="categoryUpdated" @hidden="updatingCategory = null"></UpdateCategory>
    <UpdatePrices v-model="updatingPrices" @input="pricesUpdated"></UpdatePrices>
  </page>
</template>

<script lang="ts">
import {
  BBadge,
  BButton,
  BCardTitle,
  BCol,
  BDropdown,
  BDropdownDivider,
  BDropdownItemButton,
  BFormSelect,
  BFormSelectOption,
  BRow,
  BTooltip
} from 'bootstrap-vue';
import Vue from 'vue';
import { PaymentReceivingMethodService } from '@/clients/payment-receiving-method';
import { RegistrationCategory, TemplateRegistration, TemplateRegistrationService, WorkspacePreview } from '@/clients/template-registration';
import CardDeck from '@/components/card-deck';
import Page from '@/components/page';
import TemplateViewer from '@/components/template-viewer';
import { Session } from '@/state/session';
import { Empty as EmptyULID } from '@/util/ulid';
import { Uuid } from '@/util/uuid';
import { PageContext, PageContextKey, Template } from './models';
import NewRegistration from './new-registration.vue';
import UpdateCategory from './update-category.vue';
import UpdateDescription from './update-description.vue';
import UpdateJobs from './update-jobs.vue';
import UpdateName from './update-name.vue';
import UpdatePrices from './update-prices.vue';
import UpdateWebsite from './update-website.vue';

export default Vue.extend({
  components: {
    BBadge,
    BButton,
    BCardTitle,
    BCol,
    BDropdown,
    BDropdownDivider,
    BDropdownItemButton,
    BFormSelect,
    BFormSelectOption,
    BRow,
    BTooltip,
    CardDeck,
    NewRegistration,
    Page,
    TemplateViewer,
    UpdateCategory,
    UpdateDescription,
    UpdateJobs,
    UpdateName,
    UpdatePrices,
    UpdateWebsite
  },
  data: function () {
    return {
      context: new PageContext(),
      sorting: Sorting.LastUpdated,
      items: new Array<Template>(),
      creating: false,
      updatingName: null as Template | null,
      updatingDescription: null as Template | null,
      updatingJobs: null as Template | null,
      updatingWebsite: null as Template | null,
      updatingCategory: null as Template | null,
      updatingPrices: null as Template | null
    };
  },
  computed: {
    session: function (): Session {
      return this.$store.state.session;
    },
    canRegister: function (): boolean {
      return this.emailVerified && this.items.length < 50;
    },
    isGuest: function (): boolean {
      return this.session.isGuest;
    },
    emailVerified: function (): boolean {
      return this.session.account?.profile.email_verified === true;
    },
    sorted: function (): Template[] {
      const result = [...this.items];

      switch (this.sorting) {
        case Sorting.LastUpdated:
          return result.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        case Sorting.LeastUpdated:
          return result.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
        default:
          throw new Error(`Unknown sorting ${this.sorting}.`);
      }
    }
  },
  provide: function (): object {
    return {
      [PageContextKey]: this.context
    };
  },
  fetch: async function () {
    // load payment receiving methods
    const ps = new PaymentReceivingMethodService(this.$rest);
    let payments;

    try {
      payments = await ps.list();
    } catch (e) {
      // TODO: display alert
      return;
    }

    // load registrations
    const ts = new TemplateRegistrationService(this.$rest);
    const userId = this.session.userId;
    let registrations;

    try {
      registrations = await ts.list(userId);
    } catch (e) {
      // TODO: display alert
      return;
    }

    // transform into domain
    const templates = new Array<Template>();

    for (const r of registrations) {
      // load templates
      let t;

      try {
        t = await ts.listTemplates(r.id);
      } catch (e) {
        // TODO: display alert
        continue;
      }

      if (t.length) {
        t = t[0];
      } else {
        t = EmptyULID;
      }

      // load preview
      let p;

      try {
        p = await ts.getWorkspacePreviews(r.id);
      } catch (e) {
        // TODO: display alert
        continue;
      }

      templates.push(new Template(r, t, (p as WorkspacePreview).thumbnails[0] ?? null));
    }

    // trigger reactivity
    this.context.payments = payments;
    this.items = templates;
  },
  methods: {
    cardId: function (t: Template): string | number {
      return t.id.toString();
    },
    isPaid: function (t: Template): boolean {
      return t.category === RegistrationCategory.Paid;
    },
    registrationCompleted: function (r: TemplateRegistration): void {
      this.items.push(new Template(r, EmptyULID, null));
    },
    setUpdateName: function (t: Template): void {
      this.updatingName = t;
    },
    nameUpdated: function (v: string): void {
      if (!this.updatingName) {
        throw new Error('No template has been selected for updating name.');
      }

      this.updatingName.name = v;
    },
    setUpdatingDescription: function (t: Template): void {
      this.updatingDescription = t;
    },
    descriptionUpdated: function (v: string): void {
      if (!this.updatingDescription) {
        throw new Error('No template has been selected for updating description.');
      }

      this.updatingDescription.description = v;
    },
    setUpdatingJobs: function (t: Template): void {
      this.updatingJobs = t;
    },
    jobsUpdated: function (v: Uuid[]): void {
      if (!this.updatingJobs) {
        throw new Error('No template has been selected for updating applicable jobs.');
      }

      this.updatingJobs.applicableJobs = v;
    },
    setUpdatingWebsite: function (t: Template): void {
      this.updatingWebsite = t;
    },
    websiteUpdated: function (v: string | null): void {
      if (!this.updatingWebsite) {
        throw new Error('No template has been selected for updating website.');
      }

      this.updatingWebsite.website = v;
    },
    setUpdatingCategory: function (t: Template): void {
      this.updatingCategory = t;
    },
    categoryUpdated: function (c: RegistrationCategory, requirePrices: boolean): void {
      if (!this.updatingCategory) {
        throw new Error('No template has been selected for updating category.');
      }

      if (requirePrices) {
        this.updatingPrices = this.updatingCategory;
        this.updatingPrices.pendingCategory = c;
      } else {
        this.updatingCategory.category = c;
      }
    },
    setUpdatingPrices: function (t: Template): void {
      this.updatingPrices = t;
    },
    pricesUpdated: function (v: Map<string, number>): void {
      if (!this.updatingPrices) {
        throw new Error('No selected template for updating prices.');
      }

      this.updatingPrices.prices = v;

      if (this.updatingPrices.pendingCategory !== null) {
        this.updatingPrices.category = this.updatingPrices.pendingCategory;
        this.updatingPrices.pendingCategory = null;
      }
    }
  }
});

const enum Sorting {
  LastUpdated = 0,
  LeastUpdated = 1
}
</script>
