import libCommon from '../Common/Library/CommonLibrary';
import Constants from '../Common/Library/ConstantsLibrary';
import libNotifStatus from './MobileStatus/NotificationMobileStatusLibrary';

export default function NotificationUpdateNav(context) {
    let currentReadLink = libCommon.getTargetPathValue(context, '#Property:@odata.readLink');
    let isLocal = libCommon.isCurrentReadLinkLocal(currentReadLink);
    if (!isLocal) {
        return libNotifStatus.isNotificationComplete(context).then(status => {
            if (!status) {
                libCommon.setOnCreateUpdateFlag(context, Constants.updateFlag);
                return context.executeAction('/SAPAssetManager/Actions/Notifications/CreateUpdate/NotificationCreateUpdateNav.action');
            }
            return '';
        });
    }
    libCommon.setOnCreateUpdateFlag(context, Constants.updateFlag);
    return context.executeAction('/SAPAssetManager/Actions/Notifications/CreateUpdate/NotificationCreateUpdateNav.action');
}
