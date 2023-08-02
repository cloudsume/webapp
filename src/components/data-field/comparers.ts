import { DateMonth } from '@/clients/rest';

export function compareDateMonth(local: DateMonth | null, remote: DateMonth | null): boolean {
  if (local === null && remote === null) {
    return true;
  } else if (local && remote) {
    return local.equals(remote);
  } else {
    return false;
  }
}
