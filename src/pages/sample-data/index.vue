<template>
  <Page class="flex-grow-1 d-flex flex-column">
    <!-- job & locale -->
    <TopPane :has-unsaved="hasUnsaved" @job-change="updateJob" @locale-change="updateLocale" @discard="reloadData"></TopPane>
    <!-- editor -->
    <BFormRow class="flex-grow-1">
      <!-- item list -->
      <BCol md="6" lg="4" order-md="1">
        <!-- items -->
        <BListGroup class="mb-2">
          <ListItem v-for="p of itemProps" :key="`item-${p.item.id}`"
            :item="p.item"
            :label="p.label"
            :can-up="p.canUp"
            :can-down="p.canDown"
            @add="createState(p.item)"
            @click="selectItem(p.item)"
            @delete="deleteItem(p.item)"
            @up="moveUp(p.item)"
            @down="moveDown(p.item)">
          </ListItem>
        </BListGroup>
        <!-- save -->
        <SavePane :disabled="!canSave" class="d-none d-md-inline-block w-100 mb-3" block @save="save"></SavePane>
      </BCol>
      <!-- editor -->
      <BCol md="6" lg="8" class="d-flex flex-column scroll-target" id="sample-editor-pane">
        <keep-alive :key="`editor-${editorKey}`">
          <div v-if="locale === null || selected === null" class="flex-grow-1 d-flex align-items-center justify-content-center">
            <p class="lead mb-2 mb-md-3">
              {{ t('sample-data.message.editor-placeholder') }}
            </p>
          </div>
          <EditPane v-else
            :item="item"
            :header="itemProps[selected].label"
            class="mb-2 mb-md-3"
            @result-change="updateResult"
            @flags-change="updateFlags"
            @dirty-change="updateDirty"
            @parent-change="updateParent">
          </EditPane>
        </keep-alive>
        <!-- top & save -->
        <div class="d-flex d-md-none justify-content-between mb-3" id="sample-mobile-save-pane">
          <BButton variant="link" class="p-0" @click="toTop">
            {{ t('sample-data.label.go-top') }}
          </BButton>
          <SavePane :disabled="!canSave" class="d-inline-block" @save="save"></SavePane>
        </div>
      </BCol>
    </BFormRow>
  </Page>
</template>

<script setup lang="ts">
import { toJSON } from '@ultimicro/json-mapper';
import { BButton, BCol, BFormRow, BListGroup } from 'bootstrap-vue';
import Vue, { nextTick, provide, ref, Ref, shallowReactive } from 'vue';
import { ClientKey } from '@/clients/rest';
import { DataProperty, MultiplicableData, PropertyFlags } from '@/clients/resume-data';
import { AvailableTypes, ContextKey, DataFlags, DataState, getDataMetadata, maxEntries, ResultFactory, UpdateWriter } from '@/components/data-editor';
import Page from '@/components/page';
import { getParentLanguage, useTranslation } from '@/i18n';
import { SampleData, SampleDataEndpoint, SampleUpdate } from '@/rest-endpoints/sample-data';
import { DataType } from '@/resume-data';
import { Alert, I18n, } from '@/services';
import { Source } from '@/store';
import { asyncInit } from '@/util/async-init';
import { bind } from '@/util/binder';
import { computed } from '@/util/computed';
import { group } from '@/util/grouper';
import { inject } from '@/util/injector';
import { Uuid } from '@/util/uuid';
import EditPane from './edit-pane.vue';
import ListItem from './list-item.vue';
import { Context, DataSet, Item, ItemData } from './models';
import SavePane from './save-pane.vue';
import TopPane from './top-pane.vue';
import { enumerateItems } from './utils';

const { t } = useTranslation();

// app services
const alert = inject(Alert);
const rest = inject(ClientKey);
const i18n = inject(I18n);

// local states
const context = shallowReactive(new Context(i18n));
const items: Ref<Item[]> = ref([]);
const deletes: Ref<Array<{ type: string, index: number | null }>> = ref([]);
const editorKey = ref(0);

// computed
const locale = computed(function () {
  return context.locale;
});

