#!/bin/bash

# Script to migrate console.log/debug/info/warn to proper logger
# Usage: ./migrate-console-to-logger.sh

set -e

echo "🔄 Migrating console.* to logger system..."
echo ""

# List of production files to migrate (excluding scripts, tests, stories)
FILES=(
  # Components
  "components/voice/voice-recorder.tsx"
  "components/tour/guided-tour.tsx"
  "components/onboarding/onboarding-flow.tsx"

  # API Routes
  "app/api/edge/chat/route.ts"
  "app/api/web-vitals/route.ts"
  "app/api/security/csp-report/route.ts"
  "app/auth/callback/route.ts"

  # Pages
  "app/pt/page.tsx"

  # Stores
  "store/chat-store.ts"
  "store/versioned/base.store.ts"

  # Hooks
  "hooks/use-supabase-auth.tsx"

  # Services
  "lib/services/cached-smart-chat.service.ts"
  "lib/services/chat-session.service.ts"
  "lib/services/transparency-map.service.ts"

  # API & Adapters
  "lib/api/chat.service.ts"
  "lib/api/chat-adapter.ts"
  "lib/api/chat-adapter-backend.ts"
  "lib/api/chat-adapter-fallback.ts"
  "lib/api/chat-adapter-maritaca.ts"
  "lib/api/chat-stream-backend.ts"
  "lib/api/chat-direct.ts"
  "lib/api/natural-language-parser.ts"
  "lib/api/check-api.ts"
  "lib/api/find-backend-url.ts"
  "lib/api/authenticated-client.ts"

  # Telemetry
  "lib/telemetry/chat-telemetry.ts"
  "lib/telemetry/cost-metrics.ts"

  # Other libs
  "lib/sse/chat-sse.ts"
  "lib/websocket/chat-websocket.ts"
  "lib/feature-flags.ts"
  "lib/web-vitals.ts"
  "lib/performance/web-vitals-tracker.ts"
  "lib/analytics/posthog-config.ts"
  "lib/security/csrf.ts"
  "lib/monitoring/sentry.config.ts"
  "lib/monitoring/metrics.service.ts"
  "lib/edge/request-validator.ts"
  "lib/utils/retry.ts"
)

echo "📝 Files to migrate: ${#FILES[@]}"
echo ""

for file in "${FILES[@]}"; do
  filepath="/home/anderson-henrique/Documentos/cidadao.ai/cidadao.ai-frontend/$file"

  if [ ! -f "$filepath" ]; then
    echo "⚠️  File not found: $file"
    continue
  fi

  # Count console.* calls
  count=$(grep -c "console\.\(log\|debug\|info\|warn\)" "$filepath" 2>/dev/null || echo "0")

  if [ "$count" -eq "0" ]; then
    echo "✅ $file - No console calls"
    continue
  fi

  echo "🔧 $file - Found $count console calls"
done

echo ""
echo "✨ Analysis complete!"
echo ""
echo "To perform the migration, we need to:"
echo "1. Add logger import to each file"
echo "2. Replace console.log -> logger.info"
echo "3. Replace console.debug -> logger.debug"
echo "4. Replace console.info -> logger.info"
echo "5. Replace console.warn -> logger.warn"
echo "6. Keep console.error (handled separately)"
echo ""
echo "Run Claude Code to perform automated migration."
