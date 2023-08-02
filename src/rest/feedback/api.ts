import { Client, Service } from '@/clients/rest';
import { CreateFeedback } from './models';

export class FeedbackAPI extends Service {
  constructor(client: Client) {
    super(client, '/feedbacks');
  }

  async create(req: CreateFeedback): Promise<void> {
    await this.invoke('POST', '', req);
  }
}
