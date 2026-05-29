export const cambiarEstadoLink = `
update BG_tcomercios.Pagos.lp_links set ln_estado=@estado where ln_audit_number=@numero
update BG_tcomercios.Pagos.lp_links_logs set lg_estado=@estado where lg_audit_number=@numero
`


export const consultarEstadoLink = `
select ln_estado as estado1 from BG_tcomercios.Pagos.lp_links where ln_audit_number=@numero
select lg_estado as estado2 from BG_tcomercios.Pagos.lp_links_logs where lg_audit_number=@numero
`