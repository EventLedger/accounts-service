import { EventBridge } from 'aws-sdk'

// import { IAccount } from '../models/account'
// import { ITransaction } from '../models/transaction'
import { InternalServerError } from '../utils/exceptions'
import { Events } from '../constants/events'

export class AwsEventBridgeService {
  private eventBridge: AWS.EventBridge

  constructor() {
    this.eventBridge = new EventBridge({
      region: 'eu-north-1'
    })
  }

  async publishEvent(
    eventType: Events,
    eventDetail: any,
    // eventDetail: ITransaction | IAccount,
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
      console.log({ detail: JSON.stringify(eventDetail)})
      console.log("PUBLISHING EVENT", event)
    } catch (e) {
      throw new InternalServerError(`Failed with error: ${e}`)
    }
  }
}