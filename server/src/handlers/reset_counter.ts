
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type ResetCounterInput, type Counter } from '../schema';
import { eq } from 'drizzle-orm';

export const resetCounter = async (input: ResetCounterInput): Promise<Counter> => {
  try {
    // Check if a counter exists
    const existingCounters = await db.select()
      .from(countersTable)
      .execute();

    if (existingCounters.length === 0) {
      // Create new counter with the reset value
      const result = await db.insert(countersTable)
        .values({
          value: input.value,
          updated_at: new Date()
        })
        .returning()
        .execute();

      return result[0];
    } else {
      // Update existing counter (assume we're working with the first/only counter)
      const counterId = existingCounters[0].id;
      const result = await db.update(countersTable)
        .set({
          value: input.value,
          updated_at: new Date()
        })
        .where(eq(countersTable.id, counterId))
        .returning()
        .execute();

      return result[0];
    }
  } catch (error) {
    console.error('Counter reset failed:', error);
    throw error;
  }
};
