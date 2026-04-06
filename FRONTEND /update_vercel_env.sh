#!/bin/bash
while IFS='=' read -r key value; do
  # Skip empty lines and comments
  if [[ -n "$key" && "$key" != \#* ]]; then
    # Remove carriage returns and spaces inside the value if any (though these look clean)
    value=$(echo "$value" | tr -d '\r')
    echo "Updating $key on Vercel..."
    # Suppress error if it doesn't exist
    yes | npx vercel env rm "$key" production,preview,development 2>/dev/null || true
    echo -n "$value" | npx vercel env add "$key" production,preview,development
  fi
done < .env.local
