import { DynamoDbTable } from '@aws/dynamodb-data-mapper';

export const getTableName = (dynamoDBClass: any): string =>
  dynamoDBClass.prototype[DynamoDbTable];
