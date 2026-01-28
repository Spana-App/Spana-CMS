import { test, expect } from '@jest/globals';
import { useAuthStore } from '../store/authentication';

test('authentication store is defined', () => {
  expect(useAuthStore).toBeDefined();
});

export {};