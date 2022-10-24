import { DynamoDB } from 'aws-sdk';
import {
  DataMapper,
  CreateTableOptions,
  QueryOptions,
  DeleteOptions,
  ItemNotFoundException,
  ScanOptions,
  ParallelScanWorkerOptions,
} from '@aws/dynamodb-data-mapper';
import { unmarshallItem } from '@aws/dynamodb-data-marshaller';
import { createId } from '../util';
import { ItemList } from 'aws-sdk/clients/dynamodb';
import { createDocument } from './document';
import {
  ConditionExpression,
  ConditionExpressionPredicate,
} from '@aws/dynamodb-expressions';
import { BaseDBEntity } from './base-db-entity';
import {
  TDynamoDbDocument,
  TBasePrimaryKey,
  TCreateInput,
  TEntity,
} from './interfaces';

export class Model<
  T extends TEntity,
  TPrimaryKey extends TBasePrimaryKey,
> extends BaseDBEntity<T> {
  constructor(
    dynamoDBClass: any,
    private readonly tableOptions: CreateTableOptions,
    dynamoDBClient: DynamoDB,
    mapper: DataMapper,
  ) {
    super(dynamoDBClient, mapper, dynamoDBClass);
    mapper.ensureTableExists(this.dynamoDBClass, this.tableOptions);
  }

  public async scan(options?: ScanOptions | ParallelScanWorkerOptions) {
    const results: TDynamoDbDocument<T>[] = [];

    for await (const item of this.mapper.scan(this.dynamoDBClass, options)) {
      results.push(this.createDocument(item as never as T));
    }

    return results;
  }

  public async query(
    keyCondition:
      | ConditionExpression
      | {
          [propertyName: string]: ConditionExpressionPredicate | any;
        },
    options?: QueryOptions,
  ) {
    const results: TDynamoDbDocument<T>[] = [];

    for await (const item of this.mapper.query(
      this.dynamoDBClass,
      keyCondition,
      options,
    )) {
      results.push(this.createDocument(item as never as T));
    }
    return results;
  }

  /**
   * @description create item document without save
   */
  public createItem({
    withDefaultId = false,
  }: { withDefaultId?: boolean } = {}): TDynamoDbDocument<T> {
    const item = this.createDBClassInstanse({});

    if (withDefaultId) {
      (<any>item).id = this.createId();
    }

    const document = this.createDocument(item);

    document._isNew = true;

    return document;
  }

  public async create(
    input: TCreateInput<T, TPrimaryKey>,
  ): Promise<TDynamoDbDocument<T>> {
    const item = await this.mapper.put(this.createDBClassInstanse(input));
    return this.createDocument(item);
  }

  public async find(input: Partial<T> = {}): Promise<TDynamoDbDocument<T>[]> {
    const results: TDynamoDbDocument<T>[] = [];
    const keys = Object.keys(input);
    if (!input || JSON.stringify(input) === JSON.stringify({})) {
      for await (const item of this.mapper.scan(this.dynamoDBClass)) {
        results.push(this.createDocument(item as never as T));
      }
    } else if (
      keys.includes(this.hashKeyName) ||
      (keys.includes(this.hashKeyName) && keys.includes(this.rangeKeyName))
    ) {
      for await (const item of this.mapper.query(this.dynamoDBClass, input)) {
        results.push(this.createDocument(item as never as T));
      }
    } else {
      const key = Object.keys(input)[0];

      const items: DynamoDB.ItemList = await new Promise((resolve, reject) =>
        this.dynamoDBClient.scan(
          this.getFindItemInput(key, input[key as keyof typeof input] as any),
          (err, data) => {
            if (err) reject(err);
            resolve(data.Items as ItemList);
          },
        ),
      );

      return items.map((item) => unmarshallItem(this.schema, item));
    }

    return results;
  }

  public async findByPrimaryKey(pk: TPrimaryKey) {
    const data = await this.mapper.get(this.createDBClassInstanse(pk));
    return this.createDocument(data);
  }

  public async findByPrimaryKeyNoExcept(pk: TPrimaryKey) {
    try {
      const result = await this.findByPrimaryKey(pk);
      return result;
    } catch (e) {
      if (e instanceof ItemNotFoundException) return undefined;
      throw e;
    }
  }

  public async findByIdAndDelete(
    id: string,
  ): Promise<DynamoDB.DeleteItemOutput> {
    return new Promise((resolve, reject) =>
      this.dynamoDBClient.deleteItem(
        this.getDeleteItemInput(id),
        (err, data) => {
          if (err) reject(err);
          resolve(data);
        },
      ),
    );
  }

  public async findByPKAndUpdate(
    pk: TPrimaryKey,
    update: Partial<T>,
  ): Promise<TDynamoDbDocument<T>> {
    const item = await this.mapper.get(this.createDBClassInstanse(pk));
    const updated = await this.mapper.update(Object.assign(item, update));
    return this.createDocument(updated);
  }

  /**
   * Skip version check
   *
   * Hard update
   **/
  public async update(pk: TPrimaryKey, update: Partial<T>) {
    return this.mapper.update(
      Object.assign(this.createDBClassInstanse(pk), update),
      {
        skipVersionCheck: true,
      },
    );
  }

  public async delete(pk: TPrimaryKey, options?: DeleteOptions) {
    return this.mapper.delete(this.createDBClassInstanse(pk), options);
  }

  private getDeleteItemInput(hashKey: string): DynamoDB.DeleteItemInput {
    return {
      Key: {
        [this.hashKeyName]: {
          S: hashKey,
        },
      },
      TableName: this.tableName,
    };
  }

  private getFindItemInput(key: string, value: string): DynamoDB.ScanInput {
    return {
      ExpressionAttributeValues: {
        ':catval': {
          S: value,
        },
      },
      FilterExpression: `${key} = :catval`,
      TableName: this.tableName,
    };
  }

  private createDocument(item: T) {
    return createDocument<T>(
      item,
      this.dynamoDBClient,
      this.mapper,
      this.dynamoDBClass,
    );
  }

  public createId() {
    return createId();
  }
}
