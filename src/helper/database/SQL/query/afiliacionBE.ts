export const limpiarComercioAE = `
-- Obtener los comercios una sola vez
DECLARE @Comercios TABLE (co_comercio INT);

INSERT INTO @Comercios
SELECT co_comercio
FROM nts_tarjcred.dbo.tc_comercios
WHERE co_ruc = @ruc;


-- eliminar links pagos
DELETE FROM BG_TComercios.Pagos.lp_links_logs 
WHERE lg_ruc = @ruc;

DELETE FROM BG_TComercios.Pagos.lp_links 
WHERE ln_ruc = @ruc;

DELETE L
FROM BG_TComercios.Pagos.lp_limites L
INNER JOIN BG_TComercios.Pagos.lp_comercios C
ON C.co_comercio_syscard = L.lt_comercio
WHERE C.co_ruc = @ruc;

DELETE FROM BG_TComercios.Pagos.lp_comercios 
WHERE co_ruc = @ruc;


-- eliminar dependencias de syscard
DELETE FROM nts_tarjcred.dbo.tc_cfechapagos
WHERE fp_comercio IN (SELECT co_comercio FROM @Comercios);

DELETE FROM nts_tarjcred.dbo.tc_comercios_alternos
WHERE ca_comercio IN (SELECT co_comercio FROM @Comercios);

DELETE FROM nts_tarjcred.dbo.tc_comercio_marca
WHERE cm_comercio IN (SELECT co_comercio FROM @Comercios);

DELETE FROM nts_tarjcred.dbo.tc_cafiliaciones
WHERE ca_comercio IN (SELECT co_comercio FROM @Comercios);

DELETE FROM nts_tarjcred.dbo.tc_cliquidadepositados
WHERE rd_comercio IN (SELECT co_comercio FROM @Comercios);

DELETE FROM nts_tarjcred.dbo.tc_cliquidahistoria
WHERE lh_comercio IN (SELECT co_comercio FROM @Comercios);

DELETE FROM nts_tarjcred.dbo.tc_cliquidadiaria
WHERE ld_comercio IN (SELECT co_comercio FROM @Comercios);

DELETE FROM nts_tarjcred.dbo.tc_tcomerdiferi
WHERE cd_comercio IN (SELECT co_comercio FROM @Comercios);

DELETE FROM nts_tarjcred.dbo.tc_comercioslimitepiso
WHERE lp_comercio IN (SELECT co_comercio FROM @Comercios);

DELETE FROM nts_tarjcred.dbo.tc_tdiferidos
WHERE di_comercio IN (SELECT co_comercio FROM @Comercios);

DELETE FROM nts_tarjcred.dbo.tc_transacciones_hist
WHERE th_comercio IN (SELECT co_comercio FROM @Comercios);

DELETE FROM nts_tarjcred.dbo.tc_transacciones
WHERE tn_comercio IN (SELECT co_comercio FROM @Comercios);

DELETE FROM nts_tarjcred.dbo.tc_comercio_empresa
WHERE ce_comercio IN (SELECT co_comercio FROM @Comercios);

DELETE FROM nts_tarjcred.dbo.tc_comercios
WHERE co_comercio IN (SELECT co_comercio FROM @Comercios);
`;

export const limpiarComercioAC = `
  -- quitar link pagos del comercio
      update nts_tarjcred.dbo.tc_comercios
      set co_linkPagos = NULL
      where co_ruc = @ruc;

      -- eliminar logs
      delete from BG_TComercios.Pagos.lp_links_logs
      where lg_ruc = @ruc;

      -- eliminar links
      delete from BG_TComercios.Pagos.lp_links
      where ln_ruc = @ruc;

      -- eliminar limites
      delete L
      from BG_TComercios.Pagos.lp_limites L
      inner join BG_TComercios.Pagos.lp_comercios C
        on C.co_comercio_syscard = L.lt_comercio
      where C.co_ruc = @ruc;

      -- eliminar comercio
      delete from BG_TComercios.Pagos.lp_comercios
      where co_ruc = @ruc;

      select * from BG_TComercios.Pagos.lp_comercios
      where co_ruc = @ruc;
      
`;

export const insertarComercioSRI = `
  DELETE BG_TComercios.Pagos.SRI_ESTABLECIMIENTOS_BG
  WHERE NUMERO_RUC = @ruc
  AND ID <> 3;

  UPDATE BG_TComercios.Pagos.SRI_ESTABLECIMIENTOS_BG
  SET NUMERO_RUC = @ruc
  WHERE ID = 3; 
`;

