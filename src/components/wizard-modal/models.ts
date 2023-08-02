export type Navigator = (from: string, result: unknown, submit?: unknown) => Promise<Navigation | null> | Navigation | null;
export type ResultFactory = () => unknown;

export class History {
  constructor(readonly page: string, readonly data: unknown, readonly result: unknown) {
  }
}

export class Navigation {
  constructor(readonly next: string, readonly data: unknown, readonly complete?: string) {
  }
}
