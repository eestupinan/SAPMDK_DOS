import libCom from '../Common/Library/CommonLibrary';

export default function WorkOrderIsSamePlanningPlant(context) {
    return (context.binding.PlanningPlant === libCom.getAppParam(context, 'WORKORDER', 'PlanningPlant'));
}
