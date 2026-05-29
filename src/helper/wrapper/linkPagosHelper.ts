import { RequestHelper } from "./RequestHelper";

const requestHandler = new RequestHelper();

export async function generaLinkPagos(
  monto: string,
  ruc: string,
  motivo: string
): Promise<string> {
  const varMonto = parseFloat(monto);

  const rqLink = {
    ruc,
    motivo,
    monto: varMonto.toFixed(2),
    MontoIVA: (varMonto - varMonto / 1.15).toFixed(2),
    nombreCliente: "AutomationsJS",
    NombreComercio: "AutomationsJS",
    correoComercio: "AutomationsJS@gmail.com",
    canalBG: "QA",
    tipoPago: "C"
  };

  const rp = await requestHandler.getResponseBody(
    null,
    "/link-pago/v1/link/generar",
    "POST",
    rqLink,
    {},
    "http://pagosbe.apps.test.ocp.bancoguayaquil.com"
  );

  const responseBody = rp.responseBody as { data?: { link?: string } };
  const auditNumber = responseBody.data?.link?.split("/").pop();

  if (!auditNumber) {
    throw new Error("No se pudo obtener el auditNumber del link de pago.");
  }

  console.info("String(auditNumber): ", String(auditNumber));
  return String(auditNumber);
}
