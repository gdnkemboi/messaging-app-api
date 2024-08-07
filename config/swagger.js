const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

// Swagger definition
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Messaging App API",
    version: "1.0.0",
    description:
      "A messaging app API built with Express and documented with Swagger",
  },
  servers: [
    {
      url: process.env.SWAGGER_SERVER_URL || "http://localhost:3000",
      description: "Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};
