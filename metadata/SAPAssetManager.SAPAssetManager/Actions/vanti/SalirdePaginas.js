export default function SalirdePaginas(context) {
	return context.executeAction('/SAPAssetManager/Actions/Page/ClosePage.action').then(() => {
		return context.executeAction('/SAPAssetManager/Actions/Page/ClosePage.action').then(() => {
			return context.executeAction('/SAPAssetManager/Actions/Page/ClosePage.action').then(() => {
				return context.executeAction('/SAPAssetManager/Actions/Page/ClosePage.action').then(() => {
					return context.executeAction('/SAPAssetManager/Actions/Page/ClosePage.action').then(() => {
						return context.executeAction('/SAPAssetManager/Actions/Page/ClosePage.action').then(() => {
							return context.executeAction('/SAPAssetManager/Actions/Page/ClosePage.action').then(() => {
								return context.executeAction('/SAPAssetManager/Actions/Page/ClosePage.action');
							});
						});
					});
				});
			});
		});
	});
}