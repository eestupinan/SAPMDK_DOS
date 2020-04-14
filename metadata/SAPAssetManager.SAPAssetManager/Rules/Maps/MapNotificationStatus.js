import libNotifMobile from '../Notifications/MobileStatus/NotificationMobileStatusLibrary';

export default function MapNotificationStatus(context) {
    return libNotifMobile.getHeaderMobileStatus(context);
}
