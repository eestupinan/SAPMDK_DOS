import {TimeSheetLibrary as libTS} from '../../TimeSheetLibrary';

export default function TimeSheetEntryCreateUpdateSubOperationUpdate(controlProxy) {
    let pageProxy = controlProxy.getPageProxy();
    let selection = controlProxy.getValue()[0] ? controlProxy.getValue()[0].ReturnValue : '';

    return getWorkCenterFromSubOperation(pageProxy, selection).then(newWorkCenter => {
        if (newWorkCenter) {
            return libTS.updateWorkCenter(pageProxy, newWorkCenter);
        }
        return '';
    }); 
}


function getWorkCenterFromSubOperation(context, subOperationReadLink) {
    return context.read('/SAPAssetManager/Services/AssetManager.service', subOperationReadLink, [], '').then(result => {
        if (result && result.getItem(0)) {
            return result.getItem(0).MainWorkCenter;
        }
        return undefined;
    });
}
