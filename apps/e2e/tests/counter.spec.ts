import { expect, test } from "../playwright/fixtures.ts";

test("incrementa counter e UI reflete o novo valor", async ({ page }) => {
	await page.goto("/");

	const value = page.getByLabel("Valor atual");

	await expect(value).toHaveText("0");

	await page.getByRole("button", { name: /incrementar/i }).click();

	await expect(value).toHaveText("1");
});
