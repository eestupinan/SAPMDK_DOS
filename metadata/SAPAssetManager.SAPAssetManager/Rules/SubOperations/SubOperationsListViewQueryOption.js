export default function SubOperationsListViewQueryOption(context) {
    let binding = context.binding;
	let odataType = binding['@odata.type']; 
	if (odataType === '#sap_mobile.MyWorkOrderOperation') {
		return '$expand=MobileStatus,SubOperationLongText,WorkOrderOperation,WorkOrderOperation/WOHeader,WorkOrderOperation/MobileStatus&$orderby=OrderId,OperationNo,SubOperationNo';
	} else {
		return '$expand=MobileStatus,SubOperationLongText,WorkOrderOperation,WorkOrderOperation/WOHeader,WorkOrderOperation/MobileStatus&$orderby=OrderId,OperationNo,SubOperationNo';
	}
}
