import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('contracts: zod schema validation', () => {
  it('validates a simple object schema', () => {
    const schema = z.object({
      id: z.string().uuid(),
      name: z.string().min(1),
      count: z.number().int().positive(),
    });

    const valid = schema.parse({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'test',
      count: 42,
    });

    expect(valid.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(valid.name).toBe('test');
    expect(valid.count).toBe(42);
  });

  it('rejects invalid uuid', () => {
    const schema = z.object({
      id: z.string().uuid(),
    });

    expect(() => schema.parse({ id: 'not-a-uuid' })).toThrow();
  });

  it('rejects missing required field', () => {
    const schema = z.object({
      name: z.string().min(1),
    });

    expect(() => schema.parse({})).toThrow();
  });

  it('validates array of objects', () => {
    const itemSchema = z.object({
      value: z.number(),
    });
    const schema = z.array(itemSchema);

    const valid = schema.parse([{ value: 1 }, { value: 2 }]);
    expect(valid).toHaveLength(2);
    expect(valid.at(0)?.value).toBe(1);
  });
});
