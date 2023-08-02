import { JsonClass, JsonProperty } from '@ultimicro/json-mapper';
import { RegistrationCategory } from '@/clients/template-registration';
import { ULID } from '@/util/ulid';
import { Uuid } from '@/util/uuid';

@JsonClass()
export class Template {
  @JsonProperty()
  id: ULID;

  @JsonProperty()
  registrationId: Uuid;

  @JsonProperty()
  category: RegistrationCategory;

  @JsonProperty({ args: [String] })
  applicableData: string[];

  @JsonProperty()
  releaseNote: string;

  @JsonProperty({ args: [String] })
  previews: string[];

  constructor(id: ULID, registrationId: Uuid, category: RegistrationCategory, applicableData: string[], releaseNote: string, previews: string[]) {
    this.id = id;
    this.registrationId = registrationId;
    this.category = category;
    this.applicableData = applicableData;
    this.releaseNote = releaseNote;
    this.previews = previews;
  }
}
