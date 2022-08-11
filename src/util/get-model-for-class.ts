import { Model } from '../entities/model';
import { CreateTableOptions, DataMapper } from '@aws/dynamodb-data-mapper';
import { DynamoDB } from 'aws-sdk';
import { IDynamoDBClass } from '../module/dynamodb.interfaces';

export const getModelForClass = <
  T,
  TPrimaryKey extends Record<string, string | number>,
>(
  dynamoDBClass: IDynamoDBClass,
  tableOptions: CreateTableOptions,
  dynamoDBClient: DynamoDB,
  mapper: DataMapper,
) =>
  new Model<T, TPrimaryKey>(
    dynamoDBClass,
    tableOptions,
    dynamoDBClient,
    mapper,
  );
