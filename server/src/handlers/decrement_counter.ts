
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type DecrementCounterInput, type Counter } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const decrementCounter = async (input: DecrementCounterInput): Promise<Counter> => {
  try {
    // Get the most recent counter (if any exists)
    const existingCounters = await db.select()
      .from(countersTable)
      .orderBy(desc(countersTable.id))
      .limit(1)
      .execute();

    let result;
    
    if (existingCounters.length === 0) {
      // No counter exists, create one with negative value
      const insertResult = await db.insert(countersTable)
        .values({
          value: -input.amount,
          updated_at: new Date()
        })
        .returning()
        .execute();
      
      result = insertResult[0];
    } else {
      // Update existing counter by decrementing
      const currentCounter = existingCounters[0];
      const newValue = currentCounter.value - input.amount;
      
      const updateResult = await db.update(countersTable)
        .set({
          value: newValue,
          updated_at: new Date()
        })
        .where(eq(countersTable.id, currentCounter.id))
        .returning()
        .execute();
      
      result = updateResult[0];
    }

    return result;
  } catch (error) {
    console.error('Counter decrement failed:', error);
    throw error;
  }
};
