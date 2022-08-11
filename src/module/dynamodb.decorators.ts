import { Inject } from '@nestjs/common';
import { getModelToken } from '../util';

export const InjectModel = (model: any) => Inject(getModelToken(model.name));
