export default function DescServCliente(context) {
	return context.read('/SAPAssetManager/Services/AssetManager.service', "MyWorkOrderSales('" + context.getPageProxy().binding.OrderId + "')", [], '$select=ProductDesc').then(function(result) {
        return result.getItem(0).ProductDesc;
    });
}