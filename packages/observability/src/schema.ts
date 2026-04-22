export type Severity = "info" | "warn" | "error";

export type EventType = "request" | "job";

export type WideEvent = {
	id: string;
	type: EventType;
	severity: Severity;
	timestamp: string;

	service: string;
	hostname: string;

	request_id?: string;
	method?: string;
	path?: string;
	procedure?: string;
	status_code?: number;
	duration_ms?: number;
	input_size?: number;
	user_id?: string;

	error_code?: string;
	error?: {
		type: string;
		code: string;
		message: string;
		stack?: string;
	};

	job_id?: string;
	job_name?: string;
	queue?: string;
	attempt?: number;
	job_status?: string;
	items_processed?: number;
	items_failed?: number;

	[key: string]: unknown;
};

export type EventFilters = {
	severity?: Severity;
	type?: EventType;
	procedure?: string;
	job_name?: string;
	user_id?: string;
	error_code?: string;
	min_duration_ms?: number;
	from?: string;
	to?: string;
};

export type EventQueryOptions = {
	filters?: EventFilters;
	limit?: number;
	offset?: number;
};
