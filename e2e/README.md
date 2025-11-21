# E2E Tests for AI Outfit Assistant

End-to-end tests using Playwright to verify the complete functionality of the AI Outfit Assistant application.

## Test Files

### `outfit-assistant.spec.ts`
Complete user flow tests covering:
- **Backend Health Check**: Verifies API is running and healthy
- **Outfit Rater Mode**:
  - UI element visibility
  - Image upload and rating workflow
  - Error handling (missing image)
- **Outfit Generator Mode**:
  - UI element visibility
  - Image upload and generation workflow
  - Error handling (missing required fields)
- **Network & API Integration**: Verifies API calls and responses
- **Error Handling**: Backend unavailable, large files
- **User Experience**: Loading states, mode switching

### `api.spec.ts`
Direct API endpoint tests:
- **Health Endpoint**: Status checks
- **Rate Outfit Endpoint**:
  - Successful rating with various occasions
  - Error cases (missing image, invalid format)
  - Response structure validation
- **Generate Outfit Endpoint**:
  - Successful generation with different wow factors
  - Error cases (missing user image)
  - Response structure validation
- **CORS Configuration**: Preflight and origin handling
- **Error Handling**: 404s, malformed JSON, error structure
- **Performance**: Response time benchmarks

## Prerequisites

1. **Backend running** on `http://localhost:5001`
   ```bash
   cd backend
   source ../venv/bin/activate
   python3 app_refactored.py
   ```

2. **Frontend running** on `http://localhost:5174`
   ```bash
   cd frontend
   npm run dev
   ```

3. **Playwright installed**
   ```bash
   npm install -D @playwright/test
   npx playwright install chromium
   ```

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run only API tests
```bash
npx playwright test e2e/api.spec.ts
```

### Run only UI tests
```bash
npx playwright test e2e/outfit-assistant.spec.ts
```

### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

### Run specific test
```bash
npx playwright test -g "should rate an outfit successfully"
```

### Debug tests
```bash
npx playwright test --debug
```

## Test Fixtures

Test images are located in `e2e/fixtures/`:
- `test-outfit.png` - Sample outfit image for rating tests
- `test-person.png` - Sample person image for generation tests

These are minimal PNG files for testing. For more realistic tests, replace with actual photos.

## Configuration

Tests are configured in `playwright.config.ts`:
- **Base URL**: `http://localhost:5174`
- **Timeout**: 60 seconds per test
- **Workers**: 1 (sequential execution)
- **Screenshots**: Only on failure
- **Videos**: Retained on failure
- **Trace**: On first retry
- **Auto-start**: Frontend dev server (if not running)

## Test Reports

After running tests:
```bash
npx playwright show-report
```

Reports are generated in:
- `playwright-report/` - HTML report
- `playwright-report/results.json` - JSON results

## Debugging Failed Tests

1. **Check Screenshots**: `playwright-report/` folder contains failure screenshots
2. **Watch Videos**: Failed test videos are saved in `test-results/`
3. **View Traces**: Use `npx playwright show-trace trace.zip` for detailed traces
4. **Check Logs**: Backend logs show API calls and errors

## Common Issues

### Tests timing out
- Ensure backend is running and healthy: `curl http://localhost:5001/api/health`
- Check that OpenAI API key is configured in `backend/.env`
- Verify network connectivity

### Frontend not loading
- Check that frontend is running: `http://localhost:5174`
- Verify no port conflicts: `lsof -ti:5174`
- Check browser console for JavaScript errors

### API tests failing
- Verify backend is running on port 5001
- Check CORS configuration in backend
- Ensure test fixture images exist: `ls e2e/fixtures/`

### Image upload tests failing
- Verify test images exist in `e2e/fixtures/`
- Check image file permissions
- Ensure images are valid PNG format

## Writing New Tests

### Test Structure
```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Setup code
  });

  test('should do something', async ({ page }) => {
    // Test code
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

### API Test Structure
```typescript
test('API endpoint test', async ({ request }) => {
  const response = await request.post('http://localhost:5001/api/endpoint', {
    data: { /* request data */ }
  });

  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data).toHaveProperty('success', true);
});
```

## Best Practices

1. **Use test IDs**: Add `data-testid` attributes to UI components
2. **Wait for states**: Use `waitForLoadState('networkidle')` for SPA pages
3. **Parallel execution**: Tests run in parallel by default (disabled in config for this project)
4. **Cleanup**: Use `beforeEach` and `afterEach` for setup/teardown
5. **Assertions**: Use Playwright's built-in expect with web-first assertions
6. **Timeouts**: Set appropriate timeouts for AI operations (30-60s)

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run E2E tests
  run: |
    npm run test:e2e
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

### Railway/Heroku
Configure environment variables and run tests as part of deployment pipeline.

## Troubleshooting Test Failures

### Rate Outfit Tests Fail
1. Check backend logs: `tail -f backend/logs/app.log`
2. Verify OpenAI API key is valid
3. Check network requests in test trace

### Generate Outfit Tests Timeout
1. Increase timeout in test (default 60s may not be enough)
2. Verify FAL and NanoBanana API keys are configured
3. Check API rate limits

### Frontend Tests Can't Find Elements
1. Update selectors in tests
2. Add `data-testid` attributes to components
3. Check for React hydration issues

## Performance Benchmarks

Expected test durations:
- Health check: < 1s
- Rate Outfit API: < 30s
- Generate Outfit API: < 120s
- Full UI test suite: < 5 minutes

## Coverage

Current test coverage:
- ✅ Health endpoint
- ✅ Rate Outfit flow (happy path + errors)
- ✅ Generate Outfit flow (happy path + errors)
- ✅ CORS handling
- ✅ Error responses
- ✅ UI mode switching
- ⏳ Fashion Arena features (TODO)
- ⏳ Improved Outfit generation (TODO)
- ⏳ Multiple image uploads (TODO)

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Test Selectors](https://playwright.dev/docs/selectors)
- [Debugging Tests](https://playwright.dev/docs/debug)
