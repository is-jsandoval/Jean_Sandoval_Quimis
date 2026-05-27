const cucumberReporter = require("cucumber-html-reporter");

import * as fs from "fs";
import * as path from "path";
import logger from "../util/logger";
import { chromium } from "playwright/test";

const pdfArg = `${process.argv[3]}`.toUpperCase();

const squad = process.argv[2];

const squadNames: Record<string, string> = {
  afiliacionBE: "Ecosistemas",
  autorizadorBFC: "Ecosistemas",
  comerciosBE: "Ecosistemas",
  pagosBE: "Ecosistemas",
  cobrosPortalPagosBFC: "Ecosistemas",

  portalComerciosBFC: "Cobros Empresa",

  creditoComercioBFC: "Servicios",
};

const squadName = squadNames[squad] || squad;


const options = {
  theme: "bootstrap",
  name: "Matriz de pruebas de regresión automatizada API",
  brandTitle: "Tribu Comercios",

  jsonFile: `test-results/json/cucumber-report-${squad}.json`,
  output: `test-results/html/cucumber-report-${squad}.html`,
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: true,
  metadata: {
    "Ambiente": process.env.ENV || "Desarrollo",
    "Squad": squadName,
    "Capa": process.env.PROFILE || squad,
    "Ejecutado por": process.env.USER || "Local",
    "Fecha ejecución": new Date().toLocaleString("es-EC"),
    "Node": process.version,
  },
  failedSummaryReport: true,
};


cucumberReporter.generate(options);

if (pdfArg === "PDF") generarPDF();

export async function generarPDF() {
  const reportPath = path.resolve(
    process.cwd(),
    process.env.ARCHIVO_REPORTE_HTML || `test-results/html/cucumber-report-${squad}.html`
  );
  const outputPath = path.resolve(
    process.cwd(),
    `test-results/pdf/cucumber-report-${squad}.pdf`
  );

  logger.info("Generando reporte PDF...");

  if (!fs.existsSync(reportPath)) {
    logger.error(`❌ El archivo no existe: ${reportPath}`);
    process.exit(1);
  }

  const start = Date.now();

  try {
    const htmlRaw = await fs.promises.readFile(reportPath, "utf8");

    // Para que la herramienta interprete correctamente los caracteres especiales
    // como tildes y eñes, se asegura que el HTML tenga la meta etiqueta adecuada
    let html = htmlRaw.includes('<meta charset="UTF-8">')
      ? htmlRaw
      : htmlRaw.replace(/<head>/i, '<head><meta charset="UTF-8">');

    // Mejorar la apariencia de los charts
    html = html.replace(
      /class=(["'])([^"']*\bchart\b[^"']*)\1/g,
      (match, quote, classValue) => {
        // Solo dentro de class que contenga "chart"
        let cleaned = classValue
          .replace(/\bcol-(?:lg|md)-6\b/g, "") // eliminar las viejas
          .replace(/\s+/g, " ") // limpiar espacios
          .trim();

        // Aseguramos que contenga chart y col-6
        if (!/\bcol-6\b/.test(cleaned)) cleaned += " col-6";

        return `class=${quote}${cleaned.trim()}${quote}`;
      }
    );

    // Abre el HTML en un navegador sin interfaz gráfica
    const browser = await chromium.launch();

    // Crea una nueva página
    const page = await browser.newPage();

    // 1. Emular el tipo de medio "screen" antes de cargar el contenido
    await page.emulateMedia({ media: "screen" });

    // 2. Establecer el contenido HTML
    await page.setContent(html, { waitUntil: "networkidle", timeout: 100000 });

    // 3. Configurar el tamaño de la ventana (opcional, pero útil para layout)
    await page.setViewportSize({ width: 1240, height: 1754 });

    // Esperar a que los charts estén presentes
    await page.waitForSelector(".chart", { timeout: 100000 });

    // Realiza modificaciones en el DOM para optimizar la presentación en PDF
    await page.evaluate(() => {
      // Oculta la barra de navegación
      const navbar = document.querySelector(
        ".navbar.navbar-default.navbar-static-top"
      );
      if (navbar) {
        (navbar as any).style.display = "none";
      }

      // Expande todas las secciones colapsables
      document.querySelectorAll(".collapse").forEach((el) => {
        el.classList.add("show");
        (el as HTMLElement).style.display = "block";
      });

      document.querySelectorAll("[aria-expanded]").forEach((el) => {
        el.setAttribute("aria-expanded", "true");
      });

      document.querySelector(".text-right").remove();

      document.querySelectorAll(".toggle").forEach((el) => {
        el.remove();
      });
    });

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "25mm",
        bottom: "2cm",
        left: "1cm",
        right: "1cm",
      },
      displayHeaderFooter: true,
      headerTemplate: `
  <table style="width:90%; margin-left:5%; margin-right:5%; margin-bottom:20px; padding:1%; border-collapse:collapse; font-family:Helvetica Neue, Helvetica, Helvetica, Arial, sans-serif; font-size:10px; border:0.2px solid #f5f5f5;">
    <tr>
      <td rowspan="2" style="width:20%; padding:4px; border:0.2px solid #f5f5f5;">
        <img src="data:image/png;base64,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" style="height:25px; vertical-align:middle;" />
      </td>
      <td style="width:60%; text-align:center; padding:4px; border:0.2px solid #f5f5f5;">
        <div style="font-weight:bolder;">INFORME DE PRUEBAS AUTOMATIZADAS</div>
      </td>
      <td rowspan="2" style="width:20%; text-align:right; padding:4px; color:#555;border:0.2px solid #f5f5f5;">
        Página <span class="pageNumber"></span> de <span class="totalPages"></span>
      </td>
    </tr>
    <tr><td style="width:60%; text-align:center; padding:4px; border:0.2px solid #f5f5f5;color:#666; font-weight:bolder;">CALIDAD DE SOFTWARE</td></tr>
  </table>
`,
      footerTemplate: `
        <div style="font-size:10px; text-align:center; width:100%; margin-bottom:5px; font-family:Helvetica Neue, Helvetica, Helvetica, Arial, sans-serif; font-size:10px; border:none"">
          </span>
        </div>`,
    });

    await browser.close();

    const end = Date.now();
    logger.warn(`✅ PDF generado con éxito en: ${outputPath}`);
    logger.info(
      `⏱️ Tiempo de generación PDF: ${(end - start) / 1000} segundos`
    );
  } catch (error) {
    logger.error("❌ Error durante la generación del PDF:", error);
  }
}
