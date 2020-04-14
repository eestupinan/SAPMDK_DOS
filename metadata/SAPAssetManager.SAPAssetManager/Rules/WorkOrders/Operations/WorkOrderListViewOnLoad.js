
import libWOStatus from '../MobileStatus/WorkOrderMobileStatusLibrary';
import setCaption from './WorkOrderOperationListViewCaption';
export default function WorkOrderListViewOnLoad(clientAPI) {
    setCaption(clientAPI);
    return libWOStatus.isOrderComplete(clientAPI).then(status => {
        if (status) {
            clientAPI.setActionBarItemVisible(0, false);
        }
    });
}
