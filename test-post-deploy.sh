#!/bin/bash

# Post-deployment API testing script
# This script waits for the API to be healthy and then runs the test suite

API_URL="http://localhost:5100"
MAX_RETRIES=30
RETRY_INTERVAL=10

echo "🚀 Starting post-deployment API tests..."
echo "API URL: $API_URL"

# Wait for API to be healthy
echo "⏳ Waiting for API to be healthy..."
for i in $(seq 1 $MAX_RETRIES); do
    if curl -f -s "$API_URL/health" > /dev/null 2>&1; then
        echo "✅ API is healthy after $((i * RETRY_INTERVAL)) seconds"
        break
    elif [ $i -eq $MAX_RETRIES ]; then
        echo "❌ API failed to become healthy after $((MAX_RETRIES * RETRY_INTERVAL)) seconds"
        exit 1
    else
        echo "⏳ Attempt $i/$MAX_RETRIES: API not ready, waiting ${RETRY_INTERVAL}s..."
        sleep $RETRY_INTERVAL
    fi
done

# Run the test suite
echo "🧪 Running API test suite..."
npm run test:api:docker

TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All API tests passed!"
else
    echo "❌ Some API tests failed!"
    exit $TEST_EXIT_CODE
fi