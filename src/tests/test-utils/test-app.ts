import { Test, TestingModule } from '@nestjs/testing';
import { DynamoDB } from 'aws-sdk';
import { setup } from 'jest-dynalite';
import { CatSchema } from './schemas/cat.schema';
import { TestService } from './test.service';
import { SubscriptionSchema } from './schemas/subscription.schema';
import { DynamoDBModule } from '../../module/dynamodb.module';

/**
 * TestApp creation alias
 * calls in every beforeEach hook
 */
export async function createTestApp() {
  const app = new TestApp();
  await app.init();

  return app;
}

/**
 * Common test module used in every testcase
 * Describes root module dependensies
 */
export class TestApp {
  private moduleRef: TestingModule | undefined;
  private ddb!: DynamoDB;

  get module() {
    if (!this.moduleRef) {
      throw new Error('test app should be initialized');
    }

    return this.moduleRef;
  }

  async init() {
    this.moduleRef = await Test.createTestingModule({
      imports: [
        DynamoDBModule.forRoot({
          AWSConfig: {
            region: 'eu-north-1',
            credentials: {
              accessKeyId: 's',
              secretAccessKey: 's',
            },
          },
          dynamoDBOptions: {
            endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
          },
        }),
        DynamoDBModule.forFeature([CatSchema, SubscriptionSchema]),
      ],
      providers: [TestService],
    }).compile();
  }

  /**
   * calls in every afterEach hook
   */
  async close() {
    await this.module.close();
  }
}

export function setupDynalite() {
  setup(__dirname);
}
