import libCommon from '../../Common/Library/CommonLibrary';
import libWOStatus from '../../WorkOrders/MobileStatus/WorkOrderMobileStatusLibrary';

export function executeChangeSetAction(context) {
    libCommon.setOnCreateUpdateFlag(context, 'CREATE');
    libCommon.setOnChangesetFlag(context, true);
    libCommon.resetChangeSetActionCounter(context);
    //set the WoChangeSet flag to false
    libCommon.setOnWOChangesetFlag(context, false);
    return context.executeAction('/SAPAssetManager/Actions/Parts/PartCreateChangeSet.action');
}

/**
 * Can't add part to local job.
 * @param {*} context 
 */
export default function PartCreateNav(context) {
    let currentReadLink = libCommon.getTargetPathValue(context, '#Property:@odata.readLink');
    let isLocal = libCommon.isCurrentReadLinkLocal(currentReadLink);

    if (isLocal) {
        return executeChangeSetAction(context);
    } 
    return libWOStatus.isOrderComplete(context).then(status => {
        if (!status) {
            return executeChangeSetAction(context);
        }
        return '';
    });
}
