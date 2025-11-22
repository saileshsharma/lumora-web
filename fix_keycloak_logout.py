#!/usr/bin/env python3
"""
Fix Keycloak Logout Redirect URI Configuration

This script fixes the "Invalid redirect URI" error that occurs during logout
by configuring the post.logout.redirect.uris attribute in Keycloak.

Usage:
    python3 fix_keycloak_logout.py
"""

import requests
import sys

# Configuration
KEYCLOAK_URL = "http://localhost:8080"
REALM = "lumora"
ADMIN_USER = "admin"
ADMIN_PASSWORD = "admin_change_in_production"
CLIENT_ID = "lumora-frontend"

def main():
    print("🔧 Keycloak Logout Redirect URI Fix")
    print("=" * 70)

    # Get admin token
    print("\n1️⃣ Authenticating as admin...")
    token_url = f"{KEYCLOAK_URL}/realms/master/protocol/openid-connect/token"
    data = {
        'grant_type': 'password',
        'client_id': 'admin-cli',
        'username': ADMIN_USER,
        'password': ADMIN_PASSWORD
    }

    try:
        response = requests.post(token_url, data=data, timeout=5)
        if response.status_code != 200:
            print(f"❌ Failed to authenticate: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            sys.exit(1)

        admin_token = response.json()['access_token']
        print(f"✅ Admin authenticated")

        # Get clients
        print(f"\n2️⃣ Finding frontend client '{CLIENT_ID}'...")
        headers = {
            'Authorization': f'Bearer {admin_token}',
            'Content-Type': 'application/json'
        }

        clients_url = f"{KEYCLOAK_URL}/admin/realms/{REALM}/clients"
        response = requests.get(clients_url, headers=headers, timeout=5)

        if response.status_code != 200:
            print(f"❌ Failed to get clients: HTTP {response.status_code}")
            sys.exit(1)

        clients = response.json()
        frontend_client = next((c for c in clients if c['clientId'] == CLIENT_ID), None)

        if not frontend_client:
            print(f"❌ Client '{CLIENT_ID}' not found")
            sys.exit(1)

        client_internal_id = frontend_client['id']
        print(f"✅ Found client: {client_internal_id}")

        # Get client configuration
        print(f"\n3️⃣ Getting client configuration...")
        client_url = f"{KEYCLOAK_URL}/admin/realms/{REALM}/clients/{client_internal_id}"
        response = requests.get(client_url, headers=headers, timeout=5)

        if response.status_code != 200:
            print(f"❌ Failed to get client config: HTTP {response.status_code}")
            sys.exit(1)

        client_config = response.json()
        print(f"✅ Client configuration retrieved")

        # Display current configuration
        print(f"\n📋 Current Configuration:")
        print(f"   Redirect URIs: {client_config.get('redirectUris', [])}")

        attrs = client_config.get('attributes', {})
        post_logout_uris = attrs.get('post.logout.redirect.uris', 'Not set')
        print(f"   Post Logout URIs: {post_logout_uris}")

        # Update configuration
        print(f"\n4️⃣ Updating configuration...")

        # Set redirect URIs
        redirect_uris = [
            'http://localhost:5174/*',
            'http://localhost:5173/*',
            'https://lumora.aihack.workers.dev/*'
        ]

        client_config['redirectUris'] = redirect_uris

        # Set post logout redirect URIs
        if 'attributes' not in client_config:
            client_config['attributes'] = {}

        # Use '+' to allow all configured redirect URIs for post-logout
        client_config['attributes']['post.logout.redirect.uris'] = '+'

        # Update client
        response = requests.put(client_url, headers=headers, json=client_config, timeout=5)

        if response.status_code != 204:
            print(f"❌ Failed to update client: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            sys.exit(1)

        print(f"✅ Configuration updated successfully!")

        # Display new configuration
        print(f"\n✨ New Configuration:")
        print(f"   Redirect URIs:")
        for uri in redirect_uris:
            print(f"      - {uri}")
        print(f"   Post Logout URIs: + (all valid redirect URIs)")

        print(f"\n" + "=" * 70)
        print(f"🎉 SUCCESS! Logout redirect URI error is now fixed!")
        print(f"\nYou can now:")
        print(f"  ✅ Logout from the app without errors")
        print(f"  ✅ Be redirected to the login page after logout")
        print(f"  ✅ Use any of the configured redirect URIs")
        print(f"\n" + "=" * 70)

    except requests.exceptions.RequestException as e:
        print(f"\n❌ Network error: {str(e)}")
        print(f"Make sure Keycloak is running on {KEYCLOAK_URL}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
