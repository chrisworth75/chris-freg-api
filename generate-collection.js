#!/usr/bin/env node

/**
 * Postman Collection Generator for chris-freg-api
 *
 * This script generates a Postman collection dynamically during the build process.
 * It includes endpoints for fee management operations.
 */

const fs = require('fs');
const path = require('path');

// Get configuration from environment variables or use defaults
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8081';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'Chris FREG API Collection';
const BUILD_NUMBER = process.env.BUILD_NUMBER || 'dev';

// Collection template
const collection = {
    info: {
        _postman_id: generateUUID(),
        name: `${COLLECTION_NAME} - Build ${BUILD_NUMBER}`,
        description: `Automatically generated Postman collection for Fee Registry API testing. Build: ${BUILD_NUMBER}, Generated: ${new Date().toISOString()}`,
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    item: [
        {
            name: "Health Check",
            item: [
                {
                    name: "Health Check",
                    event: [
                        {
                            listen: "test",
                            script: {
                                exec: [
                                    "pm.test(\"Status code is 200\", function () {",
                                    "    pm.response.to.have.status(200);",
                                    "});",
                                    "",
                                    "pm.test(\"Response contains status\", function () {",
                                    "    var jsonData = pm.response.json();",
                                    "    pm.expect(jsonData.status).to.eql('healthy');",
                                    "});",
                                    "",
                                    "pm.test(\"Response time is less than 500ms\", function () {",
                                    "    pm.expect(pm.response.responseTime).to.be.below(500);",
                                    "});"
                                ],
                                type: "text/javascript"
                            }
                        }
                    ],
                    request: {
                        method: "GET",
                        header: [],
                        url: `${BASE_URL}/health`,
                        description: "Check if the API is healthy and running"
                    },
                    response: []
                }
            ]
        },
        {
            name: "Fee Management",
            item: [
                {
                    name: "Get All Fees",
                    event: [
                        {
                            listen: "test",
                            script: {
                                exec: [
                                    "pm.test(\"Status code is 200\", function () {",
                                    "    pm.response.to.have.status(200);",
                                    "});",
                                    "",
                                    "pm.test(\"Response is an array\", function () {",
                                    "    var jsonData = pm.response.json();",
                                    "    pm.expect(jsonData).to.be.an('array');",
                                    "});",
                                    "",
                                    "pm.test(\"Response time is less than 2000ms\", function () {",
                                    "    pm.expect(pm.response.responseTime).to.be.below(2000);",
                                    "});"
                                ],
                                type: "text/javascript"
                            }
                        }
                    ],
                    request: {
                        method: "GET",
                        header: [],
                        url: `${BASE_URL}/fees`,
                        description: "Retrieve all fees from the database"
                    },
                    response: []
                },
                {
                    name: "Get Fee by Code",
                    event: [
                        {
                            listen: "test",
                            script: {
                                exec: [
                                    "pm.test(\"Status code is 200 or 404\", function () {",
                                    "    pm.expect(pm.response.code).to.be.oneOf([200, 404]);",
                                    "});",
                                    "",
                                    "if (pm.response.code === 200) {",
                                    "    pm.test(\"Fee has required fields\", function () {",
                                    "        var jsonData = pm.response.json();",
                                    "        pm.expect(jsonData).to.have.property('code');",
                                    "        pm.expect(jsonData).to.have.property('value');",
                                    "        pm.expect(jsonData).to.have.property('description');",
                                    "        pm.expect(jsonData).to.have.property('status');",
                                    "    });",
                                    "}",
                                    "",
                                    "pm.test(\"Response time is less than 1000ms\", function () {",
                                    "    pm.expect(pm.response.responseTime).to.be.below(1000);",
                                    "});"
                                ],
                                type: "text/javascript"
                            }
                        }
                    ],
                    request: {
                        method: "GET",
                        header: [],
                        url: `${BASE_URL}/fee/FEE001`,
                        description: "Retrieve a specific fee by its code"
                    },
                    response: []
                },
                {
                    name: "Create Fee",
                    event: [
                        {
                            listen: "test",
                            script: {
                                exec: [
                                    "pm.test(\"Status code is 201\", function () {",
                                    "    pm.response.to.have.status(201);",
                                    "});",
                                    "",
                                    "pm.test(\"Response contains fee object\", function () {",
                                    "    var jsonData = pm.response.json();",
                                    "    pm.expect(jsonData).to.have.property('fee');",
                                    "    pm.expect(jsonData.fee).to.have.property('id');",
                                    "    pm.expect(jsonData.fee.code).to.exist;",
                                    "});",
                                    "",
                                    "pm.test(\"Fee has correct values\", function () {",
                                    "    var jsonData = pm.response.json();",
                                    "    pm.expect(jsonData.fee.code).to.be.a('string');",
                                    "    pm.expect(jsonData.fee.value).to.be.a('number');",
                                    "    pm.expect(jsonData.fee.description).to.be.a('string');",
                                    "    pm.expect(jsonData.fee.status).to.be.a('string');",
                                    "});",
                                    "",
                                    "// Save the fee code for later tests",
                                    "if (pm.response.code === 201) {",
                                    "    var jsonData = pm.response.json();",
                                    "    pm.collectionVariables.set('created_fee_code', jsonData.fee.code);",
                                    "}"
                                ],
                                type: "text/javascript"
                            }
                        }
                    ],
                    request: {
                        method: "POST",
                        header: [
                            {
                                key: "Content-Type",
                                value: "application/json"
                            }
                        ],
                        body: {
                            mode: "raw",
                            raw: JSON.stringify({
                                code: "TEST_FEE_" + Date.now(),
                                value: 100.50,
                                description: "Test fee created by Newman",
                                status: "active",
                                type: "fixed",
                                service: "kylie"
                            }, null, 2)
                        },
                        url: `${BASE_URL}/fee`,
                        description: "Create a new fee in the system"
                    },
                    response: []
                },
                {
                    name: "Create Fee - Validation Error",
                    event: [
                        {
                            listen: "test",
                            script: {
                                exec: [
                                    "pm.test(\"Status code is 400\", function () {",
                                    "    pm.response.to.have.status(400);",
                                    "});",
                                    "",
                                    "pm.test(\"Response contains error message\", function () {",
                                    "    var jsonData = pm.response.json();",
                                    "    pm.expect(jsonData).to.have.property('error');",
                                    "});"
                                ],
                                type: "text/javascript"
                            }
                        }
                    ],
                    request: {
                        method: "POST",
                        header: [
                            {
                                key: "Content-Type",
                                value: "application/json"
                            }
                        ],
                        body: {
                            mode: "raw",
                            raw: JSON.stringify({
                                code: "INVALID",
                                // Missing required fields
                            }, null, 2)
                        },
                        url: `${BASE_URL}/fee`,
                        description: "Test validation error handling"
                    },
                    response: []
                }
            ]
        },
        {
            name: "Database Operations",
            item: [
                {
                    name: "Reset Database",
                    event: [
                        {
                            listen: "test",
                            script: {
                                exec: [
                                    "pm.test(\"Status code is 200\", function () {",
                                    "    pm.response.to.have.status(200);",
                                    "});",
                                    "",
                                    "pm.test(\"Response time is less than 2000ms\", function () {",
                                    "    pm.expect(pm.response.responseTime).to.be.below(2000);",
                                    "});"
                                ],
                                type: "text/javascript"
                            }
                        }
                    ],
                    request: {
                        method: "POST",
                        header: [],
                        url: `${BASE_URL}/reset-db`,
                        description: "Clear all fees from the database"
                    },
                    response: []
                }
            ]
        }
    ],
    event: [
        {
            listen: "prerequest",
            script: {
                type: "text/javascript",
                exec: [
                    "console.log('Running request: ' + pm.info.requestName);"
                ]
            }
        },
        {
            listen: "test",
            script: {
                type: "text/javascript",
                exec: [
                    "pm.test(\"Response has valid JSON\", function () {",
                    "    pm.response.to.be.json;",
                    "});"
                ]
            }
        }
    ],
    variable: [
        {
            key: "base_url",
            value: BASE_URL,
            type: "string"
        },
        {
            key: "build_number",
            value: BUILD_NUMBER,
            type: "string"
        },
        {
            key: "created_fee_code",
            value: "",
            type: "string"
        }
    ]
};

// Helper function to generate UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Output directory
const outputDir = process.env.OUTPUT_DIR || 'build';
const outputFile = path.join(outputDir, 'api-collection.json');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Write the collection to file
fs.writeFileSync(outputFile, JSON.stringify(collection, null, 2));

console.log('========================================');
console.log('Postman Collection Generated Successfully');
console.log('========================================');
console.log(`Collection Name: ${collection.info.name}`);
console.log(`Build Number: ${BUILD_NUMBER}`);
console.log(`Base URL: ${BASE_URL}`);
console.log(`Output File: ${outputFile}`);
console.log('========================================');

// Also create a metadata file
const metadata = {
    generatedAt: new Date().toISOString(),
    buildNumber: BUILD_NUMBER,
    baseUrl: BASE_URL,
    collectionName: COLLECTION_NAME,
    requestCount: collection.item.reduce((count, folder) => count + folder.item.length, 0),
    fileName: outputFile
};

fs.writeFileSync(
    path.join(outputDir, 'collection-metadata.json'),
    JSON.stringify(metadata, null, 2)
);

console.log('Metadata file created: collection-metadata.json');
