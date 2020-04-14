export default class PagesConfigurationLibrary {
	constructor() {
		this.conf = {
			"pageTestForm1" : {
				"lstPickStatus" : { 
					"container" : 'frmContResODS',
					"mandatory" : true,
					"visible" : true,
					"editable": true,
					"fieldDescription": "Estatus de usuario",
					"value" : ""
				},
				"lstPickAnomalias" : {
					"container" : 'frmContResODS',
					"mandatory" : false,
					"visible" : false,
					"editable": false,
					"fieldDescription": "Anomalias",
					"value" : ""
				},
				"lstPickTipoLectura" : {
					"container" : 'frmContResODS',
					"mandatory" : false,
					"visible" : false,
					"editable": false,
					"fieldDescription": "Tipo de Lectura",
					"value" : ""
				},
				"txtLectura" : {
					"container" : 'frmContResODS',
					"mandatory" : false,
					"visible" : false,
					"editable": false,
					"fieldDescription": "Lectura",
					"value" : ""
				},
				"lstPickTipoCorte" : {
					"container" : 'frmContResODS',
					"mandatory" : false,
					"visible" : false,
					"editable": false,
					"fieldDescription": "Tipo de Corte",
					"value" : ""
				},
				"swInstalacion" : {
					"container" : 'frmContResODS',
					"mandatory" : false,
					"visible" : false,
					"editable": false,
					"fieldDescription": "Instalación/Sustitución",
					"value" : ""
				},
				"lstPagadores": {
					"container" : 'frmContResODS',
					"mandatory" : false,
					"visible" : false,
					"editable": false,
					"fieldDescription": "Pagadores",
					"value" : ""
				},
				"lstPickVinculo": {
					"container" : 'frmContResODS',
					"mandatory" : false,
					"visible" : false,
					"editable": false,
					"fieldDescription": "Vínculo",
					"value" : ""
				},
				"txtCelular": {
					"container" : 'frmContResODS',
					"mandatory" : false,
					"visible" : false,
					"editable": false,
					"fieldDescription": "Celular",
					"value" : ""
				},
				"txtEmail" : {
					"container" : 'frmContResODS',
					"mandatory" : false,
					"visible" : false,
					"editable": false,
					"fieldDescription": "Email",
					"value" : ""
				},
				"txtFirma" : {
					"container" : 'frmContResODS',
					"mandatory" : false,
					"visible" : false,
					"editable": false,
					"fieldDescription": "Firma",
					"value" : ""
				}
			},
			"pageTestForm2": {
				"lstPickMotivosSustitucion" : {
					"container" : 'frmContSust',
					"mandatory" : false,
					"visible" : false,
					"editable": false,
					"fieldDescription": "Motivo de Instalación/Sustitución",
					"value" : ""
				},
				"lstPickDestinosMedidor" :   {
					"container" : 'frmContSust',
					"mandatory" : false,
					"visible" : false,
					"editable": false,
					"fieldDescription": "Destino del medidor",
					"value" : ""
				},
				"dtPickFecLab" :   {
					"container" : 'frmContSust',
					"mandatory" : false,
					"visible" : false,
					"editable": false,
					"fieldDescription": "Fecha Laboratorio",
					"value" : ""
				},
				"txPrecTula" :   {
					"container" : 'frmContSust',
					"mandatory" : false,
					"visible" : false,
					"editable": false,
					"fieldDescription": "N° Precinto Tula",
					"value" : ""
				},
				"lstPickMedidores" :   {
					"container" : 'frmContSust',
					"mandatory" : false,
					"visible" : false,
					"editable": false,
					"fieldDescription": "Marque el medidor a sustituir",
					"value" : ""
				},
				"txtNumSerie" :   {
					"container" : 'frmContSust',
					"mandatory" : false,
					"visible" : false,
					"editable": false,
					"fieldDescription": "Registre el medidor a Instalar / Sustituir",
					"value" : ""
				},
				"txtMaterial" :   {
					"container" : 'frmContSust',
					"mandatory" : false,
					"visible" : false,
					"editable": false,
					"fieldDescription": "Registre las lecturas" ,
					"value" : ""
				}
			},
				"pageTestForm7a": {
				"txtSerActCepo" : {
					"container" : 'FormCellContainer0',
					"mandatory" : true,
					"visible" : true,
					"editable": false,
					"fieldDescription": "Serie Actual"
				},
				"txtEstActCepo" :   {
					"container" : 'FormCellContainer0',
					"mandatory" : true,
					"visible" : true,
					"editable": false,
					"fieldDescription": "Estado Actual"
				},
				"txtSerNewCepo" :   {
					"container" : 'FormCellContainer0',
					"mandatory" : true,
					"visible" : true,
					"editable": true,
					"fieldDescription": "Serie Nuevo Precinto"
				},
				"txtSerActVisor" :   {
					"container" : 'FormCellContainer0',
					"mandatory" : true,
					"visible" : true,
					"editable": false,
					"fieldDescription": "Serie Actual Visualizador"
				},
				"txtEstActVisor" :   {
					"container" : 'FormCellContainer0',
					"mandatory" : true,
					"visible" : true,
					"editable": false,
					"fieldDescription": "Estado Actual Visualizador"
				},
				"txtSerNewVisor" :   {
					"container" : 'FormCellContainer0',
					"mandatory" : true,
					"visible" : true,
					"editable": true,
					"fieldDescription": "Serie Nuevo Visualizador"
				},
				"txtSerActConector" :   {
					"container" : 'FormCellContainer0',
					"mandatory" : true,
					"visible" : true,
					"editable": false,
					"fieldDescription": "Serie Actual Contenedor"
				},
				"txtEstActConector" :   {
					"container" : 'FormCellContainer0',
					"mandatory" : true,
					"visible" : true,
					"editable": false,
					"fieldDescription": "Estado Actual Contenedor"
				},
				"txtSerNewConector" :   {
					"container" : 'FormCellContainer0',
					"mandatory" : true,
					"visible" : true,
					"editable": true,
					"fieldDescription": "Serie Nuevo Contenedor"
				},
				"txtSerActRegulador" :   {
					"container" : 'FormCellContainer0',
					"mandatory" : true,
					"visible" : true,
					"editable": false,
					"fieldDescription": "Serie Actual Regulador"
				},
				"txtEstActRegulador" :   {
					"container" : 'FormCellContainer0',
					"mandatory" : true,
					"visible" : true,
					"editable": false,
					"fieldDescription": "Estado Actual Regulador"
				},
				"txtSerNewRegulador" :   {
					"container" : 'FormCellContainer0',
					"mandatory" : true,
					"visible" : true,
					"editable": true,
					"fieldDescription": "Serie Nuevo Regulador"
				}
			}
		};
	}
}