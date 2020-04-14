import libWOStatus from '../MobileStatus/WorkOrderMobileStatusLibrary';
import libCommon from '../../Common/Library/CommonLibrary';
// Hide the action bar based on status of the Work Order and send the flag indicating if the items are visible or not
export default function WorkOrderDetailsOnPageLoad(context) {
    let currentReadLink = libCommon.getTargetPathValue(context, '#Property:@odata.readLink');
    let isLocal = libCommon.isCurrentReadLinkLocal(currentReadLink);
    if (!isLocal) {
        return libWOStatus.isOrderComplete(context).then(status => {
            if (status) {
                context.setActionBarItemVisible(0, false);
                context.setActionBarItemVisible(1, false);
                return true;
            }
            return false;
        });
    }
    return Promise.resolve(false);

}

