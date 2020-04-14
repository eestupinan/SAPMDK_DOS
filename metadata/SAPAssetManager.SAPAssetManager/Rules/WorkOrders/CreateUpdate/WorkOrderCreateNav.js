import libCommon from '../../Common/Library/CommonLibrary';
import assnType from '../../Common/Library/AssignmentType';

export default function WorkOrderCreateNav(clientAPI) {
    //Set the global TransactionType variable to CREATE
    libCommon.setOnCreateUpdateFlag(clientAPI, 'CREATE');

    //set the CHANGSET flag to true
    libCommon.setOnChangesetFlag(clientAPI, true);
    libCommon.setOnWOChangesetFlag(clientAPI, true);
    libCommon.resetChangeSetActionCounter(clientAPI);

    let actionBinding = {
        PlanningPlant: assnType.getWorkOrderFieldDefault('WorkOrderHeader', 'PlanningPlant'),
        OrderType: libCommon.getAppParam(clientAPI, 'WORKORDER', 'OrderType'),
        Priority: libCommon.getAppParam(clientAPI, 'WORKORDER', 'Priority'),
    };
    try {
        actionBinding.MainWorkCenterPlant = clientAPI.binding.MaintPlant ? clientAPI.binding.MaintPlant : assnType.getWorkOrderFieldDefault('WorkOrderHeader', 'WorkCenterPlant');
        actionBinding.MainWorkCenter = clientAPI.binding.WorkCenter_Nav.ExternalWorkCenterId ? clientAPI.binding.WorkCenter_Nav.ExternalWorkCenterId : assnType.getWorkOrderFieldDefault('WorkOrderHeader', 'MainWorkCenter');
    } catch (exc) {
        actionBinding.MainWorkCenterPlant = assnType.getWorkOrderFieldDefault('WorkOrderHeader', 'WorkCenterPlant');
        actionBinding.MainWorkCenter = assnType.getWorkOrderFieldDefault('WorkOrderHeader', 'MainWorkCenter');
    }
    if (libCommon.isDefined(clientAPI.binding)) {
        if (clientAPI.binding['@odata.type'] === '#sap_mobile.MyFunctionalLocation') {
            actionBinding.HeaderFunctionLocation = clientAPI.binding.FuncLocId;
        } else if (clientAPI.binding['@odata.type'] === '#sap_mobile.MyEquipment') {
            actionBinding.HeaderEquipment = clientAPI.binding.EquipId;
            actionBinding.HeaderFunctionLocation = clientAPI.binding.FuncLocId;
        }
    }

    clientAPI.setActionBinding(actionBinding);
    return clientAPI.executeAction('/SAPAssetManager/Actions/WorkOrders/CreateUpdate/WorkOrderCreateChangeset.action');
}
