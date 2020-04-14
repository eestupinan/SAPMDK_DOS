import libVal from '../../Common/Library/ValidationLibrary';
export default function OperationsListViewCaption(context) {
    let queryOption = libVal.evalIsEmpty(context.actionResults.filterResult) ? '' : context.actionResults.filterResult.data.filter;
    let totalCountPromise = context.count('/SAPAssetManager/Services/AssetManager.service','MyWorkOrderOperations', '');
    let countPromise = context.count('/SAPAssetManager/Services/AssetManager.service','MyWorkOrderOperations',queryOption);
    var params = [];
    return Promise.all([totalCountPromise, countPromise]).then(function(resultsArray) {
        let totalCount = resultsArray[0];
        let count = resultsArray[1];
        params.push(count);
        params.push(totalCount);
        if (count === totalCount) {
            return context.setCaption(context.localizeText('operations_x', [totalCount]));
        }
        return context.setCaption(context.localizeText('operations_x_x', params));
    });
}
