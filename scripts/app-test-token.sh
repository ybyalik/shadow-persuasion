#!/bin/bash
# Prints a fresh sign-in token for the local test login (APP_TEST_EMAIL in .env.local).
# Use it to call app API routes:  curl -H "Authorization: Bearer $(scripts/app-test-token.sh)" ...
cd "$(dirname "$0")/.."
E() { grep "^$1=" .env.local | cut -d= -f2- | tr -d '"' | sed 's/\\n$//'; }
curl -s "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$(E NEXT_PUBLIC_FIREBASE_API_KEY)" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$(E APP_TEST_EMAIL)\",\"password\":\"$(E APP_TEST_PASSWORD)\",\"returnSecureToken\":true}" \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['idToken'])"
