import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, ListRestart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/")({
	component: IndexComponent,
});

function IndexComponent() {
	return (
		<main className="min-h-screen bg-[radial-gradient(circle_at_top_left,var(--color-chart-2)/18%,transparent_30%),linear-gradient(180deg,var(--background),var(--muted))] p-6 text-foreground sm:p-10">
			<section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col justify-center gap-6">
				<div className="flex flex-col gap-2">
					<p className="font-mono text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
						oRPC SSE
					</p>
					<h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
						Event Iterator template
					</h1>
				</div>
				<div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
					<LiveCounterCard />
					<CounterEventsCard />
				</div>
			</section>
		</main>
	);
}

function LiveCounterCard() {
	const increment = useMutation(orpc.counter.increment.mutationOptions());

	return (
		<Card className="overflow-hidden border-border/80 bg-card/95 shadow-sm">
			<CardHeader className="border-b">
				<div className="flex items-center gap-2">
					<Activity className="size-4 text-chart-2" />
					<CardTitle>liveOptions</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-6 p-6">
				<div className="flex min-h-40 items-center justify-center rounded-md border bg-muted/35">
					<LiveCounterValue />
				</div>
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
	);
}

function LiveCounterValue() {
	const counter = useQuery(
		orpc.counter.live.experimental_liveOptions({
			retry: true,
		}),
	);

	if (counter.isPending) return <Skeleton className="h-16 w-28" />;
	if (counter.isError)
		return <p className="text-sm text-destructive">Não foi possível conectar ao contador.</p>;

	return (
		<output aria-label="Valor atual" className="font-mono text-7xl font-semibold tabular-nums">
			{counter.data.value}
		</output>
	);
}

function CounterEventsCard() {
	return (
		<Card className="border-border/80 bg-card/95 shadow-sm">
			<CardHeader className="border-b">
				<div className="flex items-center gap-2">
					<ListRestart className="size-4 text-chart-1" />
					<CardTitle>streamedOptions</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<CounterEventList />
			</CardContent>
		</Card>
	);
}

function CounterEventList() {
	const events = useQuery(
		orpc.counter.events.experimental_streamedOptions({
			queryFnOptions: {
				refetchMode: "reset",
				maxChunks: 8,
			},
			retry: true,
		}),
	);

	if (events.isPending)
		return (
			<div className="flex min-h-64 items-center justify-center px-6 text-sm text-muted-foreground">
				Aguardando eventos.
			</div>
		);

	if (events.isError)
		return (
			<div className="flex min-h-64 items-center justify-center px-6 text-sm text-destructive">
				Não foi possível conectar ao stream.
			</div>
		);

	return (
		<ol aria-label="Eventos do contador" className="flex min-h-64 flex-col divide-y">
			{events.data.map((event) => (
				<li key={event.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-4">
					<span className="font-mono text-xs text-muted-foreground tabular-nums">#{event.id}</span>
					<span className="text-sm font-medium">increment</span>
					<span className="font-mono text-lg font-semibold tabular-nums">{event.value}</span>
				</li>
			))}
		</ol>
	);
}
