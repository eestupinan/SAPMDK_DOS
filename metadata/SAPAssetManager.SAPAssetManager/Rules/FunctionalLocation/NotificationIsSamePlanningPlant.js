import libCom from '../Common/Library/CommonLibrary';

export default function NotificationIsSamePlanningPlant(context) {
    return (context.binding.PlanningPlant === libCom.getAppParam(context, 'NOTIFICATION', 'PlanningPlant'));
}
