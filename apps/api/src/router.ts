import { counterRouter } from "./features/counter/router.ts";

export const appRouter = {
	counter: counterRouter,
};

export type AppRouter = typeof appRouter;
