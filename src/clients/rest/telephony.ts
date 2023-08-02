import { JsonClass, JsonProperty } from '@ultimicro/json-mapper';

@JsonClass()
export class TelephoneNumber {
  @JsonProperty()
  country: string;

  @JsonProperty()
  number: string;

  constructor(country: string, number: string) {
    this.country = country;
    this.number = number;
  }

  equals(other: TelephoneNumber): boolean {
    return other.country === this.country && other.number === this.number;
  }
}
