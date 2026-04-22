import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { queryClient } from "@/lib/orpc";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return (
		<ThemeProvider>
			<QueryClientProvider client={queryClient}>
				<Outlet />
				<Toaster />
				{import.meta.env.DEV && <TanStackRouterDevtools />}
				{import.meta.env.DEV && <ReactQueryDevtools />}
			</QueryClientProvider>
		</ThemeProvider>
	);
}
