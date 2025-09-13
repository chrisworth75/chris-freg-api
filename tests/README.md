# API Testing

This directory contains automated API tests for the chris-freg-api using Newman (Postman CLI).

## Structure

```
tests/
├── postman/
│   └── fees-api.postman_collection.json    # Main API test collection
├── environments/
│   ├── local.postman_environment.json      # Local development environment
│   └── docker.postman_environment.json     # Docker deployment environment
└── README.md                               # This file
```

## Available Test Scripts

```bash
# Run tests against local API (development)
npm run test:api

# Run tests against Docker deployed API
npm run test:api:docker

# Run integration tests (alias for docker tests)
npm run test:integration

# Run all tests (default)
npm test
```

## Post-Deployment Testing

Use the included script to test API after deployment:

```bash
./test-post-deploy.sh
```

This script:
1. Waits for the API health endpoint to respond
2. Runs the full test suite against the deployed API
3. Provides clear pass/fail feedback

## Test Coverage

The test suite covers:

- ✅ Health check endpoint
- ✅ GET /fees (list all fees)
- ✅ POST /fee (create new fee)
- ✅ GET /fee/:code (get specific fee)
- ✅ Error handling (400, 404, 409 responses)
- ✅ Validation of request/response formats
- ✅ Response time requirements

## Importing Your Existing Postman Collection

To replace the sample collection with your existing Postman collection:

1. Export your collection from Postman (Collection → Export → Collection v2.1)
2. Replace `tests/postman/fees-api.postman_collection.json` with your exported file
3. Update environment variables in `tests/environments/` if needed
4. Run tests to verify: `npm run test:api:docker`

## Environment Variables

The test environments use these variables:

| Variable | Description | Local | Docker |
|----------|-------------|-------|--------|
| baseUrl  | API base URL | http://localhost:5100 | http://localhost:5100 |

## Jenkins Integration

Add this to your Jenkins pipeline after deployment:

```bash
# Wait for deployment and run tests
./test-post-deploy.sh
```

The script will fail the build if tests don't pass.