
import GetDetailsNavQueryOption from '../Common/GetDetailsNavQueryOption';

export default function ErrorArchiveDetailsNav(context) {
    let binding = context.getPageProxy().getActionBinding();

    // Create an error object, and store the error's info into this object. And save this into ClientData
    let errorObject = {
        'Message': binding.Message,
        'RequestBody': binding.RequestBody,
        'RequestURL': binding.RequestURL,
        'HTTPStatusCode': binding.HTTPStatusCode,
    };
    context.getPageProxy().getClientData().ErrorObject = errorObject;

    let queryOption = GetDetailsNavQueryOption(binding.AffectedEntity['@odata.type']);

    return context.read('/SAPAssetManager/Services/AssetManager.service', binding.AffectedEntity['@odata.readLink'], [], queryOption).then(result => {
        if (result && result.length) {
            let resultItem = result.getItem(0);
            resultItem.ErrorObject = errorObject;
            context.getPageProxy().setActionBinding(resultItem);
            return context.getPageProxy().executeAction('/SAPAssetManager/Actions/ErrorArchive/ErrorArchiveDetails.action');
        } else {
            return Promise.resolve(false);
        }
    });

    // read the approriate entt
    //return libCommon.navigateOnRead(context.getPageProxy(), '/SAPAssetManager/Actions/ErrorArchive/ErrorArchiveDetails.action', binding.AffectedEntity['@odata.readLink'], queryOption);
}

