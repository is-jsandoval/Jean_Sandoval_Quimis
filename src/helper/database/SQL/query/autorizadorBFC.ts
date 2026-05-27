export const consultaComercioRUCGeneraLink = `
select co_giro,co_terminal,co_mid,co_descripcion,co_ciudad,co_pais from BG_TComercios.Pagos.lp_comercios  where co_ruc=@ruc`;
