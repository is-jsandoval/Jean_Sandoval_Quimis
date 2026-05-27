import * as fs from "fs";
import { request } from "@playwright/test";

// =====================================
// CONFIG
// =====================================

const swaggerConfig = JSON.parse(
  fs.readFileSync("./swagger.config.json", "utf-8")
);

// =====================================
// ARGUMENTO
// =====================================

const apiName = process.argv[2];

if (!apiName) {

  throw new Error(
    "Debe enviar el nombre del api. Ejemplo: npm run swagger:generate cobrosCross"
  );
}

const apiConfig = swaggerConfig[apiName];

if (!apiConfig) {

  throw new Error(
    `No existe configuración para el api: ${apiName}`
  );
}

const swaggerUrl =
  apiConfig.url;

const outputFolder =
  apiConfig.outputFolder;
// =====================================
// MAIN
// =====================================

async function main() {

  console.log(`Generando archivos para: ${apiName}`);
  console.log(`Swagger URL: ${swaggerUrl}`);

  // =====================================
  // PLAYWRIGHT REQUEST
  // =====================================

  const apiContext = await request.newContext();

  const response = await apiContext.get(swaggerUrl);

  if (!response.ok()) {

    throw new Error(
      `Error obteniendo swagger: ${response.status()}`
    );
  }

  const swagger = await response.json();

  // =====================================
  // VALIDAR OPENAPI
  // =====================================

  if (!swagger.openapi?.startsWith("3")) {

    throw new Error(
      "Solo se soporta OpenAPI 3.x"
    );
  }

  const rqBody: Record<string, any> = {};
  const headers: Record<string, any> = {};

  const schemas =
    swagger.components?.schemas ?? {};

  // =====================================
  // HELPERS
  // =====================================

  function resolveRef(ref: string) {

    const schemaName =
      ref.split("/").pop();

    return schemas[schemaName];
  }

  function buildSchemaExample(schema: any): any {

    if (!schema) return {};

    // =====================================
    // REF
    // =====================================

    if (schema.$ref) {

      return buildSchemaExample(
        resolveRef(schema.$ref)
      );
    }

    // =====================================
    // OBJECT
    // =====================================

    if (schema.type === "object") {

      const obj: any = {};

      for (const key in schema.properties) {

        obj[key] = buildSchemaExample(
          schema.properties[key]
        );
      }

      return obj;
    }

    // =====================================
    // ARRAY
    // =====================================

    if (schema.type === "array") {
      return [];
    }

    // =====================================
    // STRING
    // =====================================

    if (schema.type === "string") {

      // EMAIL
      if (schema.format === "email") {
        return "user@example.com";
      }

      // ENUM C|D
      if (schema.pattern === "^(C|D)$") {
        return "C";
      }

      // DATE TIME
      if (schema.format === "date-time") {
        return new Date().toISOString();
      }

      return "string";
    }

    // =====================================
    // INTEGER
    // =====================================

    if (schema.type === "integer") {
      return schema.default ?? 0;
    }

    // =====================================
    // NUMBER
    // =====================================

    if (schema.type === "number") {
      return 0;
    }

    // =====================================
    // BOOLEAN
    // =====================================

    if (schema.type === "boolean") {
      return false;
    }

    return null;
  }

  // =====================================
  // RECORRER PATHS
  // =====================================

  for (const path in swagger.paths) {

    const methods = swagger.paths[path];

    rqBody[path] = {};
    headers[path] = {};

    for (const method in methods) {

      const endpoint = methods[method];

      const methodUpper =
        method.toUpperCase();

      // =====================================
      // HEADERS
      // =====================================

      if (endpoint.parameters) {

        const hdrs: any = {};

        endpoint.parameters.forEach(
          (param: any) => {

            if (param.in === "header") {

              hdrs[param.name] =
                param.schema?.default ??
                buildSchemaExample(
                  param.schema
                );
            }
          }
        );

        if (
          Object.keys(hdrs).length > 0
        ) {

          headers[path][methodUpper] =
            hdrs;
        }
      }

      // =====================================
      // REQUEST BODY
      // =====================================

      if (endpoint.requestBody) {

        const content =
          endpoint.requestBody
            .content?.["application/json"];

        if (content?.schema) {

          rqBody[path][methodUpper] =
            buildSchemaExample(
              content.schema
            );
        }
      }
    }

    // =====================================
    // LIMPIAR VACÍOS
    // =====================================

    if (
      Object.keys(rqBody[path]).length === 0
    ) {

      delete rqBody[path];
    }

    if (
      Object.keys(headers[path]).length === 0
    ) {

      delete headers[path];
    }
  }

  // =====================================
  // OUTPUT DIRECTORY
  // =====================================
const versionMatch =
  swaggerUrl.match(/\/v(\d+)\//i);

const version =
  versionMatch
    ? `v${versionMatch[1]}`
    : "v1";

const outputDir =
  `./src/test/${outputFolder}/data/${version}`;

  if (!fs.existsSync(outputDir)) {

    fs.mkdirSync(outputDir, {
      recursive: true
    });
  }

  // =====================================
  // GENERAR ARCHIVOS
  // =====================================

  fs.writeFileSync(
    `${outputDir}/rqBody.json`,
    JSON.stringify(rqBody, null, 2)
  );

  fs.writeFileSync(
    `${outputDir}/hdrs.json`,
    JSON.stringify(headers, null, 2)
  );

  console.log(
    "Archivos generados correctamente"
  );

  console.log(
    `Ruta: ${outputDir}`
  );

  await apiContext.dispose();
}

main();