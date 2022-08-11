import * as AWS from 'aws-sdk';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { IDynamoDBModuleOptions } from './dynamodb.interfaces';
import { DynamoDB } from 'aws-sdk';

export const createDynamodbClient = (
  options: IDynamoDBModuleOptions,
): DynamoDB => {
  AWS.config.update(options.AWSConfig);
  return new DynamoDB(options.dynamoDBOptions);
};

export const createMapper = (
  dynamoDBClient: DynamoDB,
  options: IDynamoDBModuleOptions['dynamoDBOptions'],
): DataMapper =>
  new DataMapper({
    client: dynamoDBClient, // the SDK client used to execute operations
    tableNamePrefix: options.tablePrefix || '',
  });
