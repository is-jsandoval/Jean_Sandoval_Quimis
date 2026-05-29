import * as assert from "assert";
import { Given, When, Then } from "@cucumber/cucumber";
import { RequestHelper } from "../../../helper/wrapper/RequestHelper";
import Assert from "../../../helper/wrapper/assert";
import { generaLinkPagos } from "../../../helper/wrapper/linkPagosHelper";
import { consultarEstadoLink, cambiarEstadoLink } from "../data/cobrosPortalPagosQueries";

const requestHandler = new RequestHelper();
const hdrs = require("../data/v1/hdrs.json");


Given("Marcar {string} un link de pago con estado {string} para el endpoint marcar link",
  async function (estadoDestino: string, estadoLink: string) {

    this.auditNumber = await generaLinkPagos("11.11", "0954121646001", "Pago automatizado");
    this.extraHeaders = {};
    const header = {
      ...hdrs["/link-pago/v1/link/consultar"]["GET"]
    }

    header.codigoAuditoria = this.auditNumber;
    header.estado = estadoDestino;
    header.codigoError = "00";
    this.hdrs = header

  }
);




When("Envío una solicitud {string} al endpoint {string} para el endpoint marcar link",
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

  }
);

Then("el código de respuesta debe ser {string} para el endpoint marcar link",
  async function (status: string) {
    await Assert.assertStatus(String(this.rp?.status), String(status));
  }
);

Then("el estado del link debe actualizarse a {string} para el endpoint marcar link",
  async function (estadoLink: string) {
    const estadoObtenido = await this.dbs.linkPagos
      .request()
      .input("numero",this.auditNumber)
      .query(consultarEstadoLink);    
    const estado1 = estadoObtenido?.recordsets?.[0]?.[0]?.estado1;
    const estado2 = estadoObtenido?.recordsets?.[1]?.[0]?.estado2;
    
    assert.strictEqual(estado1, estadoLink, `Estado1: se esperaba '${estadoLink}' pero se obtuvo '${estado1}'`);
    assert.strictEqual(estado2, estadoLink, `Estado2: se esperaba '${estadoLink}' pero se obtuvo '${estado2}'`);
  }
);


////////////////////////////////////////////////////
Given("Existe un link de pago con estado {string} para el endpoint marcar link a estado {string}",
  async function (estadoActual: string, estadoDestino: string) {

    this.auditNumber = await generaLinkPagos("11.11", "0954121646001", "Pago automatizado");
    this.extraHeaders = {};
    const header = {
      ...hdrs["/link-pago/v1/link/consultar"]["GET"]
    }

    await this.dbs.linkPagos
          .request()
          .input("numero", this.auditNumber)
          .input("estado", estadoActual)
          .query(cambiarEstadoLink);

    header.codigoAuditoria = this.auditNumber;
    header.estado = estadoDestino;
    header.codigoError = "00";
    this.hdrs = header

  }
);

Then("la respuesta contiene el mensaje {string} para el endpoint marcar link",
  async function (mensaje: string) {
    await Assert.assertStatus(String(this.rp?.errorMsg), String(mensaje));
  }
);

