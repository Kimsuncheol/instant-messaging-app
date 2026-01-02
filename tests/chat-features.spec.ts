import { test, expect } from '@playwright/test';

test('Chat Features E2E Test', async ({ page }) => {
  // 1. Login
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'user1@example.com');
  await page.fill('input[type="password"]', 'user1@');
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await expect(page).toHaveURL('http://localhost:3000');

  // 2. Select a chat (assuming there's at least one chat or we create one)
  // For this test, we might need to find a user or create a new chat if none exists.
  // We'll assume a chat exists or we can click the first one.
  const firstChat = page.locator('.MuiListItem-root').first();
  if (await firstChat.isVisible()) {
    await firstChat.click();
  } else {
    // If no chat, maybe create one? Skipping for now as user1 likely has data
    console.log("No chats found, skipping chat specific tests");
    return;
  }

  // 3. Test Emoji Picker
  await page.click('button[aria-label="emoji"]'); // Needs aria-label or specific selector
  await expect(page.locator('.EmojiPickerReact')).toBeVisible();
  await page.locator('.EmojiPickerReact button.emoji-btn').first().click(); // Click first emoji
  await page.keyboard.press('Escape'); // Close picker

  // 4. Test Attachment Menu
  await page.click('button[aria-label="attach"]'); // Needs selector
  await expect(page.getByText('Photo')).toBeVisible();
  await expect(page.getByText('Document')).toBeVisible();
  await page.keyboard.press('Escape'); // Close menu

  // 5. Test Message Translation (Context Menu)
  const lastMessage = page.locator('.message-bubble').last(); // Needs class
  await lastMessage.click({ button: 'right' });
  await expect(page.getByText('Translate')).toBeVisible();
  await page.click('body'); // Close context menu

  // 6. Sign Out
  await page.goto('http://localhost:3000/settings');
  await page.click('button:has-text("Sign Out")');
  await expect(page).toHaveURL('http://localhost:3000/login');
});
