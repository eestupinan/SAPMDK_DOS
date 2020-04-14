import libMobile from '../../MobileStatus/MobileStatusLibrary';
import libCommon from '../../Common/Library/CommonLibrary';

export default function NotificationMobileStatusToolBarCaption(context) {
    let currentReadLink = libCommon.getTargetPathValue(context, '#Property:@odata.readLink');
    let isLocal = libCommon.isCurrentReadLinkLocal(currentReadLink);
    if (!isLocal) {
        var received = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue());
        var started = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
        var complete = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
        return libMobile.mobileStatus(context, context.binding).then(mobileStatus => {
            if (mobileStatus === received) {
                return context.localizeText('start_notification');
            } else if (mobileStatus === started) {
                return context.localizeText('complete_notification');
            } else if (mobileStatus === complete) {
                return context.localizeText('completed');
            } else {
                return context.localizeText('status');
            }
        });
    } else {
        return context.localizeText('start_notification');
    }
}
