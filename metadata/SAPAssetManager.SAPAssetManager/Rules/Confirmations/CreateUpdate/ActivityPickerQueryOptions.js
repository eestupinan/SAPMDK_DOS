import QueryBuilder from '../../Common/Query/QueryBuilder';
import libCom from '../../Common/Library/CommonLibrary';
import libVal from '../../Common/Library/ValidationLibrary';

export default function ActivityPickerQueryOptions(context) {
    let queryBuilder = new QueryBuilder();
    let workOrder = libCom.getListPickerValue(libCom.getTargetPathValue(context, '#Control:WorkOrderLstPkr/#Value'));
    if (workOrder) {
        return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyWorkOrderHeaders('+ '\'' + workOrder +'\''+')', [], '$select=CostCenter,ControllingArea').then(function(data) {
            if (data.getItem(0)) {
                if (!libVal.evalIsEmpty(data.getItem(0).CostCenter)) {
                    queryBuilder.addFilter(`CostCenter eq '${data.getItem(0).CostCenter}'`);
                }
                if (!libVal.evalIsEmpty(data.getItem(0).ControllingArea)) {
                    queryBuilder.addFilter(`ControllingArea eq '${data.getItem(0).ControllingArea}'`);
                }
            }
            queryBuilder.addExtra('orderby=ActivityType asc');  
            return queryBuilder.build();
        });
    } else {
        queryBuilder.addExtra('orderby=ActivityType asc');    
        return queryBuilder.build();
    }
}
