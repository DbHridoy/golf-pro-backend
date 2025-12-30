import { Router } from "express";
import path from "node:path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const router = Router();

// Load the swagger.yaml file
const swaggerDocument = YAML.load(path.join(process.cwd(), "swagger.yaml"));

// Swagger UI options
const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #2c5aa0; }
    .swagger-ui .scheme-container { background: #f8f9fa; padding: 10px; border-radius: 5px; }
  `,
  customSiteTitle: "Golf Pro API Documentation",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: "none",
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
  },
};

// Serve swagger documentation
router.use("/", swaggerUi.serve);
router.get("/", swaggerUi.setup(swaggerDocument, swaggerOptions));

// Serve raw swagger JSON
router.get("/json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerDocument);
});

// Serve raw swagger YAML
router.get("/yaml", (req, res) => {
  res.setHeader("Content-Type", "text/yaml");
  res.sendFile(path.join(process.cwd(), "swagger.yaml"));
});

export default router;