const parents = computed(function () {
  const result = new Map<DataType, SampleData[]>();

  // get selected job and locale
  const job = context.job;
  const locale = context.locale;

  if (!job || locale === null) {
    return result;
  }

  // populate data
  const defaultJob = job.isNil();
  const parentLocale = getParentLanguage(locale);

  for (const item of context.data) {
    const samples = Array.isArray(item) ? item : [item];

    for (const sample of samples) {
      const type = sample.data.type as DataType;

      // check if data valid for fallback
      if (sample.targetJob.equals(job)) {
        // data with the same job will be fallback to parent locale
        if (sample.locale !== parentLocale) {
          continue;
        }
      } else if (defaultJob) {
        // default job must not fallback to different job
        continue;
      } else if (sample.locale !== locale) {
        // data with different job will be fallback to the same locale
        continue;
      } else {
        // check if circular reference within the same locale
        const jobs = new Set<string>();
        let found = false;

        jobs.add(job.toString());

        for (let parent = sample; parent.parentJob;) {
          // check if parent job is already in the tree
          if (jobs.has(parent.parentJob.toString())) {
            found = true;
            break;
          }

          jobs.add(parent.targetJob.toString());

          // move to next layer
          const parents = context.data.get(parent.parentJob, locale, type);

          if (!parents) {
            break;
          } else if (Array.isArray(parents)) {
            const base = (parent.data.value as MultiplicableData).base;

            if (!base) {
              break;
            }

            const next = parents.find(p => (p.data.value as MultiplicableData).id.equals(base));

            if (!next) {
              break;
            }

            parent = next;
          } else {
            parent = parents;
          }
        }

        if (found) {
          continue;
        }
      }

      // add to available list
      let parents = result.get(type);

      if (!parents) {
        result.set(type, parents = []);
      }

      parents.push(sample);
    }
  }

  // sort data
  for (const parents of result.values()) {
    parents.sort(function (a, b) {
      const r = a.targetJob.compare(b.targetJob);

      if (r === 0) {
        return 0;
      } else if (a.targetJob.equals(job)) {
        return -1;
      } else if (b.targetJob.equals(job)) {
        return 1;
      } else {
        return r;
      }
    });
  }

  return result;
});

const itemProps = computed(function () {
  const props = new Array<{ label: string, canUp: boolean, canDown: boolean, item: Item }>();

  if (items.value.length) {
    let previousType = '';
    let num = 1;

    for (let i = 0; i < items.value.length; i++) {
      const item = items.value[i];
      const next = items.value[i + 1];
      const type = item.type;
      const multiplicable = maxEntries(type) > 1;

      if (type !== previousType) {
        num = 1;
      } else {
        num++;
      }

      props.push({
        label: getDataMetadata(type).label(i18n, num) as string,
        canUp: multiplicable && num !== 1,
        canDown: multiplicable && next && next.type === type && next.data !== null,
        item,
      });

      previousType = type;
    }
  } else {
    // create placeholder for all data types
    for (const type of AvailableTypes) {
      props.push({
        label: getDataMetadata(type).label(i18n, 1) as string,
        canUp: false,
        canDown: false,
        item: new Item(type, null)
      });
    }
  }

  return props;
});

const selected = computed(function () {
  const itemID = context.item;

  if (itemID === null) {
    return null;
  }

  const index = items.value.findIndex(i => i.id === itemID);

  if (index === -1) {
    throw new Error('Invalid selected item.');
  }

  return index;
});

const item = computed({ selected }, function () {
  const selected = this.selected.value;

  if (selected === null) {
    throw new Error('No item is selected.');
  }

  return items.value[selected];
});

const canSave = computed(function () {
  let hasChanges = false;

  for (const { index, data } of enumerateItems(items.value)) {
    // short circuit if there are any errors
    const state = data.state;

    if (state.flags & DataFlags.Error) {
      return false;
    }

    // don't return immediately because it is possible that some other entries has errors
    if (data.hasChanges(index)) {
      hasChanges = true;
    }
  }

  return hasChanges || deletes.value.length > 0;
});

const hasUnsaved = computed(function () {
  // check if remote was deleted
  if (deletes.value.length) {
    return true;
  }

  // check for data changes
  for (const { index, data } of enumerateItems(items.value)) {
    if (data.hasChanges(index)) {
      return true;
    }
  }

  return false;
});

