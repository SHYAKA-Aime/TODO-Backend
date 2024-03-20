const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: "SHYAKA's TODO API ",
        version: '1.0.0',
        description: "API documentation for SHYAKA's TODO app",
      },
      servers: [
        {
          url: 'http://localhost:4000',
          description: 'Development server',
        },
      ],
      components: {
        schemas: {
            User: {
                type: 'object',
                properties: {
                  Email: { type: 'string' },
                  Password: { type: 'string' },
                },
              },
          Todo: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              completed: { type: 'boolean' },
            },
          },
        },
      },
    },
    apis: ['./src/server.ts'], // Path to your API implementation file
  };
  
const specs = swaggerJsdoc(options);

module.exports = specs;
