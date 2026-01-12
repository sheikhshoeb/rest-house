const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");

const routesPath = path.join(__dirname, "../routes/**/*.js");

console.log("🔍 Swagger scanning routes at:", routesPath);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Rest House API",
      version: "1.0.0",
      description: "API documentation for Rest House backend",
    },

    servers: [
      {
        url: "http://localhost:5001",
        description: "Local Development",
      },
      {
        url: "https://rest-house-production.up.railway.app",
        description: "Production",
      },
    ],
  },

  apis: [routesPath],
};

module.exports = swaggerJSDoc(options);
