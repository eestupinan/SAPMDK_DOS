import libCommon from '../../Common/Library/CommonLibrary';
export default function IsOperationType4orMRS(context) {
    if (libCommon.getWorkOrderAssignmentType(context)!=='4' && libCommon.getWorkOrderAssignmentType(context)!=='A') {
        return true;
    } else {
        return false;
    }
}
