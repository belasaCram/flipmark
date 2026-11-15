import { expect, test } from "@playwright/test";

const DECK = `---
title: Smoke Deck
---

## Q: What is 2 + 2?
A: Four

---

## Q: The sky is green.
type: tf
A: false
explain: It is blue.

---

## Q: broken
type: mcq
- only one`;

test("paste a deck, preview, save, study and quiz it", async ({ page }) => {
  await page.goto("/");

  // Paste -> preview with a parse error -> save
  await page.getByLabel("Paste markdown").fill(DECK);
  await page.getByRole("button", { name: "Preview deck" }).click();
  await expect(page.getByText("2 cards found, 1 error")).toBeVisible();
  await expect(page.getByText("Card 3 (line 17): mcq needs at least 2 options")).toBeVisible();
  await page.getByRole("button", { name: "Save 1 deck" }).click();
  await expect(page.getByRole("heading", { name: "Smoke Deck" })).toBeVisible();

  // Study: flip with Space, mark both cards
  await page.getByRole("link", { name: "Study" }).click();
  await expect(page.getByText("What is 2 + 2?")).toBeVisible();
  await page.keyboard.press("Space");
  await expect(page.locator("p[aria-live]")).toHaveText("Answer: Four");
  await page.getByRole("button", { name: "Got it" }).click();
  await expect(page.getByText("The sky is green.").first()).toBeVisible();
  await page.getByRole("button", { name: "Review again" }).click();
  await expect(page.getByText("1 of 2 cards marked “Got it”, 1 to review.")).toBeVisible();

  // Quiz: questions are shuffled, so answer whichever comes up
  await page.getByRole("link", { name: "Take the quiz" }).click();
  for (const n of [1, 2]) {
    await expect(page.getByText(`Question ${n} of 2`)).toBeVisible();
    const typed = page.getByLabel("Type your answer from memory");
    if (await typed.isVisible()) {
      await typed.fill("four");
      await page.getByRole("button", { name: "Check answer" }).click();
    } else {
      await page.getByRole("button", { name: "False", exact: true }).click();
      await expect(page.getByText("It is blue.")).toBeVisible();
    }
    await expect(page.getByText("Correct!")).toBeVisible();
    await page.getByRole("button", { name: /Next question|See score/ }).click();
  }
  await expect(page.getByText("2 / 2")).toBeVisible();

  // The deck and its progress survive a reload (IndexedDB + localStorage)
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Smoke Deck" })).toBeVisible();
  await expect(page.getByText("1/2 known")).toBeVisible();
  await expect(page.getByText("best quiz 100%")).toBeVisible();
});
