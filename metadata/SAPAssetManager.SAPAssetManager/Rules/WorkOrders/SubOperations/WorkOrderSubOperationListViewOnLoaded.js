import HideActionItems from '../../Common/HideActionItems';
import WorkOrderListViewOnLoad from '../Operations/WorkOrderListViewOnLoad';
import libCommon from '../../Common/Library/CommonLibrary';

export default function WorkOrderSubOperationListViewOnLoaded(context) {
    
    return WorkOrderListViewOnLoad(context).then(function() {
        let completed = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
        if (context.binding.MobileStatus.MobileStatus === completed) {
            HideActionItems(context, 1);
        }
    });
}