// functions
const reloadData = bind({ parents }, async function () {
  // check if job & locale has been selected
  const job = context.job;
  const locale = context.locale;

  if (!job || locale === null) {
    return;
  }

  // reset states
  context.item = null;
  items.value = [];
  deletes.value = [];
  editorKey.value += 1;

  // populate items
  for (const type of AvailableTypes) {
    // get data
    let samples = context.data.get(job, locale, type as DataType);

    if (!samples) {
      samples = [];
    } else if (!Array.isArray(samples)) {
      samples = [samples];
    }

    // get applicable parents
    const parents = this.parents.value.get(type as DataType) || [];

    // create items
    for (let i = 0; i < samples.length; i++) {
      const sample = samples[i];
      const value = sample.data.value;

      // find parent index
      let parent: number | null;

      if (value instanceof MultiplicableData) {
        const base = value.base;

        if (base) {
          // no need to check for parent job because it is (almost) impossible for a data to have the same ID
          parent = parents.findIndex(p => (p.data.value as MultiplicableData).id.equals(base));

          if (parent === -1) {
            parent = null;
          }
        } else {
          parent = null;
        }
      } else {
        // get parent job & locale
        let pj: Uuid, pl: string | null;

        if (sample.parentJob) {
          pj = sample.parentJob;
          pl = sample.locale;
        } else {
          pj = sample.targetJob;
          pl = getParentLanguage(sample.locale);
        }

        if (pl === null) {
          // the data is invariant locale, so no parent for sure
          parent = null;
        } else {
          const hasFallbacks = function (): boolean {
            // check type of data (simple VS complex)
            const m = getDataMetadata(type);

            if (m.props) {
              // complex data (e.g. name)
              for (const { name } of m.props) {
                const p = Reflect.get(value, name) as DataProperty<unknown>;

                if (p.flags & PropertyFlags.Disabled || p.value !== null) {
                  continue;
                }

                return true;
              }

              return false;
            } else {
              // simple unique data (e.g. headline)
              const p = value as DataProperty<unknown>;

              if (p.flags & PropertyFlags.Disabled || p.value !== null) {
                return false;
              }

              return true;
            }
          };

          if (hasFallbacks()) {
            parent = parents.findIndex(p => p.targetJob.equals(pj) && p.locale === pl);

            if (parent === -1) {
              parent = null;
            }
          } else {
            parent = null;
          }
        }
      }

      // create item
      const state = new DataState(Object.freeze(value), parent === null ? null : parents[parent]);
      const data = new ItemData(state, i, parent, parents);

      items.value.push(new Item(type, data));
    }

    // add placeholder if required
    if (samples.length < maxEntries(type)) {
      items.value.push(new Item(type, null));
    }
  }
});

const updateJob = function (v: Uuid) {
  context.job = v;
  reloadData();
};

const updateLocale = function (v: string) {
  context.locale = v;
  reloadData();
};

const toEditor = function () {
  // check if we are on mobile device
  const save = document.getElementById('sample-mobile-save-pane');

  if (!save) {
    throw new Error(`No element with identifier 'sample-mobile-save-pane'.`);
  } else if (!save.offsetParent) {
    return;
  }

  // do scrolling
  const editor = document.getElementById('sample-editor-pane');

  if (!editor) {
    throw new Error(`No element with identifier 'sample-editor-pane'.`);
  }

  editor.scrollIntoView();
};

const createState = bind({ parents }, function (target: Item) {
  if (target.data) {
    throw new Error('The specified item already have data.');
  }

  // create data
  const parents = this.parents.value.get(target.type as DataType) || [];
  const state = new DataState(null, null);

  target.data = new ItemData(state, null, null, parents);
  context.item = target.id;

  // scroll to the editor
  nextTick(() => toEditor());

  // check if we need to add a new placeholder
  let total = 0, index = -1;

  for (let i = 0; i < items.value.length; i++) {
    const item = items.value[i];

    if (item.type === target.type) {
      total++;

      if (item.id === target.id) {
        index = i;
      }
    }
  }

  if (total >= maxEntries(target.type)) {
    return;
  }

  // add placeholder
  if (index === -1) {
    throw new Error(`Item ${target.id} does not exists in the list.`);
  }

  items.value.splice(index + 1, 0, new Item(target.type, null));
});

const selectItem = function (target: Item) {
  context.item = target.id;
  nextTick(() => toEditor());
};

const deleteItem = function (target: Item) {
  // check if target has data
  const data = target.data;

  if (!data) {
    throw new Error(`Item ${target.id} does not have data.`);
  }

  // get index
  let index = items.value.indexOf(target);

  if (index === -1) {
    throw new Error(`Item ${target.id} does not exists in the list.`);
  }

  // remove item from the list
  const type = target.type;

  items.value.splice(index, 1);

  if (data.state.remote) {
    deletes.value.push({
      type,
      index: maxEntries(type) > 1 ? data.remotePosition : null
    });
  }

  if (target.id === context.item) {
    context.item = null;
  }

  // check if we need to add a placeholder
  for (; index < items.value.length; index++) {
    const item = items.value[index];

    if (item.type !== type) {
      break;
    } else if (!item.data) {
      return;
    }
  }

  // add placeholder
  items.value.splice(index, 0, new Item(type, null));
};

const moveUp = function (target: Item) {
  const index = items.value.findIndex(i => i.id === target.id);

  if (index === -1) {
    throw new Error(`Item ${target.id} does not exists in the list.`);
  }

  const src = items.value[index];
  const dst = items.value[index - 1];

  Vue.set(items.value, index - 1, src);
  Vue.set(items.value, index, dst);
};

const moveDown = function (target: Item) {
  const index = items.value.findIndex(i => i.id === target.id);

  if (index === -1) {
    throw new Error(`Item ${target.id} does not exists in the list.`);
  }

  const src = items.value[index];
  const dst = items.value[index + 1];

  Vue.set(items.value, index + 1, src);
  Vue.set(items.value, index, dst);
};

