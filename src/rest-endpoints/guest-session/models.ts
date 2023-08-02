import { JsonClass, JsonProperty } from '@ultimicro/json-mapper';

@JsonClass()
export class CreateGuestSession {
  @JsonProperty()
  captcha: string;

  constructor(captcha: string) {
    this.captcha = captcha;
  }
}
