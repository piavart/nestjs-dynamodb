import { getVersionAttribute } from '../util/get-version-attribute';
import { Schema } from '@aws/dynamodb-data-marshaller';

describe('Utils', () => {
  describe('getVersionAttribute', () => {
    it('version attribute', () => {
      const tests: { schema: Schema; attributeName: string | undefined }[] = [
        {
          schema: {
            id: { type: 'String' },
            __v: { type: 'Number', versionAttribute: true },
          },
          attributeName: '__v',
        },
        {
          schema: {
            id: { type: 'String' },
            custom: { type: 'Number', versionAttribute: true },
          },
          attributeName: 'custom',
        },
        {
          schema: {
            id: { type: 'String' },
          },
          attributeName: undefined,
        },
      ];
      for (const test of tests) {
        const attribute = getVersionAttribute(test.schema);
        expect(attribute).toBe(test.attributeName);
      }
    });
  });
});