const updateResult = function (v: ResultFactory) {
  const data = item.value.data;

  if (!data) {
    throw new Error('The selected item does not have data.');
  }

  data.state.result = v;
};

const updateFlags = function (v: DataFlags) {
  const data = item.value.data;

  if (!data) {
    throw new Error('The selected item does not have data.');
  }

  data.state.flags = v;
};

const updateDirty = function (v: boolean) {
  const data = item.value.data;

  if (!data) {
    throw new Error('The selected item does not have data.');
  }

  data.state.dirty = v;
};

const updateParent = function (v: SampleData | null) {
  const data = item.value.data;

  if (!data) {
    throw new Error('The selected item does not have data.');
  }

  data.state.parent = v;
};

const toTop = function () {
  window.scrollTo(0, 0);
};

const save = async function () {
  // get selected job and locale
  const job = context.job;

  if (!job) {
    throw new Error('No job has been selected.');
  }

  const locale = context.locale;

  if (locale === null) {
    throw new Error('No locale has been selected.');
  }

  // prepare the updates
  const updates = new FormData();
  const changes = new Set<string>();

  for (const { type, index, data } of enumerateItems(items.value)) {
    // skip if data with remote has not been selected
    const s = data.state;

    if (!s.result) {
      continue;
    }

    // create a writer for the update
    const w = new class extends UpdateWriter {
      getParent(): Uuid | null {
        const p = s.parent as SampleData | null;

        if (!p || !(p.data.value instanceof MultiplicableData)) {
          return null;
        }

        return p.data.value.id;
      }

      writeUpdate(data: object): void {
        // get update key
        let key;

        if (data instanceof MultiplicableData) {
          key = `update:${type}:${index}`;
        } else {
          key = `update:${type}`;
        }

        // get parent job
        const parent = s.parent as SampleData | null;
        const parentJob = parent?.targetJob;
        const update = new SampleUpdate((parentJob && !parentJob.equals(job)) ? parentJob : null, data);

        // write the update
        updates.append(key, new Blob([toJSON(update)], { type: 'application/json' }));
      }

      writeContent(id: string, value: string | Blob): void {
        updates.append(`content:${id}`, value);
      }
    };

    // create the update
    if (data.hasChanges(index)) {
      s.result(w);
      changes.add(`${type}:${index}`);
    }
  }

  // add delete operations
  for (const { type, index } of deletes.value) {
    let key;

    if (index === null) {
      key = `delete:${type}`;
    } else {
      key = `delete:${type}:${index}`;
    }

    updates.append(key, '');
  }

  // submit the updates
  let remotes;

  context.saving = true;

  try {
    const ep = new SampleDataEndpoint(rest);
    const resp = await ep.patch(job, locale || 'default', updates);

    remotes = group(resp, d => d.data.type);
  } catch (e) {
    const error = e as Error;
    alert.error(Source.Server, () => t('sample-data.message.save-error', { error }), error);
    return;
  } finally {
    context.saving = false;
  }

  // update remotes
  for (const { type, index, data } of enumerateItems(items.value)) {
    // skip if item is not changed
    if (!changes.has(`${type}:${index}`)) {
      continue;
    }

    // get updated data
    const updates = remotes.get(type);

    if (!updates) {
      throw new Error(`No '${type}' data on the remote.`);
    }

    const updated = updates[index];

    if (!updated) {
      throw new Error(`No '${type}:${index}' data on the remote.`);
    }

    // update the remote
    data.state.remote = Object.freeze(updated.data.value);

    // remote position and parent will be always the same as local version after updated
    const parent = data.state.parent as SampleData | null;

    if (parent) {
      data.remoteParent = data.parents.indexOf(parent);

      if (data.remoteParent === -1) {
        throw new Error(`Item ${type}:${index} has non-existent parent.`);
      }
    } else {
      data.remoteParent = null;
    }

    data.remotePosition = index;

    // update data set
    const key = DataSet.getKey(updated);
    const set = context.data.get(key);

    if (Array.isArray(set)) {
      set[index] = updated;
    } else if (set || maxEntries(type) === 1) {
      context.data.set(key, updated);
    } else {
      if (index !== 0) {
        throw new Error('Unexpected data index.');
      }

      context.data.set(key, [updated]);
    }
  }

  // clear the data to deletes
  deletes.value = [];
};

// life cycle hooks
asyncInit(async function () {
  // fetch data
  const ep = new SampleDataEndpoint(rest);
  let samples;

  try {
    samples = await ep.list();
  } catch (e) {
    const error = e as Error;
    alert.error(Source.Server, () => t('sample-data.message.fetch-data-error', { error }), error);
    return;
  }

  // index data
  context.data = new DataSet(samples);
});

// child dependencies
provide(ContextKey, context);
</script>
