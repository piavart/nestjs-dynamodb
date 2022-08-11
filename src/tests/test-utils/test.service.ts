import { Injectable } from '@nestjs/common';
import { InjectModel } from '../../module/dynamodb.decorators';
import { CatSchema, CatModel } from './schemas/cat.schema';
import {
  SubscriptionSchema,
  SubscriptionModel,
} from './schemas/subscription.schema';

@Injectable()
export class TestService {
  constructor(
    @InjectModel(CatSchema) public readonly catsModel: CatModel,
    @InjectModel(SubscriptionSchema)
    public readonly sbsModel: SubscriptionModel,
  ) {}
}
