import libCom from '../Common/Library/CommonLibrary';

export default function NotificationFLOCFilter(context) {
    return '$filter=PlanningPlant eq \'' + libCom.getAppParam(context, 'NOTIFICATION', 'PlanningPlant') + '\'&$orderby=FuncLocIdIntern';
}
