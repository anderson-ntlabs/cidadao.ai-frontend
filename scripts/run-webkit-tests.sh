#!/bin/bash

# Wrapper script to run Playwright WebKit tests with libicu76
# Author: Anderson Henrique da Silva
# Date: 2025-11-05
#
# This script forces WebKit to use libicu76 instead of libicu74
# by preloading the correct library versions

set -e

echo "=========================================="
echo "Playwright WebKit Test Runner"
echo "Using libicu76 (Ubuntu 25.04 Plucky)"
echo "=========================================="
echo ""

# Find libicu76 libraries
LIBICU_PATH="/usr/lib/x86_64-linux-gnu"

if [ ! -f "$LIBICU_PATH/libicuuc.so.76" ]; then
    echo "❌ ERROR: libicu76 not found at $LIBICU_PATH"
    exit 1
fi

echo "✓ Found libicu76 at $LIBICU_PATH"
echo ""

# Set LD_LIBRARY_PATH to prioritize system libicu76
export LD_LIBRARY_PATH="$LIBICU_PATH:$LD_LIBRARY_PATH"

# Preload libicu76 libraries to override WebKit's libicu74 dependency
export LD_PRELOAD="$LIBICU_PATH/libicudata.so.76:$LIBICU_PATH/libicuuc.so.76:$LIBICU_PATH/libicui18n.so.76"

echo "Environment configured:"
echo "  LD_LIBRARY_PATH=$LD_LIBRARY_PATH"
echo "  LD_PRELOAD=$LD_PRELOAD"
echo ""

# Run Playwright tests with all arguments passed through
echo "Running Playwright tests..."
echo "Command: npx playwright test $@"
echo ""

npx playwright test "$@"

exit_code=$?

echo ""
if [ $exit_code -eq 0 ]; then
    echo "✅ Tests completed successfully"
else
    echo "❌ Tests failed with exit code $exit_code"
fi

exit $exit_code
