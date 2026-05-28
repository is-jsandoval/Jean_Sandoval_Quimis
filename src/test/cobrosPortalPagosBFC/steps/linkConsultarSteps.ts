import * as assert from "assert";
import { Given, When, Then } from "@cucumber/cucumber";
import { RequestHelper } from "../../../helper/wrapper/RequestHelper";
import Assert from "../../../helper/wrapper/assert";

const requestHandler = new RequestHelper();
const hdrs = require("../data/v1/hdrs.json");
Given("Existe un link de pago con estado {string}",
  async function (estadoLink: string) {
    this.extraHeaders = {};
    const header = {
      ...hdrs["/link-pago/v1/link/consultar"]["GET"]
    }
    switch (estadoLink) {
      case "activo":
        header.codigoAuditoria = "618596";
        this.hdrs = header
        break;
      case "expirado":
        header.codigoAuditoria = "902810";
        this.hdrs = header
        break;
      case "usado":
        header.codigoAuditoria = "917531";
        this.hdrs = header
        break;
      case "bloqueado":
        header.codigoAuditoria = "999999";
        this.hdrs = header
        break;

    }

  }
);
Given("No envío el header codigoAuditoria",
  async function () {
    this.hdrs = {
      accept: "text/plain"
    };
  }
);

When("Envío una solicitud {string} al endpoint {string}",
  async function (metodo, endpoint) {
    this.rp = await requestHandler.getResponseBody(
      null,
      endpoint,
      metodo,
      {},
      {
        ...this.hdrs,
        ...this.extraHeaders
      }
    );
    this.attach(JSON.stringify(this.rp, null, 2), "application/json");
    console.log("Respuesta recibida:", JSON.stringify(this.rp, null, 2));

  }
);

Then("el código de respuesta debe ser {string}",
  async function (status: string) {
    await Assert.assertStatus(String(this.rp?.status), String(status));
  }
);

Then("la respuesta data contiene todos los campos esperados para el link {string}",
  function (estadoLink: string) {
    const responseBody = this.rp?.responseBody;
    assert.ok(responseBody, "La respuesta no contiene responseBody");

    switch (estadoLink) {
      case "activo":
        const monto = responseBody.data.monto;
        assert.ok(monto !== undefined && monto !== null && monto !== "",
          `El campo 'monto' debe estar poblado. Valor recibido: ${monto}`
        );
        break;

      case "expirado":
        assert.strictEqual(
          responseBody.message,
          "El link de pagos expiró.",
          `Se esperaba mensaje 'El link de pagos expiró.', pero se obtuvo '${responseBody.message}'`
        );
        break;
      case "usado":
        assert.strictEqual(
          responseBody.message,
          "El link ya se encuentra pagado.",
          `Se esperaba mensaje 'El link ya se encuentra pagado.', pero se obtuvo '${responseBody.message}'`
        );
        break;
      case "bloqueado":
        assert.strictEqual(
          responseBody.message,
          "El link de pagos no existe.",
          `Se esperaba mensaje 'El link de pagos no existe.', pero se obtuvo '${responseBody.message}'`
        );
        break;
    }
  }
);
////////////////////////////////////////////////////








Given(
  "Envío el header \"codigoAuditoria\" inválido",
  async function () {
    this.endpoint = "/link-pago/v1/link/consultar";
    this.hdrs = {
      accept: "text/plain",
      codigoAuditoria: "000000"
    };
    this.rqBody = {};
  }
);

Given(
  "Existe un link válido",
  async function () {
    this.endpoint = "/link-pago/v1/link/consultar";
    this.hdrs = {
      accept: "text/plain",
      codigoAuditoria: "618596"
    };
    this.rqBody = {};
  }
);









Then(
  "la respuesta contiene el objeto {string}",
  function (field: string) {
    const value = this.rp?.responseBody?.[field];
    assert.ok(value && typeof value === "object", `La respuesta no contiene el objeto '${field}'`);
  }
);

Then(
  "el estado del link debe ser {string}",
  function (codigoEstado: string) {
    const data = this.rp?.responseBody?.data;
    assert.ok(data, "La respuesta no contiene el objeto 'data'");

    const estado = data.estado || this.rp?.responseBody?.estado;
    assert.strictEqual(
      estado,
      codigoEstado,
      `Se esperaba estado '${codigoEstado}' pero se obtuvo '${estado}'`
    );
  }
);

Then(
  "el campo {string} debe ser decimal",
  function (field: string) {
    const value = this.rp?.responseBody?.data?.[field];
    assert.ok(typeof value === "number" && !Number.isNaN(value), `El campo '${field}' debe ser decimal y es '${value}'`);
  }
);

Then(
  "el campo {string} debe ser tipo fecha",
  function (field: string) {
    const value = this.rp?.responseBody?.data?.[field];
    const date = new Date(value);
    assert.ok(!Number.isNaN(date.getTime()), `El campo '${field}' no es una fecha válida: '${value}'`);
  }
);

Then(
  "el campo {string} debe ser string",
  function (field: string) {
    const value = this.rp?.responseBody?.data?.[field];
    assert.strictEqual(typeof value, "string", `El campo '${field}' debe ser string y es '${typeof value}'`);
  }
);
