/* eslint-disable @typescript-eslint/no-unused-vars */
import { Schema } from '@aws/dynamodb-data-marshaller';

export function getVersionAttribute(schema: Schema): string | undefined {
  const attribute = Object.entries(schema).filter(([_key, value]) => {
    return value.type === 'Number' && value.versionAttribute;
  })[0];
  return attribute ? attribute[0] : attribute;
}