export const crearComercio = `

use nts_tarjcred
exec  sp_crea_comercios_syscards 
@pp_estacion = 'QAautomation', 
@pp_usuario = 'QAKevin', 
@pp_opcion     = 'PA', 
@pp_bgpay     = 'N', --si o no es BGPAY
@RUC                 = '0930482104001',
@NOMBRE_COMERCIAL    = 'COMERCIO KEVINZAMCO',
@MID                 = '9999930097',--Si es BGPAY no poner  -- si no es si hay que poner mid
@RAZON_SOCIAL        = 'COMERCIO KEVINZAMCO',
@MCC                 = '5411',
@DESC_GIRO           = 'HOSPITALES',
@TIPO_PERS           = 'N',
@PROVINCIA           = 'GUA',
@CIUDAD              = 'GYE',
@CALLE_PRINC         = 'JUNIN',
@NUM_DIREC           = '524',
@CALLE_SECUND        = 'CORDOVA',
@SECTOR              = 'ROCAFUERTE',
@BARRIO              = 'CENTRO',
@TELEFONO1           = '0957770969',
@CELULAR             = '0957770969',
@E_MAIL              = 'test@test.com',
@NOM_PROP            = 'Kevin Zambrano',
@IDENT_PROP          = '0930482104',
@REPRES_LEGAL        = 'Kevin Zambrano',
@IDENT_REPRES        = '0930482104',
@BCO_PAGADOR   = '00017',
@TIPO_DE_CUENTA   = '02',
@NUMERO_DE_CUENTA  = '0046501395',
@TIP_IDENT_TIT_CTA  = 'C',
@IDENT_TIT_CTA   = '',
@TITULAR_CTA   = '',
@BOT_CAL    = 'S',
@OFAC_CAL    = '000',
@BOT_POLITICAS   = '',
@CODIGO_RET_IVA ='R70',
@CODIGO_RET_FUENTE = 'R01'
`;

export const crearComercio2 = `
select top(1) co_comercio from nts_tarjcred.dbo.tc_comercios where co_ruc =@ruc order by co_fchapertura desc
`;

export const activarRUC = `
 
	UPDATE [BG_TComercios].[Pagos].[SRI_ESTABLECIMIENTOS_BG]

	SET 

		ESTADO_CONTRIBUYENTE = 'ACTIVO',

		FECHA_INICIO_ACT = '2024-02-10', -- formato YYYY-MM-DD

		FANTASIA_COMERCIAL = 'kEVIN ZAMBRANO TEST',

		RAZON_SOCIAL = 'kEVIN ZAMBRANO TEST SA',

		PROVINCIA = 'GUAYAS',

		CANTON = 'GUAYAQUIL'

	WHERE NUMERO_RUC = @ruc
 
 
 
 

`;

export const desactivarRUC = `
 
	UPDATE [BG_TComercios].[Pagos].[SRI_ESTABLECIMIENTOS_BG]

	SET 

		ESTADO_CONTRIBUYENTE = 'SUSPENDIDO',

		FECHA_INICIO_ACT = '2024-02-10', -- formato YYYY-MM-DD

		FANTASIA_COMERCIAL = 'kEVIN ZAMBRANO TEST',

		RAZON_SOCIAL = 'kEVIN ZAMBRANO TEST SA',

		PROVINCIA = 'GUAYAS',

		CANTON = 'GUAYAQUIL'

	WHERE NUMERO_RUC = @ruc

`;

export const inactivarComLdP = `
 
update BG_TComercios.Pagos.lp_comercios set co_estado = 'I' where co_ruc=@ruc

`;

export const activarComLdP = `
 
update BG_TComercios.Pagos.lp_comercios set co_estado = 'A' where co_ruc=@ruc

`;

export const cambiaEstadoLdPPR = `
 
update BG_TComercios.Pagos.lp_comercios set   co_estado= 'X'where co_comercio_syscard in (select co_comercio from nts_tarjcred.dbo.tc_comercios where co_ruc = @ruc)

`;

export const consultaOpcionesLI = `
 
SELECT TOP 1 co_ruc 
      FROM BG_TComercios.Pagos.lp_comercios
      where co_estado = 'A'
	order by co_fch_creacion desc
`;

