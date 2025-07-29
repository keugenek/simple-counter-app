
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type ResetCounterInput } from '../schema';
import { resetCounter } from '../handlers/reset_counter';
import { eq } from 'drizzle-orm';

// Test input with default value
const testInputDefault: ResetCounterInput = {
  value: 0
};

// Test input with custom value
const testInputCustom: ResetCounterInput = {
  value: 42
};

describe('resetCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a new counter when none exists', async () => {
    const result = await resetCounter(testInputDefault);

    // Basic field validation
    expect(result.value).toEqual(0);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create counter with custom reset value', async () => {
    const result = await resetCounter(testInputCustom);

    expect(result.value).toEqual(42);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save new counter to database', async () => {
    const result = await resetCounter(testInputDefault);

    // Query database to verify counter was saved
    const counters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, result.id))
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].value).toEqual(0);
    expect(counters[0].created_at).toBeInstanceOf(Date);
    expect(counters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should reset existing counter value', async () => {
    // First create a counter with some value
    await db.insert(countersTable)
      .values({ value: 100 })
      .execute();

    // Reset to default value
    const result = await resetCounter(testInputDefault);

    expect(result.value).toEqual(0);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should reset existing counter to custom value', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({ value: 999 })
      .execute();

    // Reset to custom value
    const result = await resetCounter(testInputCustom);

    expect(result.value).toEqual(42);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update database when resetting existing counter', async () => {
    // Create initial counter
    const initial = await db.insert(countersTable)
      .values({ value: 555 })
      .returning()
      .execute();

    const initialId = initial[0].id;

    // Reset the counter
    await resetCounter(testInputDefault);

    // Verify database was updated
    const counters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, initialId))
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].value).toEqual(0);
    expect(counters[0].id).toEqual(initialId);
    expect(counters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should only have one counter after multiple resets', async () => {
    // Reset multiple times
    await resetCounter(testInputDefault);
    await resetCounter(testInputCustom);
    await resetCounter({ value: 10 });

    // Should still only have one counter in database
    const allCounters = await db.select()
      .from(countersTable)
      .execute();

    expect(allCounters).toHaveLength(1);
    expect(allCounters[0].value).toEqual(10);
  });
});
