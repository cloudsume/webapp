import { JsonClass, JsonProperty } from '@ultimicro/json-mapper';

@JsonClass()
export class CreateFeedback {
  @JsonProperty({ type: Number })
  score: number | null;

  @JsonProperty({ type: String })
  detail: string | null;

  @JsonProperty({ type: String })
  contact: string | null;

  @JsonProperty()
  captchaToken: string;

  constructor(score: number | null, detail: string | null, contact: string | null, captchaToken: string) {
    this.score = score;
    this.detail = detail;
    this.contact = contact;
    this.captchaToken = captchaToken;
  }
}
