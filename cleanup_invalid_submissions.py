import requests
import sys

# Configuration
API_URL = "https://ai-outfit-assistant-production.up.railway.app/api/arena/cleanup"

def cleanup_invalid_submissions():
    print("--- Fashion Arena Cleanup ---")
    print("Removing submissions with invalid photo data (local file paths)...")

    try:
        response = requests.post(API_URL)

        if response.status_code == 200:
            result = response.json()
            print("\nSUCCESS!")
            print(f"Message: {result.get('message')}")
            print(f"\nDetails:")
            print(f"  - Original count: {result['result']['original_count']}")
            print(f"  - Removed: {result['result']['removed_count']}")
            print(f"  - Remaining: {result['result']['remaining_count']}")
        else:
            print(f"\nFAILED (Status {response.status_code})")
            print(f"Error: {response.text}")
            sys.exit(1)

    except Exception as e:
        print(f"\nERROR: Could not connect to server.")
        print(f"Details: {e}")
        sys.exit(1)

if __name__ == "__main__":
    cleanup_invalid_submissions()
