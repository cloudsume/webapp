import { ShallowRef } from 'vue';
import { useTranslation } from '@/i18n';
import { Job, JobEndpoint } from '@/rest-endpoints/job';
import { Alert, REST, Stash } from '@/services';
import { createKey } from '@/services/object-stash';
import { Source } from '@/store';
import { future } from '@/util/future';
import { inject } from '@/util/injector';

export function useJobs(): ShallowRef<Map<string, Job> | Error | undefined> {
  const { t } = useTranslation();
  const alert = inject(Alert);
  const rest = inject(REST);
  const stash = inject(Stash);

  return stash.get(Jobs, () => future(async function () {
    const jobs = new Map<string, Job>();
    const ep = new JobEndpoint(rest);

    try {
      for (const j of await ep.list()) {
        jobs.set(j.id.toString(), j);
      }
    } catch (e) {
      const error = e as Error;
      alert.error(Source.Server, () => t('sample-data.message.fetch-job-error', { error }), error);
      return error;
    }

    return jobs;
  }));
}

const Jobs = createKey<ShallowRef<Map<string, Job> | Error | undefined>>();
