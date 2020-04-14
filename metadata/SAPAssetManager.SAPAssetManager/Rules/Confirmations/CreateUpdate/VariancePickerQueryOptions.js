import QueryBuilder from '../../Common/Query/QueryBuilder';
import libVal from '../../Common/Library/ValidationLibrary';

export default function VariancePickerQueryOptions(context) {

    let binding = context.getBindingObject();	
    let plant = binding.WorkOrderHeader.MainWorkCenterPlant ? binding.WorkOrderHeader.MainWorkCenterPlant : binding.WorkOrderHeader.PlanningPlant;
    let queryBuilder = new QueryBuilder();
    
    if (!libVal.evalIsEmpty(plant)) {
        queryBuilder.addFilter(`Plant eq '${plant}'`);	
    }

    queryBuilder.addExtra('orderby=VarianceReason asc');    
    return queryBuilder.build();
}
