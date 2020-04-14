import WorkOrdersListViewQueryOption from '../WorkOrders/ListView/WorkOrdersListViewQueryOption';
import WorkOrderOperationsListViewQueryOption from '../WorkOrders/Operations/WorkOrderOperationsListViewQueryOption';
import SubOperationsListViewQueryOption from '../SubOperations/SubOperationsListViewQueryOption';
import NotificationTasksListViewQueryOption from '../Notifications/Task/NotificationTasksListViewQueryOption';
import NotificationItemTasksListViewQueryOption from '../Notifications/Item/Task/NotificationItemTasksListViewQueryOption';
import BusinessPartnerQueryOptions from '../BusinessPartners/BusinessPartnerQueryOptions';
import NotificationDetailsNavQueryOptions from '../Notifications/Details/NotificationDetailsNavQueryOptions';

export default function GetDetailsNavQueryOption(entityODataType) {
    switch (entityODataType) {
        case '#sap_mobile.MyWorkOrderHeader':
            return WorkOrdersListViewQueryOption();
        case '#sap_mobile.MyWorkOrderOperation':
            return WorkOrderOperationsListViewQueryOption();
        case '#sap_mobile.MyWorkOrderSubOperation':
            return SubOperationsListViewQueryOption();
        case '#sap_mobile.MyNotificationHeader':
            return NotificationDetailsNavQueryOptions();
        case '#sap_mobile.MyNotificationItem':
            // there is nothing to expand for Notification Item
            return '';
        case '#sap_mobile.MyNotificationTask':
            return NotificationTasksListViewQueryOption();
        case '#sap_mobile.MyNotificationActivity':
            return '';
        case '#sap_mobile.MyNotificationItemCause':
            return '';
        case '#sap_mobile.MyNotificationItemTask':
            return NotificationItemTasksListViewQueryOption();
        case '#sap_mobile.MyNotificationItemActivity':
            return '';
        case '#sap_mobile.Addresses':
        case '#sap_mobile.Employees':
            return BusinessPartnerQueryOptions();
        default:
            return '';
    }
}
