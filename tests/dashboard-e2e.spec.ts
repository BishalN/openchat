import { test, expect } from '@playwright/test'
import { 
    createAndAuthenticateUser, 
    setAuthCookies, 
    cleanupTestUser, 
    supabaseAdmin 
} from './helpers/auth'

test.describe('Dashboard E2E Flow', () => {
    test('should navigate from landing page to dashboard and test agents page', async ({ page }) => {
        // Create and authenticate a test user
        const { user, session } = await createAndAuthenticateUser()

        // Set authentication cookies in browser
        await setAuthCookies(page, session)

        // Navigate to the landing page
        await page.goto('/')

        // Test dashboard access after authentication
        await test.step('Should be able toaccess dashboard/agents after authentication', async () => {
            // Navigate directly to dashboard
            await page.goto('/dashboard/agents')
        })

        // Test dashboard layout and navigation
        await test.step('Dashboard should display correct layout and navigation', async () => {
            // Check for dashboard navigation tabs
            await expect(page.getByRole('link', { name: 'Agents' })).toBeVisible()

            // Check that Agents tab is active (since we're on /dashboard/agents)
            const agentsTab = page.getByRole('link', { name: 'Agents' })
            await expect(agentsTab).toHaveClass(/border-primary/)
        })

        // Test create agent flow
        await test.step('Should navigate to create agent page', async () => {
            // Click on "New AI agent" button
            await page.getByText('New AI agent').click()

            // Should navigate to create agent page
            await page.waitForURL('**/dashboard/create-agent')

            // Check for create agent page content - use a more specific selector
            await expect(page.locator('h1').nth(1)).toContainText(/Create new agent/i)
        })

        // Cleanup: Delete test user, TODO: do it setup and tear down fashion
        await cleanupTestUser(user.id)
    })
}) 