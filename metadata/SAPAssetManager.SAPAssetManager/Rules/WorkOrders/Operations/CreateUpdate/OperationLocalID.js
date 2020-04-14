import GenerateLocalID from '../../../Common/GenerateLocalID';
import libCommon from '../../../Common/Library/CommonLibrary';

export default function OperationLocalID(context) {
    let onWoChangeset = libCommon.isOnWOChangeset(context);
    let entitySet = '';

    if (onWoChangeset) {
        return 'L001';
    }

    if (context.binding.OperationNo) {
        return context.binding.OperationNo;
    }

    if (!libCommon.isDefined(context.binding['@odata.readLink'])) {
        entitySet = 'MyWorkOrderOperations';
    } else {
        entitySet = context.binding['@odata.readLink'] + '/Operations';
    }
    
    let LocalId = GenerateLocalID(context, entitySet, 'OperationNo', '000', "$filter=startswith(OperationNo, 'L') eq true", 'L');
    return LocalId;
}
