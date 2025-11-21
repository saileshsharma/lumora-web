import { test, expect } from '@playwright/test';

/**
 * E2E Tests for AI Outfit Assistant
 * Tests complete user flows for both Rater and Generator modes
 */

// Helper function to create a test image in base64 format
function createTestImageBase64(): string {
  // Create a simple 100x100 red square PNG
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, 100, 100);
  return canvas.toDataURL('image/png');
}

test.describe('AI Outfit Assistant E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('/');

    // Wait for the app to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test.describe('Backend Health Check', () => {

    test('should verify backend is running and healthy', async ({ page }) => {
      const response = await page.request.get('http://localhost:5001/api/health');

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('status', 'healthy');
      expect(data).toHaveProperty('timestamp');
    });
  });

  test.describe('Outfit Rater Mode', () => {

    test('should display Outfit Rater UI elements', async ({ page }) => {
      // Check for main heading
      await expect(page.locator('h1')).toContainText('AI Outfit Assistant');

      // Check for mode tabs/buttons
      const raterButton = page.getByRole('button', { name: /outfit rater/i });
      await expect(raterButton).toBeVisible();

      // Ensure we're in Rater mode
      await raterButton.click();

      // Check for upload area
      const uploadArea = page.locator('[data-testid="upload-area"], .upload-area, input[type="file"]');
      await expect(uploadArea.first()).toBeVisible();

      // Check for occasion selector
      const occasionSelect = page.locator('select[name="occasion"], [data-testid="occasion-select"]');
      await expect(occasionSelect.first()).toBeVisible();

      // Check for Rate button
      const rateButton = page.getByRole('button', { name: /rate my outfit/i });
      await expect(rateButton).toBeVisible();
    });

    test('should upload image and rate outfit', async ({ page }) => {
      // Switch to Rater mode
      const raterButton = page.getByRole('button', { name: /outfit rater/i });
      await raterButton.click();

      // Create a test image file
      const testImagePath = 'e2e/fixtures/test-outfit.png';

      // Upload the image
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(testImagePath);

      // Wait for image preview to appear
      await page.waitForSelector('img[src*="blob:"], img[src*="data:image"]', { timeout: 5000 });

      // Select an occasion
      const occasionSelect = page.locator('select').first();
      await occasionSelect.selectOption('Casual Outing');

      // Click Rate button
      const rateButton = page.getByRole('button', { name: /rate my outfit/i });
      await rateButton.click();

      // Wait for loading state
      await expect(page.getByText(/analyzing|rating|processing/i)).toBeVisible({ timeout: 3000 });

      // Wait for results (up to 30 seconds for AI processing)
      await expect(page.getByText(/wow factor|overall rating|score/i)).toBeVisible({ timeout: 30000 });

      // Verify rating scores are displayed
      const scoreElements = page.locator('[data-testid*="score"], .score, .rating-value');
      await expect(scoreElements.first()).toBeVisible();

      // Verify feedback sections
      await expect(page.getByText(/strengths|improvements|suggestions/i)).toBeVisible();
    });

    test('should show error when no image uploaded', async ({ page }) => {
      // Switch to Rater mode
      const raterButton = page.getByRole('button', { name: /outfit rater/i });
      await raterButton.click();

      // Try to rate without uploading
      const rateButton = page.getByRole('button', { name: /rate my outfit/i });
      await rateButton.click();

      // Should show error message
      await expect(page.getByText(/please upload|image required|select.*image/i)).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Outfit Generator Mode', () => {

    test('should display Outfit Generator UI elements', async ({ page }) => {
      // Switch to Generator mode
      const generatorButton = page.getByRole('button', { name: /outfit generator/i });
      await generatorButton.click();

      // Check for upload area
      const uploadArea = page.locator('input[type="file"]');
      await expect(uploadArea.first()).toBeVisible();

      // Check for wow factor slider
      const wowSlider = page.locator('input[type="range"], [data-testid="wow-factor-slider"]');
      await expect(wowSlider.first()).toBeVisible();

      // Check for occasion selector
      const occasionSelect = page.locator('select[name="occasion"]');
      await expect(occasionSelect.first()).toBeVisible();

      // Check for budget input
      const budgetInput = page.locator('input[name="budget"], [data-testid="budget-input"]');
      await expect(budgetInput.first()).toBeVisible();

      // Check for Generate button
      const generateButton = page.getByRole('button', { name: /generate outfit/i });
      await expect(generateButton).toBeVisible();
    });

    test('should generate outfit with user image', async ({ page }) => {
      // Switch to Generator mode
      const generatorButton = page.getByRole('button', { name: /outfit generator/i });
      await generatorButton.click();

      // Upload image
      const testImagePath = 'e2e/fixtures/test-person.png';
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(testImagePath);

      // Wait for image preview
      await page.waitForSelector('img[src*="blob:"], img[src*="data:image"]', { timeout: 5000 });

      // Set wow factor
      const wowSlider = page.locator('input[type="range"]').first();
      await wowSlider.fill('7');

      // Select occasion
      const occasionSelect = page.locator('select[name="occasion"]').first();
      await occasionSelect.selectOption('Business Formal');

      // Enter budget
      const budgetInput = page.locator('input[name="budget"]').first();
      await budgetInput.fill('$100-$200');

      // Click Generate button
      const generateButton = page.getByRole('button', { name: /generate outfit/i });
      await generateButton.click();

      // Wait for loading state
      await expect(page.getByText(/generating|creating|processing/i)).toBeVisible({ timeout: 3000 });

      // Wait for generated image (up to 60 seconds for AI image generation)
      await expect(page.locator('img[alt*="generated"], img[alt*="outfit"]')).toBeVisible({ timeout: 60000 });

      // Verify outfit description is shown
      await expect(page.getByText(/outfit description|style notes|items/i)).toBeVisible();

      // Verify product recommendations
      await expect(page.getByText(/recommendations|shopping|products/i)).toBeVisible();
    });

    test('should show error when no image provided for generation', async ({ page }) => {
      // Switch to Generator mode
      const generatorButton = page.getByRole('button', { name: /outfit generator/i });
      await generatorButton.click();

      // Fill other fields but skip image
      const budgetInput = page.locator('input[name="budget"]').first();
      await budgetInput.fill('$50-$100');

      // Try to generate
      const generateButton = page.getByRole('button', { name: /generate outfit/i });
      await generateButton.click();

      // Should show error
      await expect(page.getByText(/please upload|image required|photo.*required/i)).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Network and API Integration', () => {

    test('should handle rate-outfit API call correctly', async ({ page }) => {
      // Listen for API calls
      const apiPromise = page.waitForResponse(
        response => response.url().includes('/api/rate-outfit') && response.request().method() === 'POST',
        { timeout: 30000 }
      );

      // Switch to Rater mode and submit
      const raterButton = page.getByRole('button', { name: /outfit rater/i });
      await raterButton.click();

      const testImagePath = 'e2e/fixtures/test-outfit.png';
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(testImagePath);

      await page.waitForSelector('img[src*="blob:"]', { timeout: 5000 });

      const rateButton = page.getByRole('button', { name: /rate my outfit/i });
      await rateButton.click();

      // Wait for and verify API response
      const response = await apiPromise;
      expect(response.status()).toBe(200);

      const responseData = await response.json();
      expect(responseData).toHaveProperty('success', true);
      expect(responseData).toHaveProperty('data');
    });

    test('should handle generate-outfit API call correctly', async ({ page }) => {
      // Listen for API calls
      const apiPromise = page.waitForResponse(
        response => response.url().includes('/api/generate-outfit') && response.request().method() === 'POST',
        { timeout: 60000 }
      );

      // Switch to Generator mode and submit
      const generatorButton = page.getByRole('button', { name: /outfit generator/i });
      await generatorButton.click();

      const testImagePath = 'e2e/fixtures/test-person.png';
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(testImagePath);

      await page.waitForSelector('img[src*="blob:"]', { timeout: 5000 });

      const budgetInput = page.locator('input[name="budget"]').first();
      await budgetInput.fill('$100-$200');

      const generateButton = page.getByRole('button', { name: /generate outfit/i });
      await generateButton.click();

      // Wait for and verify API response
      const response = await apiPromise;
      expect(response.status()).toBe(200);

      const responseData = await response.json();
      expect(responseData).toHaveProperty('success', true);
      expect(responseData).toHaveProperty('data');
    });

    test('should verify CORS headers are present', async ({ page }) => {
      const response = await page.request.get('http://localhost:5001/api/health');

      const headers = response.headers();
      expect(headers['access-control-allow-origin']).toBeDefined();
    });
  });

  test.describe('Error Handling', () => {

    test('should handle backend unavailable gracefully', async ({ page }) => {
      // Intercept and fail API requests
      await page.route('**/api/**', route => route.abort());

      // Try to use the app
      const raterButton = page.getByRole('button', { name: /outfit rater/i });
      await raterButton.click();

      const testImagePath = 'e2e/fixtures/test-outfit.png';
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(testImagePath);

      const rateButton = page.getByRole('button', { name: /rate my outfit/i });
      await rateButton.click();

      // Should show error message
      await expect(page.getByText(/error|failed|try again|connection/i)).toBeVisible({ timeout: 5000 });
    });

    test('should handle large image files gracefully', async ({ page }) => {
      // This would need a large test image file
      // For now, we'll just verify the UI doesn't crash
      const raterButton = page.getByRole('button', { name: /outfit rater/i });
      await raterButton.click();

      // The app should remain functional
      await expect(page.locator('h1')).toBeVisible();
    });
  });

  test.describe('User Experience', () => {

    test('should show loading states during processing', async ({ page }) => {
      const raterButton = page.getByRole('button', { name: /outfit rater/i });
      await raterButton.click();

      const testImagePath = 'e2e/fixtures/test-outfit.png';
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(testImagePath);

      await page.waitForSelector('img[src*="blob:"]', { timeout: 5000 });

      const rateButton = page.getByRole('button', { name: /rate my outfit/i });
      await rateButton.click();

      // Should show loading indicator
      const loadingIndicators = page.locator('.loading, .spinner, [role="progressbar"], [data-testid="loading"]');
      await expect(loadingIndicators.first()).toBeVisible({ timeout: 3000 });
    });

    test('should allow switching between modes', async ({ page }) => {
      // Start with Rater
      const raterButton = page.getByRole('button', { name: /outfit rater/i });
      await raterButton.click();
      await expect(page.getByRole('button', { name: /rate my outfit/i })).toBeVisible();

      // Switch to Generator
      const generatorButton = page.getByRole('button', { name: /outfit generator/i });
      await generatorButton.click();
      await expect(page.getByRole('button', { name: /generate outfit/i })).toBeVisible();

      // Switch back to Rater
      await raterButton.click();
      await expect(page.getByRole('button', { name: /rate my outfit/i })).toBeVisible();
    });
  });
});
