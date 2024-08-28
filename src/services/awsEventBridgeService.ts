import { EventBridge } from 'aws-sdk'

import { ITransaction } from 'src/models/transaction'
import { IAccount } from 'src/models/account'

export class AwsEventBridgeService {
  private eventBridge: AWS.EventBridge

  constructor() {
    this.eventBridge = new EventBridge()
  }

  async publishEvent(
    eventType: string,
    eventDetail: ITransaction | IAccount,
  ): Promise<void> {
    const params = {
      Entries: [
        {
          Source: 'accounts-service',
          DetailType: eventType,
          Detail: JSON.stringify(eventDetail),
          EventBusName: 'default',
        },
      ],
    }

    await this.eventBridge.putEvents(params).promise()
  }
}
