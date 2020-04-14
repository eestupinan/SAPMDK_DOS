import {WorkOrderLibrary as libWo} from '../WorkOrders/WorkOrderLibrary';
import libCom from '../Common/Library/CommonLibrary';

export default function PushNotificationsViewEntityNav(context) {
    var binding = libCom.getClientDataForPage(context);
    if (binding.ObjectType === 'WorkOrder') {
        return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyWorkOrderHeaders('+ '\'' + binding.TitleLocArgs +'\''+')', [], libWo.getWorkOrderDetailsNavQueryOption()).then((result) => {
            if (result && result.getItem(0)) {
                context.setActionBinding(result.getItem(0));
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/WorkOrderDetailsNav.action');
            }
            return '';
        });
    }        
       
}
