import { test, expect, Page } from '@playwright/test';

/**
 * Full Application E2E Test Suite
 * Tests the complete flow of the AI Outfit Assistant with Keycloak authentication
 */

// Test configuration
const TEST_USER = {
  email: 'sailesh.sharma@gmail.com',
  password: 'Admin@123',
};

const KEYCLOAK_URL = 'http://localhost:8080';
const FRONTEND_URL = 'http://localhost:5174';
const BACKEND_URL = 'http://localhost:5001';

// Helper function to login
async function loginToKeycloak(page: Page) {
  // Wait for Keycloak login page
  await page.waitForURL(/localhost:8080.*/, { timeout: 10000 });

  // Fill in credentials
  await page.fill('#username', TEST_USER.email);
  await page.fill('#password', TEST_USER.password);

  // Click login button
  await page.click('#kc-login');

  // Wait for redirect back to app
  await page.waitForURL(FRONTEND_URL, { timeout: 10000 });
}

// Helper function to create a test image
function createTestImageDataUrl(): string {
  // 1x1 red pixel PNG
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
}

test.describe('AI Outfit Assistant - Full Application E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Set longer timeout for tests
    test.setTimeout(120000);

    // Check if services are running
    const servicesHealthy = await checkServices();
    if (!servicesHealthy) {
      test.skip(true, 'Required services are not running');
    }
  });

  test('1. Keycloak Authentication Flow', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    // Should redirect to Keycloak login
    await expect(page).toHaveURL(/localhost:8080.*/, { timeout: 10000 });

    // Login
    await loginToKeycloak(page);

    // Should be back on main app
    await expect(page).toHaveURL(FRONTEND_URL);

    // Should see user name in header
    await expect(page.locator('text=Sailesh Sharma')).toBeVisible({ timeout: 5000 });

    console.log('✅ Authentication flow successful');
  });

  test('2. Rate My Outfit - Complete Flow', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    // Login if needed
    if (page.url().includes('8080')) {
      await loginToKeycloak(page);
    }

    // Navigate to Rate My Outfit (should be default)
    await expect(page.locator('text=Rate Your Outfit')).toBeVisible();

    // Upload image (simulate file upload)
    const imageInput = page.locator('input[type="file"]').first();

    // Create a test file
    await imageInput.setInputFiles({
      name: 'test-outfit.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64'),
    });

    // Select occasion
    await page.selectOption('select', { label: 'Party' });

    // Wait a bit for form to be ready
    await page.waitForTimeout(500);

    // Click Rate My Outfit button
    await page.click('button:has-text("Rate My Outfit")');

    // Wait for loading to complete (max 30 seconds for AI processing)
    await page.waitForSelector('text=/Wow Factor|Overall Rating/', { timeout: 30000 });

    // Verify results are displayed
    await expect(page.locator('text=Wow Factor')).toBeVisible();
    await expect(page.locator('text=Occasion Fitness')).toBeVisible();
    await expect(page.locator('text=Overall Rating')).toBeVisible();

    // Verify shopping recommendations exist
    await expect(page.locator('text=Shopping Recommendations')).toBeVisible();

    // Verify store buttons are present
    await expect(page.locator('button:has-text("Amazon")')).toBeVisible();
    await expect(page.locator('button:has-text("Shein")')).toBeVisible();

    console.log('✅ Rate My Outfit flow successful');
  });

  test('3. Generate Outfit - Complete Flow', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    // Login if needed
    if (page.url().includes('8080')) {
      await loginToKeycloak(page);
    }

    // Navigate to Outfit Generator
    await page.click('button:has-text("Outfit Generator"), a:has-text("Outfit Generator")');
    await page.waitForTimeout(500);

    // Verify we're on Generator page
    await expect(page.locator('text=Generate Your Perfect Outfit')).toBeVisible();

    // Upload image
    const imageInput = page.locator('input[type="file"]').first();
    await imageInput.setInputFiles({
      name: 'test-person.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64'),
    });

    // Select occasion
    await page.selectOption('select', { label: 'Wedding' });

    // Wait a bit
    await page.waitForTimeout(500);

    // Click Generate Outfit button
    await page.click('button:has-text("Generate Outfit")');

    // Wait for AI to generate (max 45 seconds - image generation takes longer)
    await page.waitForSelector('text=/Your Perfect Outfit|The Vision/', { timeout: 45000 });

    // Verify results
    await expect(page.locator('text=/Your Perfect Outfit|AI Generated/')).toBeVisible();

    // Verify shop the look section with store buttons
    const shopSection = page.locator('text=Shop The Look');
    if (await shopSection.isVisible()) {
      // Verify store buttons
      await expect(page.locator('button:has-text("Amazon")').first()).toBeVisible();
    }

    console.log('✅ Generate Outfit flow successful');
  });

  test('4. Profile Page', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    // Login if needed
    if (page.url().includes('8080')) {
      await loginToKeycloak(page);
    }

    // Click on user menu
    await page.click('button:has-text("Sailesh Sharma")');
    await page.waitForTimeout(300);

    // Click My Profile
    await page.click('text=My Profile');
    await page.waitForTimeout(500);

    // Verify profile page elements
    await expect(page.locator('text=My Profile')).toBeVisible();
    await expect(page.locator('text=Account Information')).toBeVisible();
    await expect(page.locator('text=sailesh.sharma')).toBeVisible();

    console.log('✅ Profile page test successful');
  });

  test('5. Logout Flow', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    // Login if needed
    if (page.url().includes('8080')) {
      await loginToKeycloak(page);
    }

    // Click on user menu
    await page.click('button:has-text("Sailesh Sharma")');
    await page.waitForTimeout(300);

    // Click Logout
    await page.click('text=Logout');
    await page.waitForTimeout(300);

    // Confirm logout
    await page.click('button:has-text("Yes, Logout")');

    // Should redirect to Keycloak login
    await expect(page).toHaveURL(/localhost:8080.*/, { timeout: 10000 });

    console.log('✅ Logout flow successful');
  });

  test('6. Fashion Arena - Browse Submissions', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    // Login if needed
    if (page.url().includes('8080')) {
      await loginToKeycloak(page);
    }

    // Navigate to Fashion Arena
    await page.click('text=Fashion Arena');
    await page.waitForTimeout(500);

    // Verify arena page loaded
    await expect(page.locator('text=/Fashion Arena|Browse|Leaderboard/')).toBeVisible();

    console.log('✅ Fashion Arena test successful');
  });

  test('7. Navigation Between Pages', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    // Login if needed
    if (page.url().includes('8080')) {
      await loginToKeycloak(page);
    }

    // Test navigation to each section
    const sections = [
      'Outfit Generator',
      'Fashion Arena',
      'Rate Your Outfit', // Back to rater
    ];

    for (const section of sections) {
      await page.click(`text=${section}`);
      await page.waitForTimeout(500);
      await expect(page.locator(`text=${section}`)).toBeVisible();
    }

    console.log('✅ Navigation test successful');
  });

  test('8. Responsive Design - Mobile View', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(FRONTEND_URL);

    // Login if needed
    if (page.url().includes('8080')) {
      await loginToKeycloak(page);
    }

    // Verify layout works on mobile
    await expect(page.locator('text=Rate Your Outfit')).toBeVisible();

    console.log('✅ Mobile responsive test successful');
  });

  test('9. Error Handling - No Image Selected', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    // Login if needed
    if (page.url().includes('8080')) {
      await loginToKeycloak(page);
    }

    // Try to submit without image
    await page.click('button:has-text("Rate My Outfit")');

    // Should show error message
    await expect(page.locator('text=/Please select an image|No image/')).toBeVisible({ timeout: 3000 });

    console.log('✅ Error handling test successful');
  });

  test('10. Shopping Buttons - Click Functionality', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    // Login if needed
    if (page.url().includes('8080')) {
      await loginToKeycloak(page);
    }

    // Upload and rate outfit first
    const imageInput = page.locator('input[type="file"]').first();
    await imageInput.setInputFiles({
      name: 'test-outfit.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64'),
    });

    await page.selectOption('select', { label: 'Casual' });
    await page.waitForTimeout(500);
    await page.click('button:has-text("Rate My Outfit")');

    // Wait for results
    await page.waitForSelector('text=Shopping Recommendations', { timeout: 30000 });

    // Listen for new page (popup)
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('button:has-text("Amazon")').catch(() => {
        console.log('No Amazon button found, test skipped');
      }),
    ]);

    if (popup) {
      // Verify new tab opened with shopping URL
      expect(popup.url()).toContain('amazon.com');
      await popup.close();
    }

    console.log('✅ Shopping buttons test successful');
  });
});

// Helper function to check if all services are running
async function checkServices(): Promise<boolean> {
  try {
    // Check Keycloak
    const keycloakResponse = await fetch(`${KEYCLOAK_URL}/health/ready`);
    if (!keycloakResponse.ok) {
      console.error('❌ Keycloak is not ready');
      return false;
    }

    // Check Backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/health`);
    if (!backendResponse.ok) {
      console.error('❌ Backend is not ready');
      return false;
    }

    console.log('✅ All services are running');
    return true;
  } catch (error) {
    console.error('❌ Service health check failed:', error);
    return false;
  }
}
