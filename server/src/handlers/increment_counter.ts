
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type IncrementCounterInput, type Counter } from '../schema';
import { sql } from 'drizzle-orm';

export const incrementCounter = async (input: IncrementCounterInput): Promise<Counter> => {
  try {
    // First, check if a counter exists
    const existingCounters = await db.select()
      .from(countersTable)
      .limit(1)
      .execute();

    let result;

    if (existingCounters.length === 0) {
      // No counter exists, create one with the increment amount
      result = await db.insert(countersTable)
        .values({
          value: input.amount,
          updated_at: new Date()
        })
        .returning()
        .execute();
    } else {
      // Counter exists, increment its value
      const currentCounter = existingCounters[0];
      result = await db.update(countersTable)
        .set({
          value: currentCounter.value + input.amount,
          updated_at: new Date()
        })
        .where(sql`id = ${currentCounter.id}`)
        .returning()
        .execute();
    }

    return result[0];
  } catch (error) {
    console.error('Counter increment failed:', error);
    throw error;
  }
};
