import { JsonClass, JsonProperty } from '@ultimicro/json-mapper';
import { ResumeData } from '@/clients/resume-data';
import { Uuid } from '@/util/uuid';

@JsonClass()
export class SampleData {
  @JsonProperty()
  targetJob: Uuid;

  @JsonProperty()
  locale: string;

  @JsonProperty()
  data: ResumeData;

  @JsonProperty({ type: Uuid })
  parentJob: Uuid | null;

  constructor(targetJob: Uuid, locale: string, data: ResumeData, parentJob: Uuid | null) {
    this.targetJob = targetJob;
    this.locale = locale;
    this.data = data;
    this.parentJob = parentJob;
  }
}

@JsonClass()
export class SampleUpdate {
  @JsonProperty({ type: Uuid })
  parentJob: Uuid | null;

  @JsonProperty()
  update: object;

  constructor(parentJob: Uuid | null, update: object) {
    this.parentJob = parentJob;
    this.update = update;
  }
}
