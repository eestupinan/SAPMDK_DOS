export default function PageForm1ZUserStatus_QueryOptions(context) {

	return context.read('/SAPAssetManager/Services/AssetManager.service', "ZZUserStatuses", [],
		"$filter=OrderId eq '" + context.getPageProxy().binding.OrderId + "'&$select=UserStatus,Status,StatusProfile,UserStatusText").then(function (result) {

		let aData = [];

		if (result) {
			if (result.length > 0) {
				let WOUserStatus = "";
			
				for (var i = 0; i < result.length; i++) {

					WOUserStatus = result.getItem(i);

					aData.push({
						"ReturnValue": WOUserStatus.Status + "/" + WOUserStatus.UserStatus,
						"DisplayValue": WOUserStatus.UserStatusText
					});

					WOUserStatus = "";

				}
			}
		}
		return aData;

	});

}