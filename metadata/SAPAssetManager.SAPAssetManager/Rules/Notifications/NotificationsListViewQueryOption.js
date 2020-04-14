

import NotificationDetailsNavQueryOptions from './Details/NotificationDetailsNavQueryOptions';

export default function NotificationsListViewQueryOption(context) {
    if (context.binding['@odata.type'] === '#sap_mobile.MyEquipment') {
        let equipment = context.binding.EquipId;
        return `$filter=HeaderEquipment eq '${equipment}'&` + NotificationDetailsNavQueryOptions() + '&$orderby=Priority';
    } else {
        return NotificationDetailsNavQueryOptions() + '&$orderby=Priority,ObjectKey,NotificationNumber,OrderId,NotifDocuments/DocumentID,MobileStatus/MobileStatus';
    }
}
