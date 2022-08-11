import { DataMapper } from '@aws/dynamodb-data-mapper';
import { FactoryProvider } from '@nestjs/common/interfaces';
import { DynamoDB } from 'aws-sdk';

import { getModelForClass, getModelToken } from '../util';
import { DYNAMO_DB_CLIENT, DYNAMO_DB_DATA_MAPPER } from './dynamodb.constants';
import { IDynamoDBClassWithOptions } from './dynamodb.interfaces';

type ModelFactory = (dynamoDBClient: DynamoDB, mapper: DataMapper) => any;

export function createDynamoDBProvider(
  models: IDynamoDBClassWithOptions[],
): FactoryProvider[] {
  const buildProvider = (
    { name }: any, // IDynamoDBClass
    modelFactory: ModelFactory,
  ) => {
    return {
      provide: getModelToken(name),
      useFactory: modelFactory,
      inject: [DYNAMO_DB_CLIENT, DYNAMO_DB_DATA_MAPPER],
    };
  };

  return models.reduce((providers, dynamoDBClassWithOptions) => {
    const modelFactory = (dynamoDBClient: DynamoDB, mapper: DataMapper) =>
      getModelForClass<any, any>(
        dynamoDBClassWithOptions.dynamoDBClass,
        dynamoDBClassWithOptions.tableOptions,
        dynamoDBClient,
        mapper,
      );

    const modelProvider = buildProvider(
      dynamoDBClassWithOptions.dynamoDBClass,
      modelFactory,
    );

    return [...providers, modelProvider];
  }, [] as FactoryProvider[]);
}
