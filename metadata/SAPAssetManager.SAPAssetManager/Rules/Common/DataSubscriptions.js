
import libCom from '../Common/Library/CommonLibrary';
export default function DataSubscriptions(context) {
    let pageName = libCom.getPageName(context);
    switch (pageName) {
        case 'NotificationsListViewPage':
            return [
                'MyWorkOrderHeaders',
                'MyNotificationHeaders',
                'UserPreferences',
                'MyEquipments',
                'MobileStatuses',
                'CatsTimesheetOverviewRows',
                'ConfirmationOverviewRows',
                '/SAPAssetManager/Services/AssetManager.service',
            ];
        case 'OverviewPage':
            return [
                'MyWorkOrderSubOperations',
                'MyWorkOrderHeaders',
                'MyNotificationHeaders',
                'MyWorkOrderOperations',
                'UserPreferences',
                'MyEquipments',
                '/SAPAssetManager/Services/AssetManager.service',
            ];
        case 'WorkOrdersListViewPage':
            return [
            	'Addresses',
                'Priorities', 
                'MobileStatuses', 
                'MyWorkOrderHeaderLongTexts',
                'MyWorkOrderSales',
                'ZZUserStatuses',
                'ZZAnomaliass',
                'ZZEquipos',
                'ZZFieldParamss',
                'ZZFormParamss',
                'ZZTipoCortes',
                'ZZVinculos',
                'ZZMotivosSustituciones',
                'ZZDestinosMedidores',
                'ZZPrecintos',
            ];
        default:
            break;
        }
}
