import libMobile from '../../../MobileStatus/MobileStatusLibrary';
import titleCase from '../../../Common/TitleCase';

export default function NotificationTaskDetailsMobileStatus(context) {
    return libMobile.mobileStatus(context, context.getPageProxy().binding).then(function(mStatus) {
        return titleCase(mStatus);
    });
}
