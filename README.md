# NestJS DynamoDB
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>
<p align="center">
<a href="https://www.npmjs.com/package/@piavart/nestjs-dynamodb"><img src="https://img.shields.io/npm/v/@piavart/nestjs-dynamodb" alt="NPM Version"></a>
<a href="https://github.com/piavart/nestjs-dynamoose/blob/master/LICENSE"><img src="https://img.shields.io/github/license/piavart/nestjs-dynamodb" alt="Package License"></a>
<a href="https://github.com/piavart/nestjs-dynamodb/actions"><img src="https://github.com/piavart/nestjs-dynamodb/workflows/Node.js%20CI/badge.svg" alt="CI"></a>

NestJs module for working with dynamodb-data-mapper with a document-oriented approach

## Install
`npm install @piavart/nestjs-dynamodb`

## Usage

In order to create a DynamoDB connection

**app.module.ts**

``` ts
import { Module } from '@nestjs/common';
import { DynamoDBModule } from 'nestjs-dynamodb';

import { UsersModule } from './users.module.ts';

@Module({
  imports: [
    DynamoDBModule.forRoot({
      AWSConfig: {},
      dynamoDBOptions: {},
    }),
    UsersModule,
  ],
})
export class AppModule {}
```

## Async configuration

**app.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { DynamoDBModule } from 'nestjs-dynamodb';

@Module({
  imports: [
    DynamoDBModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        AWSConfig: {
          region: 'local',
          accessKeyId: 'null',
          secretAccessKey: 'null',
        },
        dynamoDBOptions: {
          endpoint: config.get<string>('DYNAMODB_URL', 'localhost:8000'),
          sslEnabled: false,
          region: 'local-env',
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

**users.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { DynamoDBModule } from 'nestjs-dynamodb';

import { UserEntity } from './user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [DynamoDBModule.forFeature([UserEntity])],
  providers: [UsersService],
})
export class UsersModule {}
```

To insert records to DynamoDB, you first need to create your table, for this we use [dynamodb-data-mapper-annotations](https://github.com/awslabs/dynamodb-data-mapper-js/tree/master/packages/dynamodb-data-mapper-annotations) (under the hood). Every decorator in that package is exposed in this package as well **BUT CAPITALIZED** .

**user.entity.ts**

```typescript
import { 
  Attribute, 
  Table, 
  VersionAttribute, 
  TModel, 
  TDynamoDbDocument 
} from 'nestjs-dynamodb';
import * as nanoid from 'nanoid';

export type UserPrimaryKey = { pk: string; sk: string }
export type UserModel = TModel<UserSchema, UserPrimaryKey>;
export type UserDocument = TDynamoDbDocument<UserEntity>;

@Table('users')
class UserEntity {
  @HashKey({ defaultProvider: nanoid })
  pk: string;

  @RangeKey()
  sk: string;

  @Attribute({
    type: 'Document',
    attributeName: '_p', // mapping name of field
    members: {
      name: {
        type: 'String'
      },
      age: {
        type: 'Number'
      }
    }
  })
  profile: {
    name: string;
    age: number;
  };

  @Attribute()
  createdAt: Date;

  @Attribute({ defaultProvider: () => new Date() })
  updatedAt: Date;

  // This property will not be saved to DynamoDB.
  notPersistedToDynamoDb: string;

  @VersionAttribute()
  __v: number;
}
```


**users.service.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-dynamodb';

import { UserModel, UserEntity, UserDocument, UserPrimaryKey } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(UserEntity) private readonly userModel: UserModel) {}

  async all(input: Partial<UserInput>): Promise<UserDocument[]> {
    return this.userModel.query(input);
  }

  async find(pk: UserPrimaryKey): Promise<UserDocument> {
    return this.userModel.findByPrimaryKey(pk);
  }

  async create(input: UserInput): Promise<UserDocument> {
    return this.userModel.create(input);
  }

  async delete(pk: UserPrimaryKey): Promise<DynamoDB.DeleteItemOutput> {
    return this.userModel.delete(pk);
  }

  async update(pk: UserPrimaryKey, item: UserInput): Promise<UserDocument> {
    return this.userModel.update(pk, item);
  }
}
```