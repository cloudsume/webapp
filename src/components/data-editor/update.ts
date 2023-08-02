import { Uuid } from '@/util/uuid';

export abstract class UpdateWriter {
  abstract getParent(): Uuid | null;
  abstract writeUpdate(data: object): void;
  abstract writeContent(id: string, value: string | Blob): void;
}
