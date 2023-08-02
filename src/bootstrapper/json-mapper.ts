import { configClass, InvalidProperty, MappingContext } from '@ultimicro/json-mapper';
import { ULID } from '@/util/ulid';
import { Uuid } from '@/util/uuid';

export function init(): void {
  configClass(Uuid, { reader: readUuid, writer: writeUuid });
  configClass(ULID, { reader: readULID, writer: writeULID });
}

function readUuid(ctx: MappingContext, json: string | boolean | number | object | unknown[]): Uuid {
  if (typeof json !== 'string') {
    throw new InvalidProperty(`Expect string, got ${typeof json}.`, ctx.currentPath());
  }

  try {
    return new Uuid(json);
  } catch (e) {
    if (e instanceof TypeError) {
      throw new InvalidProperty(`${json} is not a valid UUID.`, ctx.currentPath());
    } else {
      throw e;
    }
  }
}

function writeUuid(ctx: MappingContext, obj: Uuid): string {
  return obj.toString();
}

function readULID(ctx: MappingContext, json: string | boolean | number | object | unknown[]): ULID {
  if (typeof json !== 'string') {
    throw new InvalidProperty(`Expect string, got ${typeof json}.`, ctx.currentPath());
  }

  try {
    return new ULID(json);
  } catch (e) {
    if (e instanceof TypeError) {
      throw new InvalidProperty(`${json} is not a valid ULID.`, ctx.currentPath());
    } else {
      throw e;
    }
  }
}

function writeULID(ctx: MappingContext, obj: ULID): string {
  return obj.toString();
}
