
export default function NotificationDetailsNavQueryOptions() {
    return '$select=NotificationDescription,NotificationNumber,NotificationType,PlanningPlant,OrderId,RequiredEndDate,PriorityType,Priority,BreakdownIndicator,HeaderFunctionLocation,HeaderEquipment,NotifPriority/PriorityDescription,NotifPriority/Priority,FunctionalLocation/FuncLocDesc,ObjectKey,NotifDocuments/DocumentID,MobileStatus/MobileStatus&$expand=WorkOrder,NotifPriority,MobileStatus,NotifDocuments,HeaderLongText,FunctionalLocation,Equipment&$orderby=NotificationNumber';
}
