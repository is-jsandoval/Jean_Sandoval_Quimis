import { Given, When } from "@cucumber/cucumber";
import { RequestHelper } from "../../../helper/wrapper/RequestHelper";

import * as rqbody from "../data/rqBody.json";
import * as hdrs from "../data/hdrs.json";

const requestHandler = new RequestHelper();

Given(
  "Cliente tiene sus datos para el endpoint {string}",
  async function (endpoint) {

    this.endpoint = endpoint;

    this.ruc = "0930482104001";

    this.hdrs = {
      ...hdrs,
      ruc: this.ruc
    };

    this.body = rqbody[endpoint] || null;
    this.body.codigoComercioExistente = 0;

  }
);

When(
  "Envío una solicitud {string} al endpoint configurado",
  async function (metodo) {

    this.rp = await requestHandler.getResponseBody(
      this.body,
      this.endpoint,
      metodo,
      {},
      this.hdrs
    );

    console.info(
      "Respuesta:",
      JSON.stringify(this.rp, null, 2)
    );

    this.attach(
      JSON.stringify(this.rp, null, 2),
      "application/json"
    );

  }
);