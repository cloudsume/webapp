import { JsonClass, JsonProperty } from '@ultimicro/json-mapper';
import { Uuid } from '@/util/uuid';

@JsonClass()
export class Job {
  @JsonProperty()
  id: Uuid;

  @JsonProperty()
  name: string;

  constructor(id: Uuid, name: string) {
    this.id = id;
    this.name = name;
  }
}
