import cats from './stubs/db/cats';
import subscriptions from './stubs/db/subscriptions';

export default {
  tables: [
    {
      TableName: 'cats',
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
      data: cats,
    },

    {
      TableName: 'subscriptions',
      KeySchema: [
        { AttributeName: 'subId', KeyType: 'HASH' },
        { AttributeName: 'subject', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'subId', AttributeType: 'S' },
        { AttributeName: 'subject', AttributeType: 'S' },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
      data: subscriptions,
    },
  ],
  basePort: 7000,
};
