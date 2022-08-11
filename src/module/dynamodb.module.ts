import { DynamicModule, Module } from '@nestjs/common';

import { convertToClassWithOptions } from '../util';
import { DynamoDBCoreModule } from './dynamodb-core.module';
import {
  IDynamoDBModuleAsyncOptions,
  IDynamoDBModuleOptions,
  DynamoDBInput,
} from './dynamodb.interfaces';
import { createDynamoDBProvider } from './dynamodb.providers';

@Module({})
export class DynamoDBModule {
  static forRoot(options: IDynamoDBModuleOptions): DynamicModule {
    return {
      module: DynamoDBModule,
      imports: [DynamoDBCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: IDynamoDBModuleAsyncOptions): DynamicModule {
    return {
      module: DynamoDBModule,
      imports: [DynamoDBCoreModule.forRootAsync(options)],
    };
  }

  static forFeature(models: DynamoDBInput[]): DynamicModule {
    const convertedModels = models.map((model) =>
      convertToClassWithOptions(model),
    );

    const providers = createDynamoDBProvider(convertedModels);

    return {
      module: DynamoDBModule,
      providers,
      exports: providers,
    };
  }
}
