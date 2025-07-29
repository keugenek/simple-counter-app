
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import { 
  incrementCounterInputSchema, 
  decrementCounterInputSchema, 
  resetCounterInputSchema 
} from './schema';
import { getCounter } from './handlers/get_counter';
import { incrementCounter } from './handlers/increment_counter';
import { decrementCounter } from './handlers/decrement_counter';
import { resetCounter } from './handlers/reset_counter';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  getCounter: publicProcedure
    .query(() => getCounter()),
  incrementCounter: publicProcedure
    .input(incrementCounterInputSchema)
    .mutation(({ input }) => incrementCounter(input)),
  decrementCounter: publicProcedure
    .input(decrementCounterInputSchema)
    .mutation(({ input }) => decrementCounter(input)),
  resetCounter: publicProcedure
    .input(resetCounterInputSchema)
    .mutation(({ input }) => resetCounter(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
