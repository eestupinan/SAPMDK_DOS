import libCommon from '../../Common/Library/CommonLibrary';
import { PrivateMethodLibrary as libPrivate } from './WorkOrderOperationLibrary';

export default function WorkOrderOperationIsEquipFuncLocAllowed(pageProxy) {
    let onWOChangeSet = libCommon.isOnWOChangeset(pageProxy);
    let parentWorkOrderPromise = libPrivate._getParentWorkOrder(pageProxy, onWOChangeSet);
    return parentWorkOrderPromise.then(parentWorkOrder => {
        return pageProxy.read('/SAPAssetManager/Services/AssetManager.service', 'OrderTypes', [], `$filter=OrderType eq '${parentWorkOrder.OrderType}'`)
        .then(function(myOrderTypes) {
            let record = myOrderTypes.getItem(0);
            return record.ObjectListAssignment === '';
        });
    });
}
