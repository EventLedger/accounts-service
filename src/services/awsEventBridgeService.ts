import { EventBridge } from 'aws-sdk'

import { InternalServerError } from '../utils/exceptions'
import { Events, AccountEvent, TransactionEvent } from '../constants/events'

export class AwsEventBridgeService {
  private eventBridge: AWS.EventBridge

  constructor() {
    this.eventBridge = new EventBridge({
      region: 'eu-north-1',
    })
  }

  async publishEvent(
    eventType: Events,
    eventDetail: AccountEvent | TransactionEvent,
  ): Promise<void> {
    const params = {
      Entries: [
        {
          Source: 'accounts-service',
          DetailType: eventType,
          Detail: JSON.stringify(eventDetail),
          EventBusName: 'default',
          Time: new Date(),
        },
      ],
    }

    try {
      const event = await this.eventBridge.putEvents(params).promise()
      console.info('PUBLISHING EVENT---', event)
    } catch (e) {
      throw new InternalServerError(`Failed with error: ${e}`)
    }
  }
}