export const consultaOpcionesII = `
 
SELECT TOP 1 co_ruc 
      FROM BG_TComercios.Pagos.lp_comercios
      where co_estado = 'I'
	order by co_fch_creacion desc
`;

export const consultaOpcionesPR = `
 
SELECT  cosys.co_ruc
      FROM BG_TComercios.Pagos.lp_comercios as colin
      inner join nts_tarjcred.dbo.tc_comercios as cosys on cosys.co_comercio =colin.co_comercio_syscard and cosys.co_ruc =colin.co_ruc
      where colin.co_estado = 'X' and cosys.co_estado ='A' 
        order by colin.co_fch_creacion desc
      	
`;

export const inactivarCta = `
BEGIN
  UPDATE bg_admin.t_ahmaest
  SET MSSTAT = '1'
  WHERE TRIM(MSCDID) = :cedula;

  UPDATE bg_admin.t_maestro  
  SET MTSTATUS = '1'
  WHERE TRIM(MTRUCCED) = :cedula;
END;
`;

export const activarCta = `
BEGIN
  UPDATE bg_admin.t_ahmaest
  SET MSSTAT = '0'
  WHERE TRIM(MSCDID) = :cedula;

  UPDATE bg_admin.t_maestro  
  SET MTSTATUS = '0'
  WHERE TRIM(MTRUCCED) = :cedula;
END;
`;

export const consultarCtaXced = `
SELECT COALESCE(
    (SELECT MSCTA, 'A' 
     FROM bg_admin.t_ahmaest 
     WHERE TRIM(MSCDID) = :cedula 
     FETCH FIRST 1 ROWS ONLY),
    
    (SELECT MTCUENTA 
     FROM bg_admin.t_maestro 
     WHERE TRIM(MTRUCCED) = :cedula 
     FETCH FIRST 1 ROWS ONLY)
) AS CUENTA
FROM dual
`;

export const comerciosAEnatural = `
--ruc para opciones AE
select top 1 sr.NUMERO_RUC as co_ruc from BG_TComercios.Pagos.SRI_ESTABLECIMIENTOS_BG SR
left join nts_tarjcred.dbo.tc_comercios co on sr.NUMERO_RUC=co.co_ruc
left join BG_TComercios.Pagos.lp_comercios lp on co.co_comercio=lp.co_comercio_syscard
Where sr.TIPO_CONTRIBUYENTE='PERSONAS NATURALES' 
and sr. ESTADO_CONTRIBUYENTE='ACTIVO'
and sr.FANTASIA_COMERCIAL is not null
and sr.RAZON_SOCIAL is not null
and co.co_ruc is null
and sr.NUMERO_RUC NOT IN (
    SELECT co_ruc
    FROM nts_tarjcred.dbo.tc_comercios
    WHERE co_linkPagos IN ('X', 'S')
)
 
`;

export const comerciosAEjuridico = `
--ruc para opciones AE
select top 1 sr.NUMERO_RUC as co_ruc from BG_TComercios.Pagos.SRI_ESTABLECIMIENTOS_BG SR
left join nts_tarjcred.dbo.tc_comercios co on sr.NUMERO_RUC=co.co_ruc
left join BG_TComercios.Pagos.lp_comercios lp on co.co_comercio=lp.co_comercio_syscard
Where sr.TIPO_CONTRIBUYENTE='SOCIEDADES' 
and sr. ESTADO_CONTRIBUYENTE='ACTIVO'
and sr.FANTASIA_COMERCIAL is not null
and sr.RAZON_SOCIAL is not null
and co.co_ruc is null
and sr.NUMERO_RUC NOT IN (
    SELECT co_ruc
    FROM nts_tarjcred.dbo.tc_comercios
    WHERE co_linkPagos IN ('X', 'S')
)
 
`;

export const comerciosACnatural = `
select top 1 sr.NUMERO_RUC as co_ruc from BG_TComercios.Pagos.SRI_ESTABLECIMIENTOS_BG SR
left join nts_tarjcred.dbo.tc_comercios co on sr.NUMERO_RUC=co.co_ruc
left join BG_TComercios.Pagos.lp_comercios lp on co.co_comercio=lp.co_comercio_syscard
Where sr.TIPO_CONTRIBUYENTE='PERSONAS NATURALES' 
and sr. ESTADO_CONTRIBUYENTE='ACTIVO'
and sr.FANTASIA_COMERCIAL is not null
and sr.RAZON_SOCIAL is not null
and co.co_ruc is not null
AND co.co_estado != 'I'
and sr.NUMERO_RUC NOT IN (
    SELECT co_ruc
    FROM nts_tarjcred.dbo.tc_comercios
    WHERE co_linkPagos IN ('X', 'S')
)
 
`;

