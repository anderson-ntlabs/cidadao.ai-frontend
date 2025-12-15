#!/bin/bash
# Run tests in small batches to prevent memory exhaustion
# Usage: ./scripts/testing/run-tests-batch.sh [directory]

set -e

BATCH_SIZE=${BATCH_SIZE:-5}
TARGET_DIR=${1:-.}
CONFIG="config/vitest.config.mjs"
NODE_OPTS="--max-old-space-size=2048"

echo "=== Running tests in batches of $BATCH_SIZE ==="
echo "Target: $TARGET_DIR"
echo ""

# Find all test files
TEST_FILES=$(find "$TARGET_DIR" -path ./node_modules -prune -o \( -name "*.test.ts" -o -name "*.test.tsx" \) -print 2>/dev/null | sort)

if [ -z "$TEST_FILES" ]; then
    echo "No test files found in $TARGET_DIR"
    exit 0
fi

TOTAL=$(echo "$TEST_FILES" | wc -l)
echo "Found $TOTAL test files"
echo ""

PASSED=0
FAILED=0
BATCH_NUM=0

# Process in batches
echo "$TEST_FILES" | while IFS= read -r file; do
    if [ -n "$file" ]; then
        BATCH_NUM=$((BATCH_NUM + 1))
        echo "[$BATCH_NUM/$TOTAL] Testing: $file"

        if NODE_OPTIONS="$NODE_OPTS" npx vitest run "$file" --config="$CONFIG" --reporter=dot 2>&1 | tail -3; then
            PASSED=$((PASSED + 1))
        else
            FAILED=$((FAILED + 1))
            echo "  FAILED: $file"
        fi

        # Force garbage collection between batches
        if [ $((BATCH_NUM % BATCH_SIZE)) -eq 0 ]; then
            echo "--- Batch complete, pausing for GC ---"
            sleep 1
        fi
    fi
done

echo ""
echo "=== Summary ==="
echo "Total: $TOTAL"
echo "Completed batches"
