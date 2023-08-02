import { InjectionKey } from 'vue';
import { UpdateWriter } from './update';

export const StateKey = Symbol('Key for DataState') as InjectionKey<DataState>;

export type ResultFactory = (w: UpdateWriter) => void;

export const enum DataFlags {
  None = 0x0,
  Error = 0x01
}

export class DataState {
  remote: object | null;
  parent: unknown | null; // the actual value is depend on the current page
  result: ResultFactory | null;
  flags: DataFlags;
  dirty: boolean;

  constructor(remote: object | null, parent: unknown | null) {
    this.remote = remote;
    this.parent = parent;
    this.result = null;
    this.flags = DataFlags.None;
    this.dirty = false; // we don't need to set it true for a new local data due to the editor will set it anyway
  }
}
