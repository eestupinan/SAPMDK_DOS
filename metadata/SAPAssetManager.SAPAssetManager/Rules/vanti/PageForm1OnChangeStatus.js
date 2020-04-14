import libPagesConf from './PagesConfigurationLibrary';
import PageFields from './PageFields';
import Logger from '../Log/Logger';
export default function PageForm1OnChangeStatus(context) {

//Bindea Anomalias
	try {
		var aPages = [
			"pageTestForm1", 
			"pageTestForm2"
		];

		let formCellContainer = context.getPageProxy().getControl('frmContResODS');
		let cmbStatus = formCellContainer.getControl('lstPickStatus');
		let cmbAnomalias = formCellContainer.getControl('lstPickAnomalias');

		var anomSpecifier = cmbAnomalias.getTargetSpecifier();
		var sStatusValue = cmbStatus.getValue()[0].ReturnValue;
		var aStatusValue = sStatusValue.split("/");
		
		anomSpecifier.setQueryOptions("$filter=OrderId eq '" + context.getPageProxy().binding.OrderId + "' and StatusUsr eq '" + aStatusValue[0] + "'");
			
		cmbAnomalias.setTargetSpecifier(anomSpecifier);
	
		//setea editables y visibles los campos segun parametrización
		var oPages = new libPagesConf();
		context.getPageProxy().binding.sUserStatus = sStatusValue;
        context.getPageProxy().binding.oPages = oPages.conf;
            
		//var pageFields = new PageFields();
		aPages.forEach(pageName => {
			PageFields.getFieldProperties(context, pageName, context.getPageProxy().binding.WOHeader.MaintenanceActivityType , aStatusValue[1]);
		});

		cmbAnomalias.redraw();
	} catch (err) {
		/**Implementing our Logger class*/
		Logger.error(context.getPageProxy().getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(),
			`updateOrderType Error: ${err}`);
	}
}