import { expect, test } from "../playwright/fixtures.ts";

test("setup via API + verificação via UI", async ({ page, api }) => {
	await api.counter.increment();
	await api.counter.increment();
	await api.counter.increment();

	await page.goto("/");

	await expect(page.getByText(/^\d+$/)).toHaveText("3");
});

test("ação via UI + verificação via API", async ({ page, api }) => {
	await page.goto("/");
	await page.getByRole("button", { name: /incrementar/i }).click();
	await expect(page.getByText(/^\d+$/)).toHaveText("1");

	const result = await api.counter.get();
	expect(result.value).toBe(1);
});
