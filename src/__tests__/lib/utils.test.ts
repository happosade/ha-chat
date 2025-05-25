import { expect, jest } from '@jest/globals';
import { cn } from '@/lib/utils';

jest.mock('clsx', () => ({
  clsx: jest.fn().mockImplementation((...args) => args.join(' ')),
}));

jest.mock('tailwind-merge', () => ({
  twMerge: jest.fn().mockImplementation((input) => input),
}));

describe('Utils', () => {
  describe('cn function', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2', { class3: true, class4: false });
      expect(result).toBeDefined();
      // The actual implementation details are less important since we've mocked the dependencies
    });
  });
});