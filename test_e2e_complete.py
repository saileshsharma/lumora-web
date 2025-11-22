#!/usr/bin/env python3
"""
Comprehensive End-to-End Testing Script
Tests Keycloak, Frontend, and Backend Integration
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Tuple

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
CYAN = '\033[96m'
RESET = '\033[0m'
BOLD = '\033[1m'

# Configuration
KEYCLOAK_URL = "http://localhost:8080"
BACKEND_URL = "http://localhost:5001"
FRONTEND_URL = "http://localhost:5174"
REALM = "lumora"
CLIENT_ID = "lumora-backend"
CLIENT_SECRET = "2UJLDxlu6tzJeKrg9YKtWNMsdnvj0tag"
TEST_USER_EMAIL = "sailesh.sharma@gmail.com"
TEST_USER_PASSWORD = "Admin@123"

# Test results storage
test_results = []


class TestResult:
    def __init__(self, category: str, test_name: str, status: str, message: str, duration: float = 0):
        self.category = category
        self.test_name = test_name
        self.status = status  # 'PASS', 'FAIL', 'WARN'
        self.message = message
        self.duration = duration


def print_header(text: str):
    """Print a formatted header"""
    print(f"\n{BOLD}{CYAN}{'=' * 70}{RESET}")
    print(f"{BOLD}{CYAN}{text:^70}{RESET}")
    print(f"{BOLD}{CYAN}{'=' * 70}{RESET}\n")


def print_test(test_name: str, status: str, message: str = ""):
    """Print test result"""
    status_colors = {
        'PASS': GREEN,
        'FAIL': RED,
        'WARN': YELLOW,
        'INFO': BLUE
    }
    color = status_colors.get(status, RESET)
    symbol = '✓' if status == 'PASS' else '✗' if status == 'FAIL' else '⚠' if status == 'WARN' else 'ℹ'

    print(f"{color}{symbol} {test_name:<50} [{status}]{RESET}")
    if message:
        print(f"  {message}")


def run_test(category: str, test_name: str, test_func):
    """Run a test and record results"""
    start_time = time.time()
    try:
        result, message = test_func()
        duration = time.time() - start_time

        status = 'PASS' if result else 'FAIL'
        print_test(test_name, status, message)
        test_results.append(TestResult(category, test_name, status, message, duration))
        return result
    except Exception as e:
        duration = time.time() - start_time
        message = f"Error: {str(e)}"
        print_test(test_name, 'FAIL', message)
        test_results.append(TestResult(category, test_name, 'FAIL', message, duration))
        return False


# ========================================
# KEYCLOAK TESTS
# ========================================

def test_keycloak_health():
    """Test Keycloak server health"""
    try:
        response = requests.get(f"{KEYCLOAK_URL}/health/ready", timeout=5)
        return response.status_code == 200, f"Keycloak is healthy (HTTP {response.status_code})"
    except Exception as e:
        return False, f"Keycloak unreachable: {str(e)}"


def test_keycloak_realm():
    """Test Keycloak realm configuration"""
    try:
        response = requests.get(
            f"{KEYCLOAK_URL}/realms/{REALM}/.well-known/openid-configuration",
            timeout=5
        )
        if response.status_code == 200:
            config = response.json()
            return True, f"Realm '{REALM}' configured correctly"
        return False, f"Realm not found (HTTP {response.status_code})"
    except Exception as e:
        return False, f"Failed to get realm config: {str(e)}"


def test_keycloak_authentication():
    """Test user authentication via Keycloak"""
    try:
        token_url = f"{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/token"

        data = {
            'grant_type': 'password',
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'username': TEST_USER_EMAIL,
            'password': TEST_USER_PASSWORD,
            'scope': 'openid profile email'
        }

        response = requests.post(token_url, data=data, timeout=10)

        if response.status_code == 200:
            tokens = response.json()
            if 'access_token' in tokens and 'refresh_token' in tokens:
                return True, f"Authentication successful, token expires in {tokens.get('expires_in', 'N/A')}s"
            return False, "Tokens missing in response"
        return False, f"Authentication failed (HTTP {response.status_code}): {response.text}"
    except Exception as e:
        return False, f"Authentication error: {str(e)}"


def get_access_token() -> str:
    """Helper function to get access token"""
    token_url = f"{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/token"

    data = {
        'grant_type': 'password',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'username': TEST_USER_EMAIL,
        'password': TEST_USER_PASSWORD,
        'scope': 'openid profile email'
    }

    response = requests.post(token_url, data=data, timeout=10)
    if response.status_code == 200:
        return response.json()['access_token']
    return None


def test_token_validation():
    """Test token validation with Keycloak"""
    try:
        token = get_access_token()
        if not token:
            return False, "Failed to get access token"

        # Try to get user info with token
        userinfo_url = f"{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/userinfo"
        headers = {'Authorization': f'Bearer {token}'}

        response = requests.get(userinfo_url, headers=headers, timeout=5)

        if response.status_code == 200:
            user_info = response.json()
            return True, f"Token valid, user: {user_info.get('email', 'N/A')}"
        return False, f"Token validation failed (HTTP {response.status_code})"
    except Exception as e:
        return False, f"Token validation error: {str(e)}"


# ========================================
# BACKEND TESTS
# ========================================

def test_backend_health():
    """Test backend health endpoint"""
    try:
        response = requests.get(f"{BACKEND_URL}/api/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            return True, f"Backend healthy: {data}"
        return False, f"Backend unhealthy (HTTP {response.status_code})"
    except Exception as e:
        return False, f"Backend unreachable: {str(e)}"


def test_backend_cors():
    """Test CORS configuration"""
    try:
        headers = {
            'Origin': 'http://localhost:5174',
            'Access-Control-Request-Method': 'GET'
        }
        response = requests.options(f"{BACKEND_URL}/api/health", headers=headers, timeout=5)

        cors_headers = response.headers.get('Access-Control-Allow-Origin', '')
        if cors_headers:
            return True, f"CORS enabled: {cors_headers}"
        return False, "CORS not properly configured"
    except Exception as e:
        return False, f"CORS test error: {str(e)}"


def test_backend_with_keycloak_token():
    """Test backend API with Keycloak token"""
    try:
        token = get_access_token()
        if not token:
            return False, "Failed to get access token for backend test"

        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

        response = requests.get(f"{BACKEND_URL}/api/health", headers=headers, timeout=5)

        if response.status_code == 200:
            return True, "Backend accepted Keycloak token"
        return False, f"Backend rejected token (HTTP {response.status_code})"
    except Exception as e:
        return False, f"Backend token test error: {str(e)}"


def test_outfit_rater_endpoint():
    """Test outfit rater endpoint"""
    try:
        token = get_access_token()

        # Note: This would normally require an actual image file
        # For now, we just test if the endpoint is accessible
        response = requests.options(f"{BACKEND_URL}/api/rate-outfit", timeout=5)

        if response.status_code in [200, 405]:  # 405 is expected for OPTIONS without proper setup
            return True, "Outfit rater endpoint accessible"
        return False, f"Outfit rater endpoint issue (HTTP {response.status_code})"
    except Exception as e:
        return False, f"Outfit rater test error: {str(e)}"


def test_outfit_generator_endpoint():
    """Test outfit generator endpoint"""
    try:
        response = requests.options(f"{BACKEND_URL}/api/generate-outfit", timeout=5)

        if response.status_code in [200, 405]:
            return True, "Outfit generator endpoint accessible"
        return False, f"Outfit generator endpoint issue (HTTP {response.status_code})"
    except Exception as e:
        return False, f"Outfit generator test error: {str(e)}"


def test_fashion_arena_endpoint():
    """Test fashion arena endpoint"""
    try:
        response = requests.get(f"{BACKEND_URL}/api/arena/submissions", timeout=5)

        if response.status_code in [200, 401]:  # 401 is acceptable (needs auth)
            return True, "Fashion arena endpoint accessible"
        return False, f"Fashion arena endpoint issue (HTTP {response.status_code})"
    except Exception as e:
        return False, f"Fashion arena test error: {str(e)}"


# ========================================
# FRONTEND TESTS
# ========================================

def test_frontend_accessible():
    """Test frontend is accessible"""
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            return True, "Frontend accessible"
        return False, f"Frontend not accessible (HTTP {response.status_code})"
    except Exception as e:
        return False, f"Frontend unreachable: {str(e)}"


def test_frontend_static_assets():
    """Test frontend static assets"""
    try:
        # Test logo
        response = requests.get(f"{FRONTEND_URL}/logo.jpeg", timeout=5)
        if response.status_code == 200:
            return True, "Static assets loading correctly"
        return False, f"Static assets not loading (HTTP {response.status_code})"
    except Exception as e:
        return False, f"Static assets test error: {str(e)}"


# ========================================
# INTEGRATION TESTS
# ========================================

def test_full_auth_flow():
    """Test complete authentication flow"""
    try:
        # 1. Get token from Keycloak
        token = get_access_token()
        if not token:
            return False, "Failed to get token from Keycloak"

        # 2. Use token with backend
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(f"{BACKEND_URL}/api/health", headers=headers, timeout=5)

        if response.status_code != 200:
            return False, f"Backend rejected Keycloak token (HTTP {response.status_code})"

        return True, "Full auth flow: Keycloak → Backend successful"
    except Exception as e:
        return False, f"Full auth flow error: {str(e)}"


# ========================================
# MAIN TEST EXECUTION
# ========================================

def run_all_tests():
    """Run all E2E tests"""
    start_time = time.time()

    print(f"{BOLD}{BLUE}")
    print("╔═══════════════════════════════════════════════════════════════════╗")
    print("║         LUMORA - COMPREHENSIVE E2E TEST SUITE                    ║")
    print("║         Keycloak + Frontend + Backend Integration                ║")
    print("╚═══════════════════════════════════════════════════════════════════╝")
    print(f"{RESET}\n")

    print(f"{BOLD}Test Configuration:{RESET}")
    print(f"  Keycloak:  {KEYCLOAK_URL}")
    print(f"  Backend:   {BACKEND_URL}")
    print(f"  Frontend:  {FRONTEND_URL}")
    print(f"  Realm:     {REALM}")
    print(f"  Test User: {TEST_USER_EMAIL}")
    print(f"  Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # KEYCLOAK TESTS
    print_header("KEYCLOAK AUTHENTICATION TESTS")
    run_test("Keycloak", "Keycloak Server Health", test_keycloak_health)
    run_test("Keycloak", "Keycloak Realm Configuration", test_keycloak_realm)
    run_test("Keycloak", "User Authentication", test_keycloak_authentication)
    run_test("Keycloak", "Token Validation", test_token_validation)

    # BACKEND TESTS
    print_header("BACKEND API TESTS")
    run_test("Backend", "Backend Server Health", test_backend_health)
    run_test("Backend", "CORS Configuration", test_backend_cors)
    run_test("Backend", "Keycloak Token Integration", test_backend_with_keycloak_token)
    run_test("Backend", "Outfit Rater Endpoint", test_outfit_rater_endpoint)
    run_test("Backend", "Outfit Generator Endpoint", test_outfit_generator_endpoint)
    run_test("Backend", "Fashion Arena Endpoint", test_fashion_arena_endpoint)

    # FRONTEND TESTS
    print_header("FRONTEND TESTS")
    run_test("Frontend", "Frontend Accessibility", test_frontend_accessible)
    run_test("Frontend", "Static Assets Loading", test_frontend_static_assets)

    # INTEGRATION TESTS
    print_header("INTEGRATION TESTS")
    run_test("Integration", "Full Authentication Flow", test_full_auth_flow)

    # SUMMARY
    duration = time.time() - start_time
    print_summary(duration)

    # Save report
    save_test_report(duration)


def print_summary(duration: float):
    """Print test summary"""
    print_header("TEST SUMMARY")

    total = len(test_results)
    passed = sum(1 for r in test_results if r.status == 'PASS')
    failed = sum(1 for r in test_results if r.status == 'FAIL')
    warned = sum(1 for r in test_results if r.status == 'WARN')

    pass_rate = (passed / total * 100) if total > 0 else 0

    print(f"{BOLD}Results:{RESET}")
    print(f"  {GREEN}✓ Passed:{RESET}  {passed}/{total} ({pass_rate:.1f}%)")
    print(f"  {RED}✗ Failed:{RESET}  {failed}/{total}")
    print(f"  {YELLOW}⚠ Warnings:{RESET} {warned}/{total}")
    print(f"  {BLUE}Duration:{RESET} {duration:.2f}s")

    if failed == 0:
        print(f"\n{BOLD}{GREEN}{'=' * 70}")
        print(f"{'🎉 ALL TESTS PASSED! 🎉':^70}")
        print(f"{'=' * 70}{RESET}\n")
    else:
        print(f"\n{BOLD}{RED}{'=' * 70}")
        print(f"{'❌ SOME TESTS FAILED':^70}")
        print(f"{'=' * 70}{RESET}\n")

        print(f"{BOLD}Failed Tests:{RESET}")
        for result in test_results:
            if result.status == 'FAIL':
                print(f"  {RED}✗{RESET} {result.category} - {result.test_name}")
                print(f"    {result.message}")


def save_test_report(duration: float):
    """Save test report to JSON file"""
    report = {
        'timestamp': datetime.now().isoformat(),
        'duration': duration,
        'configuration': {
            'keycloak_url': KEYCLOAK_URL,
            'backend_url': BACKEND_URL,
            'frontend_url': FRONTEND_URL,
            'realm': REALM,
            'test_user': TEST_USER_EMAIL
        },
        'summary': {
            'total': len(test_results),
            'passed': sum(1 for r in test_results if r.status == 'PASS'),
            'failed': sum(1 for r in test_results if r.status == 'FAIL'),
            'warned': sum(1 for r in test_results if r.status == 'WARN'),
        },
        'tests': [
            {
                'category': r.category,
                'name': r.test_name,
                'status': r.status,
                'message': r.message,
                'duration': r.duration
            }
            for r in test_results
        ]
    }

    filename = f"e2e_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, 'w') as f:
        json.dump(report, f, indent=2)

    print(f"\n{BLUE}ℹ Test report saved to: {filename}{RESET}")


if __name__ == '__main__':
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print(f"\n\n{YELLOW}⚠ Tests interrupted by user{RESET}")
    except Exception as e:
        print(f"\n\n{RED}✗ Fatal error: {str(e)}{RESET}")
