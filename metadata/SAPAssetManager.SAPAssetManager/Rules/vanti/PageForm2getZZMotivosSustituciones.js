export default function PageForm2getZZMotivosSustituciones(context) {

	return context.read('/SAPAssetManager/Services/AssetManager.service', "ZZMotivosSustituciones", [], "").then(function (result) {

		let aData = [];

		if (result) {
			if (result.length > 0) {
				let WOMotivosSustituciones = "";
			
				for (var i = 0; i < result.length; i++) {

					WOMotivosSustituciones = result.getItem(i);

					aData.push({
						"ReturnValue": WOMotivosSustituciones.Codigo,
						"DisplayValue": WOMotivosSustituciones.Descripcion
					});

					WOMotivosSustituciones = "";

				}
			}
		}
		return aData;

	});

}