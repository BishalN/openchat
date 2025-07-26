import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
    test('should display landing page with sign-in and key elements', async ({ page }) => {
        // Navigate to the landing page
        await page.goto('/');

        // Check for the main heading
        await expect(page.getByRole('heading', { level: 1 })).toContainText('An Open Source Alternative to Chatbase');

        // Check for sign-in link (when user is not authenticated)
        await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();

        // Check for the main CTA button
        await expect(page.getByRole('link', { name: 'Create your chatbot' })).toBeVisible();

        // Check for GitHub link in the hero section
        await expect(page.locator('a[href="https://github.com/bishaln/ChatBuddy"]').first()).toBeVisible();

        // Check for the logo and brand name in the header
        await expect(page.locator('header').getByText('ChatBuddy')).toBeVisible();

    });

    test('should have working navigation links', async ({ page }) => {
        await page.goto('/');

        // Test GitHub link in hero section
        const githubLink = page.locator('a[href="https://github.com/bishaln/ChatBuddy"]').first();
        await expect(githubLink).toBeVisible();

        // Test create chatbot link
        const createLink = page.getByRole('link', { name: 'Create your chatbot' });
        await expect(createLink).toHaveAttribute('href', '/dashboard/create-agent');
    });

    test('should display chat interface preview correctly', async ({ page }) => {
        await page.goto('/');

        // Check for the chat window elements
        await expect(page.getByText('Hi there! I\'m your ChatBuddy assistant')).toBeVisible();
        await expect(page.getByText('What makes ChatBuddy different from other AI platforms?')).toBeVisible();

        // Check for the input field and send button
        await expect(page.getByPlaceholder('Ask something...')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Send' })).toBeVisible();
    });
}); 