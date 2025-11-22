# Playwright E2E Test Suite - AI Outfit Assistant

**Date:** November 22, 2025
**Status:** ✅ Running
**Test File:** `e2e/full-app.spec.ts`

---

## 📋 Test Coverage

### 10 Comprehensive End-to-End Tests

#### 1. **Keycloak Authentication Flow**
- ✅ Redirects to Keycloak login page
- ✅ Accepts valid credentials
- ✅ Redirects back to main app
- ✅ Displays user name in header

#### 2. **Rate My Outfit - Complete Flow**
- ✅ Image upload functionality
- ✅ Occasion selection
- ✅ AI analysis (GPT-4 Vision)
- ✅ Results display (Wow Factor, Occasion Fitness, Overall Rating)
- ✅ Shopping recommendations
- ✅ Store buttons (Amazon, Shein, Shopee, Lazada)

#### 3. **Generate Outfit - Complete Flow**
- ✅ Image upload
- ✅ Occasion selection
- ✅ AI outfit generation (GPT-4 + Nanobanana)
- ✅ Results display
- ✅ "Shop The Look" section
- ✅ Store buttons for recommendations

#### 4. **Profile Page**
- ✅ Navigation to profile
- ✅ User information display
- ✅ Account details visible

#### 5. **Logout Flow**
- ✅ User menu interaction
- ✅ Logout confirmation modal
- ✅ Successful logout
- ✅ Redirect to Keycloak login

#### 6. **Fashion Arena - Browse Submissions**
- ✅ Navigation to Fashion Arena
- ✅ Page loads correctly
- ✅ Browse/Leaderboard tabs

#### 7. **Navigation Between Pages**
- ✅ Outfit Generator
- ✅ Fashion Arena
- ✅ Rate Your Outfit (back)
- ✅ Smooth transitions

#### 8. **Responsive Design - Mobile View**
- ✅ Mobile viewport (375x667)
- ✅ Layout adapts correctly
- ✅ All features accessible

#### 9. **Error Handling - No Image Selected**
- ✅ Validation messages
- ✅ User-friendly error display

#### 10. **Shopping Buttons - Click Functionality**
- ✅ Buttons open in new tab
- ✅ Correct URLs (Amazon, Shein, etc.)
- ✅ Proper navigation

---

## 🔧 Test Configuration

```typescript
{
  testDir: './e2e',
  timeout: 60000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  baseURL: 'http://localhost:5174',
  viewport: { width: 1280, height: 720 },
}
```

### Services Required
- ✅ **Keycloak:** http://localhost:8080
- ✅ **Backend API:** http://localhost:5001
- ✅ **Frontend:** http://localhost:5174

---

## 🎯 What Gets Tested

### Authentication
- Keycloak OAuth2/OIDC flow
- Login with credentials
- Session management
- Logout functionality
- Token handling

### Core Features
- **Rate My Outfit:**
  - Image upload
  - AI analysis (GPT-4 Vision)
  - Results display
  - Shopping recommendations

- **Outfit Generator:**
  - Image upload
  - AI generation (GPT-4 + Nanobanana)
  - Outfit display
  - Product recommendations

- **Fashion Arena:**
  - Browse submissions
  - Leaderboard

- **Profile:**
  - User information
  - Account settings

### UI/UX
- Navigation between pages
- Responsive design (desktop & mobile)
- Error handling
- Loading states
- Button interactions

### Shopping Integration
- Store buttons (Amazon, Shein, Shopee, Lazada)
- Click functionality
- Opens in new tab
- Correct search URLs

---

## 📊 Test Reports

### Generated Reports
1. **HTML Report:** `playwright-report/index.html`
2. **JSON Results:** `playwright-report/results.json`
3. **Screenshots:** Captured on failures
4. **Videos:** Recorded on failures
5. **Traces:** Available for failed tests

---

## 🚀 Running the Tests

### Run All Tests
```bash
npx playwright test e2e/full-app.spec.ts
```

### Run with UI Mode
```bash
npx playwright test e2e/full-app.spec.ts --ui
```

### Run in Headed Mode (Watch Browser)
```bash
npx playwright test e2e/full-app.spec.ts --headed
```

### Debug Mode
```bash
npx playwright test e2e/full-app.spec.ts --debug
```

