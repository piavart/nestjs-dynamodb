import {
  Attribute,
  HashKey,
  RangeKey,
  Table,
  TDynamoDbDocument,
  TModel,
  VersionAttribute,
} from '../../..';

export type TSubscriptionPK = { subId: string; subject: string };
export type SubscriptionModel = TModel<SubscriptionSchema, TSubscriptionPK>;
export type SubscriptionDocument = TDynamoDbDocument<SubscriptionSchema>;

@Table('subscriptions')
export class SubscriptionSchema {
  @HashKey()
  subId!: string;

  @RangeKey({ type: 'String' })
  subject!: string;

  @Attribute({ type: 'String' })
  status!: string;

  @VersionAttribute()
  __v!: number;
}
