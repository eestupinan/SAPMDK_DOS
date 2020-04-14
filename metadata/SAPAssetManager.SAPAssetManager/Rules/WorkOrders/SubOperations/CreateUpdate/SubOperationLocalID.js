import GenerateLocalID from '../../../Common/GenerateLocalID';
import { SubOperationControlLibrary as libSubOpControl } from '../../../SubOperations/SubOperationLibrary';

export default function SubOperationLocalID(context) {

    if (context.binding.SubOperationNo) {
        return context.binding.SubOperationNo;
    }
    let LocalId = '';    
    let readLink = '';
    if (context.binding['@odata.readLink'] !== undefined) {
        readLink = context.binding['@odata.readLink'];
    } else {
        readLink = libSubOpControl.getOperation(context);
    }
    LocalId = GenerateLocalID(context, readLink + '/SubOperations', 'SubOperationNo', '000', "$filter=startswith(SubOperationNo, 'L') eq true", 'L');

    return LocalId;
}
