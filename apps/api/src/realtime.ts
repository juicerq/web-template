import { EventPublisher } from "@orpc/server";

type RealtimePayload = Record<string, unknown>;

export type RealtimeEvent<TPayload extends RealtimePayload> = TPayload & {
	id: number;
};

export function createRealtimeChannel<TPayload extends RealtimePayload>() {
	const publisher = new EventPublisher<{ event: RealtimeEvent<TPayload> }>();
	let id = 0;

	function publish(payload: TPayload & { id?: never }) {
		id += 1;
		const event = { ...payload, id };
		publisher.publish("event", event);
		return event;
	}

	function events(signal?: AbortSignal) {
		return publisher.subscribe("event", { signal });
	}

	async function* live<TSnapshot>(options: {
		signal?: AbortSignal;
		getSnapshot: () => Promise<TSnapshot>;
		select: (event: RealtimeEvent<TPayload>) => TSnapshot;
	}) {
		const updates = publisher.subscribe("event", {
			signal: options.signal,
			maxBufferedEvents: 1,
		});

		try {
			yield await options.getSnapshot();

			for await (const event of updates) {
				yield options.select(event);
			}
		} finally {
			await updates.return(undefined);
		}
	}

	return { publish, events, live };
}
