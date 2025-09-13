# chris-freg Projects

This is part of a 3-project system designed for local development and deployment on an M1 Mac using Jenkins and Docker Desktop:

- **chris-freg** - Frontend application
- **chris-freg-api** - REST API backend
- **chris-freg-db** - Database initialization and schema

All projects are configured to be built and deployed automatically by a local Jenkins installation that polls GitHub repositories, builds Docker images, and deploys containers with full CI/CD pipeline integration.

## chris-freg-api

Node.js Express REST API for fees management with comprehensive testing.

### Features
- RESTful endpoints for fee CRUD operations
- PostgreSQL database integration
- Docker containerization with health checks
- Newman-based API testing suite
- Jenkins CI/CD pipeline integration

### API Endpoints
- `GET /health` - Health check
- `GET /fees` - List all fees
- `POST /fee` - Create new fee
- `GET /fee/:code` - Get fee by code
- `POST /reset-db` - Reset database (testing)

### Development
```bash
npm install
npm start                 # Start API server
npm test                  # Run API tests
npm run test:api:docker   # Test deployed API
```

### Testing
Comprehensive test suite using Newman (Postman CLI):
- All CRUD operations tested
- Error handling validation (400, 404, 409)
- Database reset for clean test runs
- Automated in Jenkins pipeline

### Deployment
Jenkins pipeline automatically:
1. Builds Docker image
2. Deploys with database
3. Runs health checks
4. Executes full API test suite
5. Fails build if tests don't pass