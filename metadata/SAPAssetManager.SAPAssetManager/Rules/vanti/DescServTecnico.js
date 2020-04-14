export default function DescServTecnico(context) {
	return context.read('/SAPAssetManager/Services/AssetManager.service', "MyWorkOrderSales('" + context.getPageProxy().binding.OrderId + "')", [], '$select=ServiceProduct').then(function(result) {
        return result.getItem(0).ServiceProduct;
    });
}