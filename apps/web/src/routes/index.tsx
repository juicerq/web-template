import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/")({
	component: IndexComponent,
});

function IndexComponent() {
	const queryClient = useQueryClient();
	const counter = useQuery(orpc.counter.get.queryOptions());
	const increment = useMutation(
		orpc.counter.increment.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: orpc.counter.key() });
			},
		}),
	);

	return (
		<main className="flex min-h-screen items-center justify-center p-8">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>Counter</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col items-center gap-6">
					{counter.isLoading ? (
						<Skeleton className="h-12 w-16" />
					) : (
						<span className="font-mono text-5xl tabular-nums">{counter.data?.value ?? 0}</span>
					)}
					<Button
						className="w-full"
						onClick={() => increment.mutate(undefined)}
						disabled={increment.isPending}
					>
						<Plus />
						Incrementar
					</Button>
				</CardContent>
			</Card>
		</main>
	);
}
