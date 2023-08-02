import { JsonClass, JsonProperty } from '@ultimicro/json-mapper';

@JsonClass()
export class Configurations {
  @JsonProperty({ type: String })
  slackUri: string | null;

  constructor(slackUri: string | null) {
    this.slackUri = slackUri;
  }
}
