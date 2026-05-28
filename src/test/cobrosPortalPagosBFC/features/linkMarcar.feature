Feature: Marcar link de pago

  @cobrosPortalPagosBFC
  Scenario Outline: TC - BFC - Link - Validar cambio exitoso desde estado activo hacia "<estadoDestino>"
    Given Marcar "<estadoDestino>" un link de pago con estado "A" para el endpoint marcar link
    When Envío una solicitud "PUT" al endpoint "/link-pago/v1/link/marcar" para el endpoint marcar link
    Then el código de respuesta debe ser "200" para el endpoint marcar link
    #And el estado del link debe actualizarse a "<estadoDestino>" para el endpoint marcar link

    Examples:
      | estadoDestino |
      | N             |
      | U             |

#   @cobrosPortalPagosBFC
#   Scenario Outline: TC - BFC - Link - Validar transición no permitida desde "<estadoActual>" hacia "<estadoDestino>"
#     Given Existe un link de pago con estado "<estadoActual>"
#     When Envío una solicitud "PUT" al endpoint "/link-pago/v1/link/marcar"
#     Then el código de respuesta debe ser "400"
#     And la respuesta contiene el mensaje "<mensaje>"
#     Examples:
#       | estadoActual | estadoDestino | mensaje           |
#       | N            | U             | Estado no valido. |
#       | N            | A             | Estado no valido. |
#       | U            | N             | Estado no valido. |
#       | U            | A             | Estado no valido. |
#       | E            | A             | Estado no valido. |
#       | E            | U             | Estado no valido. |
#       | A            | E             | Estado no valido. |
# # =========================================================
# # VALIDACIONES DE HEADERS REQUERIDOS
# # =========================================================

#   @cobrosPortalPagosBFC
#   Scenario: TC - BFC - Link - Validar solicitud sin codigoAuditoria
#     Given No envío el header codigoAuditoria
#     And envío el header estado "N"
#     And envío el header codigoError "00"
#     When Envío una solicitud "PUT" al endpoint "/link-pago/v1/link/marcar"
#     Then el código de respuesta debe ser "400"

#   @cobrosPortalPagosBFC
#   Scenario: TC - BFC - Link - Validar solicitud sin estado
#     Given envío el header codigoAuditoria válido
#     And No envío el header estado
#     And envío el header codigoError "00"
#     When Envío una solicitud "PUT" al endpoint "/link-pago/v1/link/marcar"
#     Then el código de respuesta debe ser "400"

#   @cobrosPortalPagosBFC
#   Scenario: TC - BFC - Link - Validar solicitud sin codigoError
#     Given envío el header codigoAuditoria válido
#     And envío el header estado "N"
#     And No envío el header codigoError
#     When Envío una solicitud "PUT" al endpoint "/link-pago/v1/link/marcar"
#     Then el código de respuesta debe ser "400"
# # =========================================================
# # VALIDACIONES DE DATOS INVÁLIDOS
# # =========================================================

#   @cobrosPortalPagosBFC
#   Scenario Outline: TC - BFC - Link - Validar estado inválido "<estado>"
#     Given Existe un link de pago con estado "A"
#     And envío el header codigoAuditoria válido
#     And envío el header estado "<estado>"
#     And envío el header codigoError "00"
#     When Envío una solicitud "PUT" al endpoint "/link-pago/v1/link/marcar"
#     Then el código de respuesta debe ser "400"
#     And la respuesta contiene el mensaje "Estado inválido"
#       ```
#       Examples:
#         | estado |
#         | X      |
#         | 1      |
#         | ACTIVO |
#         | ""     |
#       ```

#   @cobrosPortalPagosBFC
#   Scenario: TC - BFC - Link - Validar codigoAuditoria inexistente
#     Given envío el header codigoAuditoria "999999999"
#     And envío el header estado "N"
#     And envío el header codigoError "00"
#     When Envío una solicitud "PUT" al endpoint "/link-pago/v1/link/marcar"
#     Then el código de respuesta debe ser "404"
# # =========================================================
# # VALIDACIONES TÉCNICAS
# # =========================================================

#   @cobrosPortalPagosBFC
#   Scenario: TC - BFC - Link - Validar método HTTP no permitido
#     Given Existe un link de pago con estado "A"
#     When Envío una solicitud "POST" al endpoint "/link-pago/v1/link/marcar"
#     Then el código de respuesta debe ser "405"
# # =========================================================
# # VALIDACIONES DE AUDITORÍA
# # =========================================================

#   @cobrosPortalPagosBFC
#   Scenario: TC - BFC - Link - Validar generación de traceid
#     Given Existe un link de pago con estado "A"
#     And envío el header codigoAuditoria válido
#     And envío el header estado "N"
#     And envío el header codigoError "00"
#     When Envío una solicitud "PUT" al endpoint "/link-pago/v1/link/marcar"
#     Then el código de respuesta debe ser "200"
#     And la respuesta contiene un traceid informado
