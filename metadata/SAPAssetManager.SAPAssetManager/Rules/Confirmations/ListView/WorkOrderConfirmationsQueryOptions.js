import QueryBuilder from '../../Common/Query/QueryBuilder';


export default function WorkOrderConfirmationsQueryOptions(context) {

    let binding = context.getBindingObject();

    let queryBuilder = new QueryBuilder();
    queryBuilder.addFilter(`OrderID eq '${binding.OrderId}'`);
    queryBuilder.addAllExpandStatements(['WorkOrderHeader','AcctIndicator','Variance']);
    queryBuilder.addAllExpandStatements(['WorkOrderOperation','WorkOrderSubOperation']);
    queryBuilder.addAllExpandStatements(['WorkOrderHeader/MobileStatus','WorkOrderOperation/MobileStatus','WorkOrderSubOperation/MobileStatus']);

    let date = context.evaluateTargetPath('#Page:-Previous/#ClientData').PostingDate;
    if (date === undefined) {
        queryBuilder.addFilter('ActualDuration ne null');
    } else {
        queryBuilder.addFilter(`PostingDate eq datetime'${date}'`);
    }

    return queryBuilder.build();
}
