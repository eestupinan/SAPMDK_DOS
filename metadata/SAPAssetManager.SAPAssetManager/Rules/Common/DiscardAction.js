export default function DiscardAction(context) {
    //finding object type. Using split as the data is coming as "@sap_mobile.EntityName"
    const entityName = context.binding['@odata.type'].split('.')[1];
    let action = Promise.resolve();
    return context.executeAction('/SAPAssetManager/Actions/DiscardWarningMessage.action').then(successResult => {
        if (successResult.data) {
            switch (entityName) {
                case 'MyWorkOrderHeader':
                    action = context.executeAction('/SAPAssetManager/Actions/WorkOrders/CreateUpdate/WorkOrderDelete.action');
                    break;
                case 'MyWorkOrderOperation':
                    action = context.executeAction('/SAPAssetManager/Actions/WorkOrders/Operations/WorkOrderOperationDelete.action');
                    break;
                case 'MyWorkOrderSubOperation':
                    action = context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationDelete.action');
                    break;
                case 'MyNotificationItemActivity':
                    action = context.executeAction('/SAPAssetManager/Actions/Notifications/Item/NotificationItemActivityDiscard.action');
                    break;
                case 'MyNotificationItemTask':
                    action = context.executeAction('/SAPAssetManager/Actions/Notifications/Item/NotificationItemTaskDiscard.action');
                    break;
                case 'MyNotificationItemCause':
                    action = context.executeAction('/SAPAssetManager/Actions/Notifications/Item/NotificationItemCauseDiscard.action');
                    break;
                case 'MyNotificationItem':
                    action = context.executeAction('/SAPAssetManager/Actions/Notifications/Item/NotificationItemDiscard.action');
                    break;
                case 'MyNotificationTask':
                    action = context.executeAction('/SAPAssetManager/Actions/Notifications/Task/NotificationTaskDiscard.action');
                    break;
                case 'MyNotificationActivity':
                    action = context.executeAction('/SAPAssetManager/Actions/Notifications/Activity/NotificationActivityDiscard.action');
                    break;
                case 'MyNotificationHeader':
                    action = context.executeAction('/SAPAssetManager/Actions/Notifications/NotificationDiscard.action');
                    break;
                case 'MeasurementDocument':
                    action = context.executeAction('/SAPAssetManager/Actions/Measurements/MeasurementDocumentDiscard.action');
                    break;
                case 'CatsTimesheet':
                    action = context.executeAction('/SAPAssetManager/Actions/TimeSheets/TimeSheetEntryDiscard.action');
                    break;
                case 'MyWorkOrderComponent':
                    action = context.executeAction('/SAPAssetManager/Actions/Parts/PartDelete.action');
                    break;
                case 'MaterialDocument':
                    action = context.executeAction('/SAPAssetManager/Actions/Parts/PartIssueDeleteHeader.action');
                    break;    
                case 'Confirmation':
                    action = context.executeAction('/SAPAssetManager/Actions/Confirmations/ConfirmationDelete.action');
                    break;
                case 'MyWorkOrderTool':
                    action = context.executeAction('/SAPAssetManager/Actions/WorkOrders/Operations/PRT/CreateUpdate/PRTEquipmentDelete.action');
                    break;
                case 'WorkOrderTransfer':
                    action = context.executeAction('/SAPAssetManager/Actions/WorkOrders/WorkOrderTransferDelete.action');
                    break;
                case 'ObjectFormAssessment':
                    action = context.executeAction('/SAPAssetManager/Actions/Checklists/ChecklistDelete.action');
                    break;      
                default:
                    break;
            }
        }
        return action;
    });
}