export const comerciosACjuridico = `
select top 1 sr.NUMERO_RUC as co_ruc from BG_TComercios.Pagos.SRI_ESTABLECIMIENTOS_BG SR
left join nts_tarjcred.dbo.tc_comercios co on sr.NUMERO_RUC=co.co_ruc
left join BG_TComercios.Pagos.lp_comercios lp on co.co_comercio=lp.co_comercio_syscard
Where sr.TIPO_CONTRIBUYENTE='SOCIEDADES' 
and sr. ESTADO_CONTRIBUYENTE='ACTIVO'
and sr.FANTASIA_COMERCIAL is not null
and sr.RAZON_SOCIAL is not null
and co.co_ruc is not null
AND co.co_estado != 'I'
and sr.NUMERO_RUC NOT IN (
    SELECT co_ruc
    FROM nts_tarjcred.dbo.tc_comercios
    WHERE co_linkPagos IN ('X', 'S')
)
 
`;

export const noSRIniLDP = `
select top 1 co.co_ruc from nts_tarjcred.dbo.tc_comercios as co left join BG_TComercios.Pagos.lp_comercios as lp on co.co_ruc=lp.co_ruc left join BG_TComercios.Pagos.SRI_ESTABLECIMIENTOS_BG as sr on co.co_ruc=sr.NUMERO_RUC where lp.co_ruc is null and sr.NUMERO_RUC is null order by co.co_fchapertura desc
 
`;

export const repLegalesRUC = `
SELECT IDENTIFICACION FROM [BG_MasterData].[Empresas].BG_TB_Administradores_Representantes where RUC_COMPANIA=@ruc
 
`;

export const LdPDisponibilidad = `

select top 1 sr.NUMERO_RUC as co_ruc from BG_TComercios.Pagos.SRI_ESTABLECIMIENTOS_BG SR
left join BG_TComercios.Pagos.lp_actividades ac on sr.CODIGO_CIIU=ac.ac_codigo_actividad
left join nts_tarjcred.dbo.tc_comercios co on sr.NUMERO_RUC=co.co_ruc
left join BG_TComercios.Pagos.lp_comercios lp on co.co_comercio=lp.co_comercio_syscard
Where sr.TIPO_CONTRIBUYENTE='PERSONAS NATURALES' 
and sr. ESTADO_CONTRIBUYENTE='ACTIVO'
and sr.FANTASIA_COMERCIAL is not null
and sr.RAZON_SOCIAL is not null
and co.co_ruc is null
and ac.ac_codigo_actividad is null
and sr.NUMERO_RUC NOT IN (
    SELECT co_ruc
    FROM nts_tarjcred.dbo.tc_comercios
    WHERE co_linkPagos IN ('X', 'S')
)
`

