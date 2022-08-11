import { getSchema, DataMapper } from '@aws/dynamodb-data-mapper';
import { Schema } from '@aws/dynamodb-data-marshaller';
import { getKeys, getTableName, getVersionAttribute } from '../util';
import { DynamoDB } from 'aws-sdk';

export abstract class BaseDBEntity<T extends Record<string, any>> {
  protected readonly tableName: string;
  protected readonly schema: Schema;
  protected readonly hashKeyName: string;
  protected readonly rangeKeyName: string;
  protected readonly versionAttribute: string | undefined;

  constructor(
    protected readonly dynamoDBClient: DynamoDB,
    protected readonly mapper: DataMapper,
    protected readonly dynamoDBClass: any,
  ) {
    this.tableName = getTableName(dynamoDBClass);
    this.schema = getSchema(new dynamoDBClass());
    const { hash, range } = getKeys(this.schema);
    this.hashKeyName = hash;
    this.rangeKeyName = range;
    this.versionAttribute = getVersionAttribute(this.schema);
  }

  protected createDBClassInstanse(itemEntity: Record<string, any>): T {
    return Object.assign(new this.dynamoDBClass(), itemEntity);
  }

  protected getDynamoDBClient(): DynamoDB {
    return this.dynamoDBClient;
  }

  protected getSchema() {
    return this.schema;
  }
}