### View Report
```bash
npx playwright show-report
```

---

## ✅ Prerequisites

Before running tests, ensure:

1. **All services running:**
   ```bash
   ./start.sh
   ```

2. **Keycloak configured:**
   - Realm: `lumora`
   - Test user: `sailesh.sharma@gmail.com` / `Admin@123`

3. **Playwright installed:**
   ```bash
   npm install
   npx playwright install
   ```

---

## 🎨 Test User Credentials

```
Email: sailesh.sharma@gmail.com
Password: Admin@123
```

**Note:** These are test credentials for local development only.

---

## 📝 Test Scenarios

### Happy Path Tests
- ✅ Complete authentication flow
- ✅ Full outfit rating flow
- ✅ Full outfit generation flow
- ✅ Profile management
- ✅ Logout

### Edge Cases
- ✅ Missing image validation
- ✅ Mobile responsiveness
- ✅ Navigation flow

### Integration Tests
- ✅ Keycloak ↔ Frontend
- ✅ Frontend ↔ Backend
- ✅ Shopping button redirects

---

## 🔍 Assertions Checked

### Page Elements
- Text content visible
- Buttons clickable
- Images loaded
- Forms functional

### Navigation
- URL changes correct
- Redirects working
- Back navigation

### API Integration
- Requests sent
- Responses received
- Data displayed

### User Actions
- Clicks registered
- Forms submitted
- Modals shown

---

## 🎯 Success Criteria

All tests pass when:

1. ✅ Authentication works end-to-end
2. ✅ Rate My Outfit returns results
3. ✅ Outfit Generator creates outfits
4. ✅ Shopping buttons work
5. ✅ Navigation is smooth
6. ✅ Mobile layout responsive
7. ✅ Error handling graceful
8. ✅ Logout redirects correctly
9. ✅ Profile page loads
10. ✅ Fashion Arena accessible

---

## 📈 Expected Results

```
Running 10 tests using 1 worker

✅ All services are running

  ✓ 1. Keycloak Authentication Flow (5s)
  ✓ 2. Rate My Outfit - Complete Flow (25s)
  ✓ 3. Generate Outfit - Complete Flow (40s)
  ✓ 4. Profile Page (3s)
  ✓ 5. Logout Flow (3s)
  ✓ 6. Fashion Arena - Browse Submissions (2s)
  ✓ 7. Navigation Between Pages (5s)
  ✓ 8. Responsive Design - Mobile View (3s)
  ✓ 9. Error Handling - No Image Selected (2s)
  ✓ 10. Shopping Buttons - Click Functionality (15s)

10 passed (103s)
```

---

## 🐛 Troubleshooting

### Tests Failing?

**Check services:**
```bash
curl http://localhost:8080/health/ready
curl http://localhost:5001/api/health
curl http://localhost:5174
```

**Check Keycloak user:**
- User exists in Keycloak admin console
- Credentials are correct
- Email verified

**Check browser:**
```bash
npx playwright install chromium
```

**View test in headed mode:**
```bash
npx playwright test e2e/full-app.spec.ts --headed --debug
```

---

## 📚 Test Files

- **Test Suite:** `e2e/full-app.spec.ts`
- **Configuration:** `playwright.config.ts`
- **Report:** `playwright-report/`
- **Fixtures:** `e2e/fixtures/`

---

## 🎉 Benefits

### Why E2E Testing?

1. **Confidence:** Ensures everything works together
2. **Regression Prevention:** Catches breaking changes
3. **Documentation:** Tests serve as living documentation
4. **Quality:** Higher code quality and reliability
5. **User Experience:** Validates actual user flows

### What Gets Validated?

- ✅ Authentication system
- ✅ AI integrations (GPT-4, Nanobanana)
- ✅ Database operations
- ✅ UI rendering
- ✅ API communication
- ✅ Third-party integrations (shopping links)
- ✅ Responsive design
- ✅ Error handling

---

## 🚀 Production Ready

With passing E2E tests, you can confidently:

- ✅ Deploy to production
- ✅ Release new features
- ✅ Refactor code
- ✅ Update dependencies
- ✅ Onboard new developers

---

**Last Updated:** November 22, 2025
**Test Framework:** Playwright 1.56.1
**Status:** Ready for execution
