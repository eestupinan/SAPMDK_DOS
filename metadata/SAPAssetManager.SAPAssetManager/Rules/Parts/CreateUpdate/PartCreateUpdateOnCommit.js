import CommonLib from '../../Common/Library/CommonLibrary';
import ValidationLib from '../../Common/Library/ValidationLibrary';
import partLib from '../PartLibrary';

export default function PartCreateUpdateOnCommit(context) {
    if (!context) {
        throw new TypeError('Context can\'t be null or undefined');
    }
    if (CommonLib.IsOnCreate(context)) {
         context.executeAction('/SAPAssetManager/Actions/Parts/PartCreate.action');
    } else {
        let operationNumber = partLib.partCreateUpdateSetODataValue(context, 'OperationNo');
        if (!ValidationLib.evalIsEmpty(operationNumber) && 
            !ValidationLib.evalIsEmpty(context.binding.OperationNo) && 
            !(operationNumber === context.binding.OperationNo)) {
            return context.executeAction('/SAPAssetManager/Actions/Parts/PartCreate.action').then(() => {
                   context.executeAction('/SAPAssetManager/Actions/Parts/PartDeleteOnChangedOperation.action');
            });
        } else {
            context.executeAction('/SAPAssetManager/Actions/Parts/PartUpdate.action');
        }
        
    }
}
