export default class PageFields {
	
	static getTecPageName(sPageName){
		
		var sTecPage = "";
		
		var aTecPages = [{ "page": "RESULTADO_ODS", "tecPage": "Open_form_1.action"},
						 { "page": "INST_SUST_MED", "tecPage": "Open_form_2.action"},
						 { "page": "IND_ODORIZACION", "tecPage": "Open_form_3.action"},
						 { "page": "INSP_CE_MEDICION", "tecPage": "Open_form_4.action"},
						 { "page": "REC_CARGA_INSTAL", "tecPage": "Open_form_5.action"},
						 { "page": "PRECINTOS", "tecPage": "Open_form_7a.action"}];
		
		for(var i = 0; i < aTecPages.length; i++){
			
			if(aTecPages[i].page === sPageName){
			   sTecPage = aTecPages[i].tecPage;
			   break;
			}
		}
		return sTecPage;
	}
	
	static goNextActionPage(oContext, sPageName ) {
		
		var that = this;
		
		var sPath = "";
		/*var oContResODS = oContext.getPageProxy().getControl('frmContResODS');
		var cmbStatus = oContResODS.getControl('lstPickStatus');*/
		
		//var sStatusValue = cmbStatus.getValue()[0].ReturnValue;
		var sStatusValue = oContext.getPageProxy().binding.sUserStatus;
		var aStatusValue = sStatusValue.split("/");
		
		var sActClas = oContext.getPageProxy().binding.WOHeader.MaintenanceActivityType;
		var sOrderType = oContext.getPageProxy().binding.WOHeader.OrderType;
		
		oContext.read('/SAPAssetManager/Services/AssetManager.service', "ZZFormParamss" +
		"(OrderId='"+oContext.getPageProxy().binding.OrderId+"',OrdesClass='"+sOrderType+"',ActivityClass='"+sActClas+"',UserStatus='"+aStatusValue[1]+"',CurrPage='"+sPageName+"')", [], "").then(function (result) {
		
			if(result){
				
				var sNextAction = that.getTecPageName(result.getItem(0).NextPage);
				
				if(sNextAction){
					sPath = "/SAPAssetManager/Actions/vanti/" + sNextAction;
				}else{
					//Llamar operaciones
					sPath = "/SAPAssetManager/Actions/vanti/Open_Operation_Details.action"; 
				}
				
				oContext.executeAction(sPath);
				
			}
			
		});
		
	}
	
	static getFieldProperties(oContext, sPageName, sActClas, sUserStat) {
		let that = this;
		oContext.read('/SAPAssetManager/Services/AssetManager.service', "ZZFieldParamss", [],
			"$filter=Page eq '" + sPageName + "' and Activ eq '" + sActClas + "' and UserStatus eq '" + sUserStat + "'").then(function (result) {
			let oBinding = oContext.getPageProxy().binding;
			for (let j = 0; j < result.length; j++) {
				let oResult = result.getItem(j);
				if (oBinding.oPages[sPageName][oResult.ComponentId]) {
					oBinding.oPages[sPageName][oResult.ComponentId].visible = oResult.Visible === 'X';
					oBinding.oPages[sPageName][oResult.ComponentId].editable = oResult.Editable === 'X';
					oBinding.oPages[sPageName][oResult.ComponentId].mandatory = oResult.Obligatorio === 'X';
				}
			}
			if(sPageName == "pageTestForm1")
				that.setFieldsProperties(oContext, "pageTestForm1");
		});
	}
	
	static setFieldsProperties(oContext, sPageName) {
		let oPage = oContext.getPageProxy().binding.oPages[sPageName];
		Object.keys(oPage).forEach(	oField => { 
			let formControl = oContext.getPageProxy().getControl(oPage[oField].container).getControl(oField);
			formControl.setVisible(oPage[oField].visible);
			formControl.setEditable(oPage[oField].editable);
		});
	}
	
	static saveValues(oContext, oField, sPageName, oControl){
		
		let oPage = oContext.getPageProxy().binding.oPages[sPageName];
		
		let type = oControl.getType();
		
		if(type.includes("ListPicker")){
			oPage[oField].value = oControl.getValue()[0].ReturnValue;
		}else if(type.includes("SimpleProperty") || type.includes("Switch") || type.includes("Note") ){
			oPage[oField].value = oControl.getValue();
		}
	}
	
	static checkRequiredFields(oContext, sPageName) {
		let oPage = oContext.getPageProxy().binding.oPages[sPageName];
		let sMsg = "";
		
		Object.keys(oPage).forEach(	oField => { 
			
			let oControl = oContext.getPageProxy().getControl(oPage[oField].container).getControl(oField);
			let type = oControl.getType();
			
			this.saveValues(oContext, oField, sPageName, oControl);
			
			if(oPage[oField].mandatory && !sMsg){
				
				//Obtener el valor del control segun sea su tipo
				if(type.includes("ListPicker")){
					
					if(oControl.getValue().length === 0){
						sMsg = oPage[oField].fieldDescription + " es un campo obligatorio" ;
					}
					
				}else if(type.includes("SimpleProperty") || type.includes("Switch") || type.includes("Note") ){
					
					if(!oControl.getValue()){
						sMsg = oPage[oField].fieldDescription + " es un campo obligatorio";
					}
					
				}
				
			}
		});
		
		return sMsg;
		
	}
}