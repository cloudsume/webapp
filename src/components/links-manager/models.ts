import { LinkAccess, ResumeInfo } from '@/clients/resume';

export class Link {
  id: string;
  name: string;
  censorships: Set<string>;
  createdAt: Date;
  accessedAt: Date | null;
  accesses: LinkAccess[];

  constructor(id: string, name: string, censorships: Set<string>, createdAt: Date, accessedAt: Date | null, accesses: LinkAccess[]) {
    this.id = id;
    this.name = name;
    this.censorships = censorships;
    this.createdAt = createdAt;
    this.accessedAt = accessedAt;
    this.accesses = accesses;
  }
}

export class EditCensorshipsContext {
  constructor(public resume: ResumeInfo, public censorships: Set<string>) {
  }
}

export class CensorshipItem {
  type: string;
  prop: string | null;
  selected: boolean;
  data: unknown[];

  constructor(type: string, prop: string | null, selected: boolean, data: unknown[]) {
    this.type = type;
    this.prop = prop;
    this.selected = selected;
    this.data = data;
  }
}
