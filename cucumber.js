const common = {
  tags: process.env.npm_config_TAGS || "not @dep and not @mnt and not @blk",

  formatOptions: {
    snippetInterface: "async-await"
  },

  dryRun: false,

  require: [
    "src/test/*/steps/*.ts",
    "src/hooks/hooks.ts"
  ],

  color: true,

  requireModule: [
    "ts-node/register"
  ],

  format: [
    "progress-bar",
    "json:test-results/json/cucumber-report.json",
    "junit:test-results/xml/cucumber-report.xml"
  ]
};

module.exports = {

  default: {
    ...common,
    paths: [
      "src/test/pagosBE/features/*.feature",
      "src/test/portalComerciosBFC/features/*/*.feature",
      "src/test/afiliacionBE/features/v1-Opciones.feature",
      "src/test/autorizadorBFC/features/*.feature",
      "src/test/cobrosBFP/features/*.feature",
      "src/test/creditoComercioBFC/features/*.feature",
      "src/test/cobrosPortalPagosBFC/features/*.feature"
    ],

    format: [
      "progress-bar",
      "json:test-results/json/cucumber-report-default.json",
      "junit:test-results/xml/cucumber-report-default.xml",
      "html:test-results/html/Matriz de Regresion Tribu Comercios.html"
    ]
  },

  portalComerciosBFC: {
    ...common,

    paths: [
      "src/test/portalComerciosBFC/features/*/*.feature"
    ],

    format: [
      "progress-bar",
      "html:test-results/html/Matriz de Regresion Cobro Empresas.html",
      "json:test-results/json/cucumber-report-portalComerciosBFC.json",
      "junit:test-results/xml/cucumber-report-portalComerciosBFC.xml",
    ]
  },

  pagosBE: {
    ...common,

    paths: [
      "src/test/pagosBE/features/*.feature"
    ],

    format: [
      "progress-bar",
      "json:test-results/json/cucumber-report-pagosBE.json",
      "html:test-results/html/Matriz de Regresion pagosBE.html",
      "junit:test-results/xml/cucumber-report-pagosBE.xml",
    ]
  },cobrosPortalPagosBFC: {
    ...common,

    paths: [
      "src/test/cobrosPortalPagosBFC/features/*.feature"
    ],

    format: [
      "progress-bar",
      "json:test-results/json/cucumber-report-cobrosPortalPagosBFC.json",
      "html:test-results/html/Matriz de Regresion cobrosPortalPagosBFC.html",
      "junit:test-results/xml/cucumber-report-cobrosPortalPagosBFC.xml",
    ]
  },

  creditoComercioBFC: {
    ...common,

    paths: [
      "src/test/creditoComercioBFC/features/*.feature"
    ],

    format: [
      "progress-bar",
      "json:test-results/json/cucumber-report-creditoComercioBFC.json",
      "junit:test-results/xml/cucumber-report-creditoComercioBFC.xml",
      "html:test-results/html/Matriz de Regresion Creditos Comercios.html"
    ]
  },

  autorizadorBFC: {
    ...common,

    paths: [
      "src/test/autorizadorBFC/features/*.feature"
    ],

    format: [
      "progress-bar",
      "json:test-results/json/cucumber-report-autorizadorBFC.json",
      "junit:test-results/xml/cucumber-report-autorizadorBFC.xml",
      "html:test-results/html/Matriz de Regresion AutorizadorBFC.html"
    ]
  },

  rem: {
    ...common,

    paths: [
      "src/test/BcoDelBarrio/features/*.feature"
    ],

    format: [
      "progress-bar",
      "html:test-results/html/Matriz de Regresion Remesas.html",
      "json:test-results/json/cucumber-report-rem.json",
      "junit:test-results/xml/cucumber-report-rem.xml",
    ]
  },

  afiliacionBE: {
    ...common,

    paths: [
      "src/test/afiliacionBE/features/v1-Opciones.feature",
      "src/test/afiliacionBE/features/v2-LinkPago.feature"
    ],

    format: [
      "progress-bar",
      "html:test-results/html/Matriz de Regresion Afiliacion BE.html",
      "json:test-results/json/cucumber-report-afiliacionBE.json",
      "junit:test-results/xml/cucumber-report-afiliacionBE.xml",
    ]
  },

  cobrosBFP: {
    ...common,

    paths: [
      "src/test/cobrosBFP/features/*.feature"
    ],

    format: [
      "progress-bar",
      "html:test-results/html/Matriz de Regresion Cobros BFP.html",
      "json:test-results/json/cucumber-report-cobrosBFP.json",
      "junit:test-results/xml/cucumber-report-cobrosBFP.xml",
    ]
  }
};