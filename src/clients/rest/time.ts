import { InvalidProperty, JsonArray, JsonClass, JsonObject, JsonScalar, MappingContext } from '@ultimicro/json-mapper';

@JsonClass({ reader: readDateMonth, writer: writeDateMonth })
export class DateMonth {
  readonly month: number;
  readonly year: number;

  constructor(month: number, year: number) {
    if (month < 0 || month > 11) {
      throw new RangeError(`${month} is not a valid month.`);
    }

    if (year < 1 || year > 9999) {
      throw new Error(`${year} is not a valid year.`);
    }

    this.month = month;
    this.year = year;
  }

  equals(other: DateMonth): boolean {
    return other.month === this.month && other.year == this.year;
  }
}

function readDateMonth(ctx: MappingContext, json: any): DateMonth {
  if (typeof json !== 'object') {
    throw new InvalidProperty(`Expect object, got ${typeof json}.`, ctx.currentPath());
  }

  const month = json.month;
  const year = json.year;

  if (!Number.isInteger(month)) {
    throw new InvalidProperty(`Expect integer, got ${typeof month}.`, ctx.pathFor('month'));
  } else if (month < 1 || month > 12) {
    throw new InvalidProperty(`Expect 1 - 12, got ${month}.`, ctx.pathFor('month'));
  }

  if (!Number.isInteger(year)) {
    throw new InvalidProperty(`Expect integer, got ${typeof year}.`, ctx.pathFor('year'));
  } else if (year < 1 || year > 9999) {
    throw new InvalidProperty(`Expect 1 - 9999, got ${year}.`, ctx.pathFor('year'));
  }

  return new DateMonth(month - 1, year);
}

function writeDateMonth(ctx: MappingContext, obj: DateMonth): JsonScalar | JsonObject | JsonArray {
  return {
    month: obj.month + 1,
    year: obj.year
  };
}
