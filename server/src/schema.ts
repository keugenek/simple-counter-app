
import { z } from 'zod';

// Counter schema
export const counterSchema = z.object({
  id: z.number(),
  value: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Counter = z.infer<typeof counterSchema>;

// Input schema for incrementing counter
export const incrementCounterInputSchema = z.object({
  amount: z.number().int().positive().default(1)
});

export type IncrementCounterInput = z.infer<typeof incrementCounterInputSchema>;

// Input schema for decrementing counter
export const decrementCounterInputSchema = z.object({
  amount: z.number().int().positive().default(1)
});

export type DecrementCounterInput = z.infer<typeof decrementCounterInputSchema>;

// Input schema for resetting counter
export const resetCounterInputSchema = z.object({
  value: z.number().int().default(0)
});

export type ResetCounterInput = z.infer<typeof resetCounterInputSchema>;
