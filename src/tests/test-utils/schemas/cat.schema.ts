import {
  Attribute,
  HashKey,
  Table,
  TDynamoDbDocument,
  TModel,
  VersionAttribute,
} from '../../..';

export type CatModel = TModel<CatSchema>;
export type CatDocument = TDynamoDbDocument<CatSchema>;

@Table('cats')
export class CatSchema {
  @HashKey()
  id!: string;

  @Attribute({ type: 'String', attributeName: '_n' })
  name!: string;

  @VersionAttribute()
  __v!: number;
}
