import { EventBridge } from 'aws-sdk'

import { IAccount } from '../models/account'
import { ITransaction } from '../models/transaction'
import { InternalServerError } from 'src/utils/exceptions'

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
    
    try {
      await this.eventBridge.putEvents(params).promise()
    } catch (e) {
      throw new InternalServerError(`Failed with error: ${e}`)
    }
  }
}