import libCommon from '../../Common/Library/CommonLibrary';
import assnType from '../../Common/Library/AssignmentType';

export default function WorkOrderCreateFromNotificationNav(context) {
    //Set the global TransactionType variable to CREATE
    libCommon.setOnCreateUpdateFlag(context, 'CREATE');

    //set the CHANGSET flag to true
    libCommon.setOnChangesetFlag(context, true);
    libCommon.setOnWOChangesetFlag(context, true);
    libCommon.resetChangeSetActionCounter(context);

    let binding = context.binding;
    let actionBinding = {
        OrderDescription: binding.NotificationDescription,
        PlanningPlant: binding.PlanningPlant,
        OrderType: libCommon.getAppParam(context, 'WORKORDER', 'OrderType'),
        Priority: binding.Priority,
        HeaderFunctionLocation: binding.HeaderFunctionLocation,
        HeaderEquipment: binding.HeaderEquipment,
        BusinessArea: '',
        MainWorkCenterPlant: assnType.getWorkOrderFieldDefault('WorkOrderHeader', 'WorkCenterPlant'),
        MainWorkCenter: assnType.getWorkOrderFieldDefault('WorkOrderHeader', 'MainWorkCenter'),
        FromNotification: true,
        NotificationNumber: context.binding.NotificationNumber,
    };

    context.setActionBinding(actionBinding);
    return context.executeAction('/SAPAssetManager/Actions/WorkOrders/CreateUpdate/WorkOrderCreateChangeset.action');
}
