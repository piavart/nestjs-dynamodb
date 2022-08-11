import { Document } from './document';
import { Model } from './model';

export type TModel<
  T extends Record<string, any>,
  TPrimaryKey extends Record<string, string | number> = { id: string },
> = Model<T, TPrimaryKey>;

export type TBasePrimaryKey = Record<string, string | number>;
export type TEntity = Record<string, any>;

export type TCreateInput<
  T extends TEntity,
  PK extends TBasePrimaryKey,
> = Partial<T> & PK;

export type TDynamoDbDocument<T extends Record<string, any>> = T & Document<T>;
