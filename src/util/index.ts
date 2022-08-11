import { v4 as uuidv4 } from 'uuid';

export * from './get-model-for-class';
export * from './get-tokens';
export * from './get-table-name';
export * from './get-keys';
export * from './convert-to-class-with-options';
export * from './get-version-attribute';

export function createId() {
  return uuidv4();
}
