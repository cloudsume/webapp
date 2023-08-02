import { DataProperty } from '@/clients/resume-data';

export abstract class DataMerger<Data extends object> {
  abstract for<T>(selector: (data: Data) => DataProperty<T>): T | null;
}
