import { createRealtimeChannel } from "../../realtime.ts";

export const counterRealtime = createRealtimeChannel<{ value: number }>();
