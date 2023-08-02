import { RouteMeta as MetaInterface } from 'vue-router';

export class RouteMeta implements MetaInterface {
  readonly allowGuest: boolean;

  constructor(allowGuest: boolean) {
    this.allowGuest = allowGuest;
  }
}
