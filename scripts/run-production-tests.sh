#!/bin/bash

#
# Run E2E tests against production environment
# Executes comprehensive E2E tests against deployed applications
# and generates a detailed status report
#

set -e

SKIP_INSTALL=false
DEBUG=false

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --skip-install) SKIP_INSTALL=true ;;
        --debug) DEBUG=true ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

echo "🚀 Production E2E Test Suite"
echo "============================="
echo ""

# Check if playwright is installed
if [ "$SKIP_INSTALL" = false ]; then
    echo "📦 Installing dependencies..."
    npm install
    
    echo "🎭 Installing Playwright browsers..."
    npx playwright install chromium --with-deps
fi

echo ""
echo "🧪 Running production tests..."
echo ""

# Run tests with production config
TEST_COMMAND="npx playwright test --config=playwright.config.production.ts"

if [ "$DEBUG" = true ]; then
    TEST_COMMAND="$TEST_COMMAND --debug"
fi

eval $TEST_COMMAND
EXIT_CODE=$?

echo ""
echo "============================="

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "⚠️  Some tests failed or were skipped"
fi

echo ""
echo "📊 View detailed report:"
echo "   npx playwright show-report test-results/production-report"
echo ""
echo "📋 JSON results:"
echo "   test-results/production-results.json"
echo ""

exit $EXIT_CODE

