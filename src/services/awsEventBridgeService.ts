import { EventBridge } from 'aws-sdk'

import { InternalServerError } from '../utils/exceptions'
import { Events, AccountEvent, TransactionEvent } from '../constants/events'

export class AwsEventBridgeService {
  private eventBridge: AWS.EventBridge

  constructor() {
    this.eventBridge = new EventBridge({
      region: process.env.AWS_REGION,
    })
  }

  async publishEvent(
    eventType: Events,
    eventDetail: AccountEvent | TransactionEvent,
  ): Promise<void> {
    const params = {
      Entries: [
        {
          Source: process.env.EVENT_SOURCE,
          DetailType: eventType,
          Detail: JSON.stringify(eventDetail),
          EventBusName: process.env.EVENT_BUS_NAME,
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
