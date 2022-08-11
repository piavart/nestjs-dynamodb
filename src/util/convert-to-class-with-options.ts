import { isClass } from 'is-class';
import {
  IDynamoDBClass,
  IDynamoDBClassWithOptions,
  DynamoDBInput,
} from '../module/dynamodb.interfaces';

const isDynamoDBClass = (item: any): item is IDynamoDBClass => isClass(item);
const isDynamoDBClassWithOptions = (
  item: any,
): item is IDynamoDBClassWithOptions => isDynamoDBClass(item.dynamoDBClass);

export const convertToClassWithOptions = (
  item: DynamoDBInput,
): IDynamoDBClassWithOptions => {
  if (isDynamoDBClass(item)) {
    return {
      dynamoDBClass: item,
      tableOptions: {
        readCapacityUnits: 5,
        writeCapacityUnits: 5,
      },
    };
  } else if (isDynamoDBClassWithOptions(item)) {
    return item;
  }
  return invalidObject('model');
};

function invalidObject(type: string): never {
  throw new Error(`Invalid ${type} object`);
}
