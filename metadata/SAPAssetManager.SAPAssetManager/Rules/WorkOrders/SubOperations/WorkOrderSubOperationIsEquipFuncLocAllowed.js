import { PrivateMethodLibrary as libPrivate } from '../../SubOperations/SubOperationLibrary';

export default function WorkOrderSubOperationIsEquipFuncLocAllowed(pageProxy) {
    let parentWorkOrderPromise = libPrivate._getParentWorkOrder(pageProxy);
    return parentWorkOrderPromise.then(parentWorkOrder => {
        return pageProxy.read('/SAPAssetManager/Services/AssetManager.service', 'OrderTypes', [], `$filter=OrderType eq '${parentWorkOrder.OrderType}'`)
        .then(function(myOrderTypes) {
            let record = myOrderTypes.getItem(0);
            return record.ObjectListAssignment === '';
        });
    });
}
