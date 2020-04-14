import { OperationConstants as Constants } from './WorkOrderOperationLibrary';
import CommonLibrary from '../../Common/Library/CommonLibrary';

export default function WorkOrderOperationsListViewQueryOption(context) {
    if (CommonLibrary.isDefined(context.binding['@odata.type']) &&  context.binding['@odata.type'] === '#sap_mobile.MyWorkOrderHeader') {
        return Constants.OperationListQueryOptions;
    } else {
        return Constants.FromWOrkOrderOperationListQueryOptions;
    }
}
