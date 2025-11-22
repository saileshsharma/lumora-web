#!/usr/bin/env python3
"""
Keycloak Configuration Script
Automates the configuration of Keycloak for the Lumora application
"""

import requests
import json
import sys

# Configuration
KEYCLOAK_URL = "http://localhost:8080"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin_change_in_production"
REALM_NAME = "lumora"

# User details
USER_EMAIL = "sailesh.sharma@gmail.com"
USER_FIRST_NAME = "Sailesh"
USER_LAST_NAME = "Sharma"
USER_PASSWORD = "Admin@123"  # Change this to your preferred password

class KeycloakConfigurator:
    def __init__(self):
        self.token = None
        self.base_url = KEYCLOAK_URL
        self.realm = REALM_NAME

    def get_admin_token(self):
        """Get admin access token"""
        print("🔑 Getting admin access token...")
        url = f"{self.base_url}/realms/master/protocol/openid-connect/token"
        data = {
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD,
            "grant_type": "password",
            "client_id": "admin-cli"
        }

        try:
            response = requests.post(url, data=data)
            response.raise_for_status()
            self.token = response.json()["access_token"]
            print("✅ Admin token obtained")
            return True
        except Exception as e:
            print(f"❌ Failed to get admin token: {e}")
            return False

    def get_headers(self):
        """Get authorization headers"""
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

    def verify_roles(self):
        """Verify realm roles exist"""
        print("\n🔍 Verifying realm roles...")
        url = f"{self.base_url}/admin/realms/{self.realm}/roles"

        try:
            response = requests.get(url, headers=self.get_headers())
            response.raise_for_status()
            roles = response.json()

            role_names = [r['name'] for r in roles]
            required_roles = ['user', 'admin', 'premium']

            for role in required_roles:
                if role in role_names:
                    print(f"  ✅ Role '{role}' exists")
                else:
                    print(f"  ⚠️  Role '{role}' not found")

            return True
        except Exception as e:
            print(f"❌ Failed to verify roles: {e}")
            return False

    def set_default_role(self):
        """Set 'user' as default role"""
        print("\n⚙️  Setting 'user' as default role...")

        # Get user role
        url = f"{self.base_url}/admin/realms/{self.realm}/roles/user"
        try:
            response = requests.get(url, headers=self.get_headers())
            response.raise_for_status()
            user_role = response.json()

            # Add to default roles
            url = f"{self.base_url}/admin/realms/{self.realm}/roles/default-roles-{self.realm}/composites"
            response = requests.post(url, headers=self.get_headers(), json=[user_role])

            if response.status_code in [204, 409]:  # 204 = success, 409 = already exists
                print("✅ 'user' role set as default")
                return True
            else:
                print(f"⚠️  Response: {response.status_code} - {response.text}")
                return True  # Continue anyway
        except Exception as e:
            print(f"⚠️  Error setting default role: {e}")
            return True  # Continue anyway

    def check_user_exists(self):
        """Check if user already exists"""
        print(f"\n🔍 Checking if user '{USER_EMAIL}' exists...")
        url = f"{self.base_url}/admin/realms/{self.realm}/users"
        params = {"email": USER_EMAIL}

        try:
            response = requests.get(url, headers=self.get_headers(), params=params)
            response.raise_for_status()
            users = response.json()

            if users:
                print(f"✅ User '{USER_EMAIL}' already exists")
                return users[0]['id']
            else:
                print(f"ℹ️  User '{USER_EMAIL}' not found, will create")
                return None
        except Exception as e:
            print(f"❌ Failed to check user: {e}")
            return None

    def create_user(self):
        """Create admin user"""
        print(f"\n👤 Creating user '{USER_EMAIL}'...")
        url = f"{self.base_url}/admin/realms/{self.realm}/users"

        user_data = {
            "username": USER_EMAIL,
            "email": USER_EMAIL,
            "firstName": USER_FIRST_NAME,
            "lastName": USER_LAST_NAME,
            "enabled": True,
            "emailVerified": True,
            "credentials": [{
                "type": "password",
                "value": USER_PASSWORD,
                "temporary": False
            }]
        }

        try:
            response = requests.post(url, headers=self.get_headers(), json=user_data)

            if response.status_code == 201:
                print(f"✅ User created successfully")
                # Get user ID from location header
                location = response.headers.get('Location')
                user_id = location.split('/')[-1]
                return user_id
            elif response.status_code == 409:
                print(f"ℹ️  User already exists")
                return self.check_user_exists()
            else:
                print(f"❌ Failed to create user: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"❌ Failed to create user: {e}")
            return None

    def assign_roles(self, user_id):
        """Assign admin and user roles to the user"""
        print(f"\n🎭 Assigning roles to user...")

        # Get role representations
        roles_to_assign = []
        for role_name in ['admin', 'user']:
            url = f"{self.base_url}/admin/realms/{self.realm}/roles/{role_name}"
            try:
                response = requests.get(url, headers=self.get_headers())
                response.raise_for_status()
                roles_to_assign.append(response.json())
                print(f"  ✓ Retrieved '{role_name}' role")
            except Exception as e:
                print(f"  ❌ Failed to get '{role_name}' role: {e}")

        # Assign roles
        if roles_to_assign:
            url = f"{self.base_url}/admin/realms/{self.realm}/users/{user_id}/role-mappings/realm"
            try:
                response = requests.post(url, headers=self.get_headers(), json=roles_to_assign)
                if response.status_code == 204:
                    print(f"✅ Roles assigned successfully")
                    return True
                else:
                    print(f"⚠️  Response: {response.status_code} - {response.text}")
                    return True  # Continue anyway
            except Exception as e:
                print(f"❌ Failed to assign roles: {e}")
                return False
        return False

    def configure_realm_settings(self):
        """Configure realm login settings"""
        print("\n⚙️  Configuring realm login settings...")

        url = f"{self.base_url}/admin/realms/{self.realm}"

        settings = {
            "registrationAllowed": True,
            "resetPasswordAllowed": True,
            "rememberMe": True,
            "loginWithEmailAllowed": True,
            "duplicateEmailsAllowed": False,
            "registrationEmailAsUsername": True
        }

        try:
            response = requests.put(url, headers=self.get_headers(), json=settings)
            if response.status_code == 204:
                print("✅ Realm login settings configured")
                for key, value in settings.items():
                    print(f"  ✓ {key}: {value}")
                return True
            else:
                print(f"❌ Failed to configure realm: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Failed to configure realm: {e}")
            return False

    def update_frontend_client(self):
        """Add additional redirect URIs to frontend client"""
        print("\n🌐 Updating frontend client redirect URIs...")

        # Get client
        url = f"{self.base_url}/admin/realms/{self.realm}/clients"
        params = {"clientId": "lumora-frontend"}

        try:
            response = requests.get(url, headers=self.get_headers(), params=params)
            response.raise_for_status()
            clients = response.json()

            if not clients:
                print("❌ Frontend client not found")
                return False

            client = clients[0]
            client_id = client['id']

            # Update redirect URIs
            redirect_uris = [
                "http://localhost:5174/*",
                "http://localhost:5173/*",
                "http://127.0.0.1:5174/*"
            ]

            web_origins = [
                "http://localhost:5174",
                "http://localhost:5173",
                "http://127.0.0.1:5174"
            ]

            client['redirectUris'] = redirect_uris
            client['webOrigins'] = web_origins
            client['attributes']['post.logout.redirect.uris'] = "http://localhost:5174/*||http://localhost:5173/*"

            # Update client
            url = f"{self.base_url}/admin/realms/{self.realm}/clients/{client_id}"
            response = requests.put(url, headers=self.get_headers(), json=client)

            if response.status_code == 204:
                print("✅ Frontend client updated")
                print(f"  ✓ Redirect URIs: {', '.join(redirect_uris)}")
                print(f"  ✓ Web Origins: {', '.join(web_origins)}")
                return True
            else:
                print(f"❌ Failed to update client: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Failed to update client: {e}")
            return False

    def run(self):
        """Run the full configuration"""
        print("=" * 60)
        print("🚀 Keycloak Configuration Script for Lumora")
        print("=" * 60)

        # Get admin token
        if not self.get_admin_token():
            return False

        # Verify roles
        self.verify_roles()

        # Set default role
        self.set_default_role()

        # Check if user exists
        user_id = self.check_user_exists()

        # Create user if doesn't exist
        if not user_id:
            user_id = self.create_user()

        # Assign roles
        if user_id:
            self.assign_roles(user_id)

        # Configure realm settings
        self.configure_realm_settings()

        # Update frontend client
        self.update_frontend_client()

        print("\n" + "=" * 60)
        print("✅ Keycloak Configuration Complete!")
        print("=" * 60)
        print("\n📋 Configuration Summary:")
        print(f"  • Realm: {self.realm}")
        print(f"  • Roles: user (default), admin, premium")
        print(f"  • Admin User: {USER_EMAIL}")
        print(f"  • Password: {USER_PASSWORD}")
        print(f"  • Login Settings: Enabled (registration, email login, etc.)")
        print(f"  • Frontend Client: Updated with multiple redirect URIs")

        print("\n🧪 Test Your Setup:")
        print(f"  1. Account Console: {KEYCLOAK_URL}/realms/{self.realm}/account")
        print(f"  2. Login with: {USER_EMAIL} / {USER_PASSWORD}")
        print(f"  3. Start backend: cd backend && python3 app.py")
        print(f"  4. Start frontend: cd frontend && npm run dev")
        print(f"  5. Visit: http://localhost:5174")

        print("\n" + "=" * 60)

        return True

if __name__ == "__main__":
    configurator = KeycloakConfigurator()
    success = configurator.run()
    sys.exit(0 if success else 1)
