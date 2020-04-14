import QueryBuilder from '../Common/Query/QueryBuilder';
import ODataDate from '../Common/Date/ODataDate';


export default function ConfirmationsQueryOptions(context) {
    let binding = context.getBindingObject();

    let queryBuilder = new QueryBuilder();
    queryBuilder.addExpandStatement('Confirmations');
    queryBuilder.addExtra('orderby=OrderId desc');

    if (binding !== undefined && binding.PostingDate !== undefined) {

        let odataDate = new ODataDate(binding.PostingDate);

        queryBuilder.addFilter(`Confirmations/any(confirmation:confirmation/PostingDate eq ${odataDate.queryString(context, 'date')})`);
    } else {
        queryBuilder.addFilter('Confirmations/any(confirmation:confirmation/OrderID ne null)');
        queryBuilder.addFilter('ActualDuration ne null');
    }

    return queryBuilder.build();
}
