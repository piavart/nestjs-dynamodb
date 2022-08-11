/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Module,
  Global,
  Inject,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import {
  IDynamoDBModuleAsyncOptions,
  IDynamoDBModuleOptions,
} from './dynamodb.interfaces';
import { DynamoDB } from 'aws-sdk';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import {
  DYNAMO_DB_CLIENT,
  DYNAMO_DB_DATA_MAPPER,
  DYNAMO_DB_MODULE_OPTIONS,
} from './dynamodb.constants';
import { createMapper, createDynamodbClient } from './dynamodb.config';

@Global()
@Module({})
export class DynamoDBCoreModule {
  constructor(
    @Inject(DYNAMO_DB_CLIENT) private readonly dynamoDBClient: DynamoDB,
    @Inject(DYNAMO_DB_DATA_MAPPER)
    private readonly dynamoDBDataMapper: DataMapper,
  ) {}

  static forRoot(options: IDynamoDBModuleOptions): DynamicModule {
    const dynamodbClient = createDynamodbClient(options);

    const mapper = createMapper(dynamodbClient, options.dynamoDBOptions);

    const clientProvider = {
      provide: DYNAMO_DB_CLIENT,
      useValue: dynamodbClient,
    };

    const dataMapperProvider = {
      provide: DYNAMO_DB_DATA_MAPPER,
      useValue: mapper,
    };

    return {
      module: DynamoDBCoreModule,
      providers: [dataMapperProvider, clientProvider],
      exports: [dataMapperProvider, clientProvider],
    };
  }

  static forRootAsync(options: IDynamoDBModuleAsyncOptions): DynamicModule {
    const clientProvider = {
      provide: DYNAMO_DB_CLIENT,
      useFactory: (dynamoDBModuleOptions: IDynamoDBModuleOptions): DynamoDB =>
        createDynamodbClient(dynamoDBModuleOptions),
      inject: [DYNAMO_DB_MODULE_OPTIONS], // inject output of async config creator
    };
    const dataMapperProvider = {
      provide: DYNAMO_DB_DATA_MAPPER,
      useFactory: (
        dynamoDB: DynamoDB,
        _options: IDynamoDBModuleOptions,
      ): DataMapper => createMapper(dynamoDB, _options.dynamoDBOptions),
      inject: [DYNAMO_DB_CLIENT, DYNAMO_DB_MODULE_OPTIONS], // inject output of async config creator
    };

    const asyncProviders = this.createAsyncProviders(options);

    return {
      module: DynamoDBCoreModule,
      imports: options.imports, // imports from async for root
      providers: [...asyncProviders, dataMapperProvider, clientProvider],
      exports: [dataMapperProvider, clientProvider],
    };
  }

  private static createAsyncProviders(
    options: IDynamoDBModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory)
      return [this.createAsyncOptionsProvider(options)];

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass!,
        useClass: options.useClass!,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: IDynamoDBModuleAsyncOptions,
  ): Provider {
    if (options.useFactory)
      return {
        provide: DYNAMO_DB_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    return {
      provide: DYNAMO_DB_MODULE_OPTIONS,
      useValue: {},
      inject: [],
    };
  }
}
