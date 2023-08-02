import { MultiplicableData, ResumeData } from '@/clients/resume-data';

export class DataTable {
  [lang: string]: ResumeData[];
}

export class GlobalMap {
  [type: string]: DataTable;
}

export function findParent(table: DataTable, data: object, lang: string): ResumeData | null;

/**
 * Find parent of the specified data.
 *
 * @param map The global map to search.
 * @param data The data to find its parent.
 * @param lang The parent language of the data.
 *
 * @returns The parent data if there is one; otherwise null.
 */
export function findParent(map: GlobalMap, data: ResumeData, lang: string): ResumeData | null;
export function findParent(map: GlobalMap | DataTable, data: object, lang: string): ResumeData | null {
  let globals, value;

  if (map instanceof GlobalMap) {
    globals = getGlobal(map, (data as ResumeData).type, lang);
    value = (data as ResumeData).value;
  } else {
    globals = map[lang] ?? [];
    value = data;
  }

  if (!globals.length) {
    return null;
  }

  if (value instanceof MultiplicableData) {
    if (value.base === null) {
      return null;
    }

    for (const g of globals) {
      if ((g.value as MultiplicableData).id.equals(value.base)) {
        return g;
      }
    }

    return null;
  } else if (globals.length !== 1) {
    throw new Error(`Expect exactly one, got ${globals.length}.`);
  } else {
    return globals[0];
  }
}

export function getGlobal(map: GlobalMap, type: string, lang: string): ResumeData[] {
  const t = map[type];

  if (!t) {
    return [];
  }

  return t[lang] ?? [];
}
