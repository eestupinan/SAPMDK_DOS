import libWOMobile from './WorkOrderMobileStatusLibrary';
import libMobile from '../../MobileStatus/MobileStatusLibrary';
import { ChecklistLibrary as libChecklist } from '../../Checklists/ChecklistLibrary';

export default function WorkOrderCompleteStatus(context) {
    var isStatusChangeable = libMobile.isHeaderStatusChangeable(context);
    if (isStatusChangeable) {
        var binding = context.binding;
        var equipment = '';
        if (!binding.hasOwnProperty('HeaderEquipment')) {
            binding = context.getPageProxy().binding;
        } else {
            equipment = binding.HeaderEquipment;
        }
        return libChecklist.allowWorkOrderComplete(context, equipment).then(results => { //Check for non-complete checklists and ask for confirmation
            if (results === true) {
                return libWOMobile.completeWorkOrder(context);
            } else {
                return Promise.resolve(true);
            }
        });
    }
    return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderMobileStatusFailureMessage.action');
}
