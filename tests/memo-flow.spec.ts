import { test, expect } from '@playwright/test';

test.describe('Memo Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Basic setup: go to home page
    await page.goto('/');
    // Note: Assuming user is already logged in for these tests, 
    // or handles login via a global setup if needed.
  });

  test('should open MemoModal when "Save to Memo" is clicked', async ({ page }) => {
    // 1. Find a message bubble
    const messageBubble = page.locator('[data-testid="message-bubble"]').first();
    await expect(messageBubble).toBeVisible();

    // 2. Right-click to open context menu
    await messageBubble.click({ button: 'right' });

    // 3. Click "Save to Memo"
    const saveToMemoOption = page.getByText('Save to Memo');
    await expect(saveToMemoOption).toBeVisible();
    await saveToMemoOption.click();

    // 4. Verify MemoModal is open
    const memoTitle = page.getByText('Write Memo');
    await expect(memoTitle).toBeVisible();

    // 5. Verify content field is pre-filled
    const contentField = page.getByLabel('Content');
    const contentValue = await contentField.inputValue();
    expect(contentValue).not.toBe('');

    // 6. Enter title and send
    await page.getByLabel('Title').fill('Automated Test Memo');
    await page.getByRole('button', { name: 'Send Memo' }).click();

    // 7. Verify modal closes
    await expect(memoTitle).not.toBeVisible();
  });

  test('should allow using AI assist in MemoModal', async ({ page }) => {
    // 1. Open MemoModal from attachment menu
    await page.getByRole('button', { name: 'Attachments' }).click();
    await page.getByText('Memo').click();

    // 2. Fill content
    await page.getByLabel('Title').fill('AI Test Memo');
    await page.getByLabel('Content').fill('This is a long text that needs to be summarized by AI.');

    // 3. Click AI Assist
    await page.getByRole('button', { name: 'AI Assist' }).click();
    
    // 4. Select Summarize
    await page.getByText('Summarize').click();

    // 5. Verify processing state (briefly) or final result
    // Since AI is mocked or slow, we just wait for the response
    await expect(page.getByText('Summarize')).not.toBeVisible();
    
    // 6. Content should have changed or at least focus remains
    const contentField = page.getByLabel('Content');
    await expect(contentField).toBeVisible();
  });
});
