# Feature: Consultar link de pago

#   @cobrosPortalPagosBFC
#   Scenario Outline: TC - BFC - Link - Validar endpoint consultar que retorna correctamente un link <estadoLink>
#     Given Existe un link de pago con estado "<estadoLink>"
#     When Envío una solicitud "GET" al endpoint "/link-pago/v1/link/consultar"
#     Then el código de respuesta debe ser "<codigoRespuesta>"
#     And la respuesta data contiene todos los campos esperados para el link "<estadoLink>"

#     Examples:
#       | estadoLink | codigoEstado | codigoRespuesta |
#       | activo     | A            |             200 |
#       | expirado   | E            |             400 |
#       | usado      | U            |             400 |
#       | bloqueado  | N            |             400 |

#   @cobrosPortalPagosBFC
#   Scenario: TC - BFC - Link - Validar consulta sin codigoAuditoria
#     Given No envío el header codigoAuditoria
#     When Envío una solicitud "GET" al endpoint "/link-pago/v1/link/consultar"
#     Then el código de respuesta debe ser "400"

