import { DataMapper, UpdateOptions } from '@aws/dynamodb-data-mapper';
import { pick } from 'lodash';
import { BaseDBEntity } from './base-db-entity';
import { DynamoDB } from 'aws-sdk';
import { TDynamoDbDocument } from './interfaces';

export class Document<T extends Record<string, any>> extends BaseDBEntity<T> {
  /**
   * @description is new document
   */
  _isNew = false;

  constructor(
    protected __model: T,
    dynamoDBClient: DynamoDB,
    mapper: DataMapper,
    dynamoDBClass: any,
  ) {
    super(dynamoDBClient, mapper, dynamoDBClass);
  }

  get _model() {
    return this.__model;
  }

  get __v() {
    return (<T & { __v: number }>this.__model).__v;
  }

  /**
   * key fields required for the save operation
   */
  private get keyFields() {
    const fields = [this.hashKeyName];
    if (this.rangeKeyName) fields.push(this.rangeKeyName);
    if (this.versionAttribute) fields.push(this.versionAttribute);
    return fields;
  }

  get<FieldName extends keyof T>(key: FieldName): T[FieldName] {
    return this._model[key];
  }

  set<FieldName extends keyof T>(key: FieldName, value: T[FieldName]) {
    this._model[key] = value;
  }

  async save(options?: UpdateOptions & { updatedFields?: string[] }) {
    if (this._isNew) {
      await this.mapper.put(this._model, options);
    } else {
      const update = options?.updatedFields
        ? this.createDBClassInstanse(
            pick(this._model, [
              ...options.updatedFields,
              ...this.keyFields,
            ]) as never as T,
          )
        : this._model;

      const response = (await this.mapper.update(update, {
        onMissing: 'skip',
        ...options,
      })) as T;

      this.__model = response;
    }

    this._isNew = false;
  }

  toJson() {
    return this._model as TDynamoDbDocument<T>;
  }
}

/**
 * Create document proxy
 */
export function createDocument<T extends Record<string, any>>(
  item: T,
  dynamoDBClient: DynamoDB,
  mapper: DataMapper,
  dynamoDBClass: any,
): TDynamoDbDocument<T> {
  const document = new Document<T>(item, dynamoDBClient, mapper, dynamoDBClass);

  return new Proxy(document, {
    set(target, prop, value) {
      const _target: any = target;
      if (prop in _target) {
        _target[prop] = value;
      } else {
        _target.set(prop, value);
      }
      return true;
    },
    get(target, prop) {
      const _target: any = target;
      if (prop in _target) {
        return _target[prop];
      } else {
        return _target.get(prop);
      }
    },
  }) as never as T & TDynamoDbDocument<T>;
}