export const LdPnoActivo = `
select top 1 sr.NUMERO_RUC as co_ruc from BG_TComercios.Pagos.SRI_ESTABLECIMIENTOS_BG SR
left join nts_tarjcred.dbo.tc_comercios co on sr.NUMERO_RUC=co.co_ruc
left join BG_TComercios.Pagos.lp_comercios lp on co.co_comercio=lp.co_comercio_syscard
Where sr.TIPO_CONTRIBUYENTE='PERSONAS NATURALES' 
and sr.ESTADO_CONTRIBUYENTE!='ACTIVO'
and sr.FANTASIA_COMERCIAL is not null
and sr.RAZON_SOCIAL is not null
and co.co_ruc is null
and sr.NUMERO_RUC NOT IN (
    SELECT co_ruc
    FROM nts_tarjcred.dbo.tc_comercios
    WHERE co_linkPagos IN ('X', 'S')
)
`
export const borrarXcodComercio = `
SET NOCOUNT ON;

DECLARE @ruc VARCHAR(13) = '0954121646001';

IF OBJECT_ID('tempdb..#comerciosLista') IS NOT NULL
    DROP TABLE #comerciosLista;

-- Obtener todos los comercios del RUC
SELECT co_comercio 
INTO #comerciosLista
FROM nts_tarjcred.dbo.tc_comercios
WHERE co_ruc = @ruc;

-- Validación
IF NOT EXISTS (SELECT 1 FROM #comerciosLista)
BEGIN
    PRINT 'No existen comercios para este RUC';
    RETURN;
END;

BEGIN TRY
    BEGIN TRAN;

    -- =========================
    -- LINK DE PAGOS
    -- =========================
    DELETE L
    FROM BG_TComercios.Pagos.lp_links L
    INNER JOIN #comerciosLista C ON C.co_comercio = L.ln_ruc;

    DELETE LL
    FROM BG_TComercios.Pagos.lp_links_logs LL
    INNER JOIN #comerciosLista C ON C.co_comercio = LL.lg_ruc;

    DELETE LIM
    FROM BG_TComercios.Pagos.lp_limites LIM
    INNER JOIN #comerciosLista C ON C.co_comercio = LIM.lt_comercio;

    DELETE C2
    FROM BG_TComercios.Pagos.lp_comercios C2
    INNER JOIN #comerciosLista C ON C.co_comercio = C2.co_comercio_syscard;

    -- =========================
    -- SYS CARD
    -- =========================
    DELETE T
    FROM nts_clientes.dbo.cl_telefonos T
    INNER JOIN #comerciosLista C ON C.co_comercio = T.tf_codigo;

    DELETE TH
    FROM nts_tarjcred.dbo.tc_transacciones_hist TH
    INNER JOIN #comerciosLista C ON C.co_comercio = TH.th_comercio;

    DELETE TN
    FROM nts_tarjcred.dbo.tc_transacciones TN
    INNER JOIN #comerciosLista C ON C.co_comercio = TN.tn_comercio;

    DELETE LD
    FROM nts_tarjcred.dbo.tc_cliquidadiaria LD
    INNER JOIN #comerciosLista C ON C.co_comercio = LD.ld_comercio;

    DELETE LH
    FROM nts_tarjcred.dbo.tc_cliquidahistoria LH
    INNER JOIN #comerciosLista C ON C.co_comercio = LH.lh_comercio;

    DELETE RD
    FROM nts_tarjcred.dbo.tc_cliquidadepositados RD
    INNER JOIN #comerciosLista C ON C.co_comercio = RD.rd_comercio;

    DELETE DI
    FROM nts_tarjcred.dbo.tc_tdiferidos DI
    INNER JOIN #comerciosLista C ON C.co_comercio = DI.di_comercio;

    DELETE CD
    FROM nts_tarjcred.dbo.tc_tcomerdiferi CD
    INNER JOIN #comerciosLista C ON C.co_comercio = CD.cd_comercio;

    DELETE FP
    FROM nts_tarjcred.dbo.tc_cfechapagos FP
    INNER JOIN #comerciosLista C ON C.co_comercio = FP.fp_comercio;

    DELETE LP
    FROM nts_tarjcred.dbo.tc_comercioslimitepiso LP
    INNER JOIN #comerciosLista C ON C.co_comercio = LP.lp_comercio;

    DELETE CM
    FROM nts_tarjcred.dbo.tc_comercio_marca CM
    INNER JOIN #comerciosLista C ON C.co_comercio = CM.cm_comercio;

    DELETE CA
    FROM nts_tarjcred.dbo.tc_comercios_alternos CA
    INNER JOIN #comerciosLista C ON C.co_comercio = CA.ca_comercio;

    DELETE CAF
    FROM nts_tarjcred.dbo.tc_cafiliaciones CAF
    INNER JOIN #comerciosLista C ON C.co_comercio = CAF.ca_comercio;

    DELETE CE
    FROM nts_tarjcred.dbo.tc_comercio_empresa CE
    INNER JOIN #comerciosLista C ON C.co_comercio = CE.ce_comercio;

    -- FINAL (tabla padre)
    DELETE TC
    FROM nts_tarjcred.dbo.tc_comercios TC
    INNER JOIN #comerciosLista C ON C.co_comercio = TC.co_comercio;

    COMMIT;

    PRINT 'Eliminación completa para todos los comercios del RUC';

END TRY
BEGIN CATCH
    ROLLBACK;
    PRINT ERROR_MESSAGE();
END CATCH;
`