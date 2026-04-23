import { counterRouter } from "./router/counter.ts";

export const appRouter = {
	counter: counterRouter,
};

export type AppRouter = typeof appRouter;
