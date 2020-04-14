
import MobileStatusCompleted from '../../MobileStatus/MobileStatusCompleted';
import QueryBuilder from '../../Common/Query/QueryBuilder';

export default function WorkOrderPickerQueryOptions(context) {

    let completedVariable = MobileStatusCompleted(context);

    let queryBuilder = new QueryBuilder();
    let filter = '';
    let binding = context.getBindingObject();
    if (binding.OrderID !== undefined && binding.OrderID.length > 0) { // if the order id is defined
        filter = `OrderId eq '${binding.OrderID}'`;
    } else {
        filter = `MobileStatus/MobileStatus ne '${completedVariable}'`;
        queryBuilder.addExpandStatement('MobileStatus');
    }

    queryBuilder.addFilter(filter);
    queryBuilder.addExtra('orderby=OrderId asc');

    return queryBuilder.build();
}
