import { Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { ConfigurationOptions, DynamoDB } from 'aws-sdk';
import { ConfigurationServicePlaceholders } from 'aws-sdk/lib/config_service_placeholders';
import { CreateTableOptions } from '@aws/dynamodb-data-mapper';
import { APIVersions } from 'aws-sdk/lib/config';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IDynamoDBClass {}

export interface IDynamoDBClassWithOptions {
  tableOptions: CreateTableOptions;
  dynamoDBClass: IDynamoDBClass;
}

export type DynamoDBInput = IDynamoDBClass | IDynamoDBClassWithOptions;

export interface IDynamoDBModuleOptions {
  dynamoDBOptions: DynamoDB.ClientConfiguration & {
    tablePrefix?: string;
  };
  AWSConfig: Partial<
    ConfigurationOptions & ConfigurationServicePlaceholders & APIVersions
  >;
}

export interface IDynamoDBOptionsFactory {
  createTypegooseOptions():
    | Promise<IDynamoDBModuleOptions>
    | IDynamoDBModuleOptions;
}

export interface IDynamoDBModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  connectionName?: string;
  useExisting?: Type<IDynamoDBOptionsFactory>;
  useClass?: Type<IDynamoDBOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<IDynamoDBModuleOptions> | IDynamoDBModuleOptions;
  inject?: any[];
}
