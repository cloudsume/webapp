import { fromJSON, toJSON } from '@ultimicro/json-mapper';
import { Mutex } from 'async-mutex';
import { InjectionKey, Ref } from 'vue';
import { RequestError, ResponseError } from './errors';

export const ClientKey = Symbol('client') as InjectionKey<Client>;

export abstract class Service {
  constructor(protected readonly client: Client, protected readonly prefix: string) {
  }

  protected invoke<T = any>(method: string, path: string, body?: T): Promise<Response> {
    return this.client.invoke(method, this.prefix + path, body);
  }
}

export class Client {
  readonly mutex: Mutex;

  accessToken?: string;

  constructor(prefix: string, locale: Ref<string>) {
    this.prefix = prefix;
    this.locale = locale;
    this.mutex = new Mutex();
  }

  async getFileURL(url: string): Promise<string> {
    const body = await this.downloadFile(url);
    return URL.createObjectURL(body);
  }

  async downloadFile(url: string): Promise<Blob> {
    const result = await this.invoke('GET', url);
    return await result.blob();
  }

  async invoke<T = any>(method: string, path: string, body?: T): Promise<Response> {
    const locale = this.locale.value;
    const headers = new Headers();
    const release = await this.mutex.acquire();
    let req;

    try {
      if (this.accessToken !== undefined) {
        headers.append('Authorization', 'Bearer ' + this.accessToken);
      }

      headers.set('Accept-Language', locale);
    } finally {
      release();
    }

    if (body instanceof FormData || body instanceof Blob) {
      req = body;
    } else if (body !== undefined) {
      req = toJSON(body);
      headers.append('Content-Type', 'application/json');
    }

    // invoke server api
    const url = (path[0] === '/') ? this.prefix + path : path;
    const res = await fetch(url, { method, headers, body: req });

    if (!res.ok) {
      switch (res.status) {
        case 400:
          let json;

          try {
            json = await res.json();
          } catch (e) {
            // old api that does not report model error
            throw new ResponseError(`Unexpected status ${res.status}.`, res);
          }

          throw new RequestError(res, fromJSON(json, Map, String, Array, String));
        default:
          throw new ResponseError(`Unexpected status ${res.status}.`, res);
      }
    }

    return res;
  }

  private readonly prefix: string;
  private readonly locale: Ref<string>;
}
