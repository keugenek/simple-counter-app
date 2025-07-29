
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type IncrementCounterInput } from '../schema';
import { incrementCounter } from '../handlers/increment_counter';

describe('incrementCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a new counter with increment amount when none exists', async () => {
    const input: IncrementCounterInput = {
      amount: 5
    };

    const result = await incrementCounter(input);

    expect(result.value).toEqual(5);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should increment existing counter value', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({
        value: 10
      })
      .execute();

    const input: IncrementCounterInput = {
      amount: 3
    };

    const result = await incrementCounter(input);

    expect(result.value).toEqual(13);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should use default amount of 1 when not specified', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({
        value: 7
      })
      .execute();

    const input: IncrementCounterInput = {
      amount: 1 // Default value from Zod schema
    };

    const result = await incrementCounter(input);

    expect(result.value).toEqual(8);
  });

  it('should save updated counter to database', async () => {
    // Create initial counter
    const initial = await db.insert(countersTable)
      .values({
        value: 20
      })
      .returning()
      .execute();

    const input: IncrementCounterInput = {
      amount: 15
    };

    const result = await incrementCounter(input);

    // Verify in database
    const counters = await db.select()
      .from(countersTable)
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].value).toEqual(35);
    expect(counters[0].id).toEqual(initial[0].id);
    expect(counters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle large increment amounts', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({
        value: 100
      })
      .execute();

    const input: IncrementCounterInput = {
      amount: 999999
    };

    const result = await incrementCounter(input);

    expect(result.value).toEqual(1000099);
  });
});
