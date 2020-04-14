import libNotifMobile from './NotificationMobileStatusLibrary';
import libMobile from '../../MobileStatus/MobileStatusLibrary';
import libCommon from '../../Common/Library/CommonLibrary';

export default function NotificationEnableMobileStatus(context) {
    let currentReadLink = libCommon.getTargetPathValue(context, '#Property:@odata.readLink');
    let isLocal = libCommon.isCurrentReadLinkLocal(currentReadLink);
    if (!isLocal) {
        var received = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue());
        var started = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
        var complete = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
        let pageProxy = context;
        if (typeof context.getPageProxy === 'function') {
            pageProxy = context.getPageProxy();
        }        
        return libMobile.mobileStatus(context, pageProxy.binding).then(mobileStatus => {
            if (mobileStatus === received) {
                return true;
            } else if (mobileStatus === started) {
                // check if all task completed
                return libNotifMobile.isAllTasksComplete(context).then(allTasksComplete => {
                    if (allTasksComplete) {
                        return libNotifMobile.isAllItemTasksComplete(context).then(allItemTasksComplete => {
                            if (allItemTasksComplete) {
                                return true;
                            }
                            return false;
                        });
                    } 
                    return false;
                });
            } else if (mobileStatus === complete) {
                return false;
            } else {
                return false;
            }
        });
    } else {
        return false;
    }
}
