
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type DecrementCounterInput } from '../schema';
import { decrementCounter } from '../handlers/decrement_counter';
import { eq } from 'drizzle-orm';

// Test input with default amount
const testInputDefault: DecrementCounterInput = {
  amount: 1
};

// Test input with custom amount
const testInputCustom: DecrementCounterInput = {
  amount: 5
};

describe('decrementCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create counter with negative value when no counter exists', async () => {
    const result = await decrementCounter(testInputDefault);

    expect(result.value).toEqual(-1);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should decrement existing counter by default amount', async () => {
    // Create initial counter with value 10
    await db.insert(countersTable)
      .values({
        value: 10,
        updated_at: new Date()
      })
      .execute();

    const result = await decrementCounter(testInputDefault);

    expect(result.value).toEqual(9);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should decrement existing counter by custom amount', async () => {
    // Create initial counter with value 20
    await db.insert(countersTable)
      .values({
        value: 20,
        updated_at: new Date()
      })
      .execute();

    const result = await decrementCounter(testInputCustom);

    expect(result.value).toEqual(15);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save decremented counter to database', async () => {
    // Create initial counter
    const initialResult = await db.insert(countersTable)
      .values({
        value: 8,
        updated_at: new Date()
      })
      .returning()
      .execute();

    const result = await decrementCounter(testInputCustom);

    // Verify in database
    const counters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, result.id))
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].value).toEqual(3);
    expect(counters[0].id).toEqual(initialResult[0].id);
    expect(counters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle decrementing to negative values', async () => {
    // Create counter with small positive value
    await db.insert(countersTable)
      .values({
        value: 2,
        updated_at: new Date()
      })
      .execute();

    const result = await decrementCounter(testInputCustom);

    expect(result.value).toEqual(-3);
    expect(result.id).toBeDefined();
  });

  it('should work with multiple decrements', async () => {
    // First decrement - creates counter
    const result1 = await decrementCounter(testInputDefault);
    expect(result1.value).toEqual(-1);

    // Second decrement - updates existing
    const result2 = await decrementCounter(testInputDefault);
    expect(result2.value).toEqual(-2);
    expect(result2.id).toEqual(result1.id);

    // Third decrement with custom amount
    const result3 = await decrementCounter(testInputCustom);
    expect(result3.value).toEqual(-7);
    expect(result3.id).toEqual(result1.id);
  });
});
