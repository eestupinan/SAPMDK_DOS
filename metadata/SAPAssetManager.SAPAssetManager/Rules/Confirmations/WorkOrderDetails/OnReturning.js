
import FetchRequest from '../../Common/Query/FetchRequest';
import QueryBuilder from '../../Common/Query/QueryBuilder';

export default function OnReturning(context) {

    let binding = context.getBindingObject();
    let queryBuilder = new QueryBuilder();
    

    queryBuilder.addFilter(`OrderID eq '${binding.OrderId}'`);

    let date = context.evaluateTargetPath('#Page:-Previous/#ClientData').PostingDate;
    if (date !== undefined) {
        queryBuilder.addFilter(`PostingDate eq datetime'${date}'`);
    } else {
        queryBuilder.addFilter('ActualDuration ne null');
    }
    // Add a filter that doesn't do anything to get around bug where string needs an & symbol ?
    queryBuilder.addExtra('orderby=OrderID desc');

    let request = new FetchRequest('Confirmations', queryBuilder.build());

    return request.count(context).then(result => {
        let caption = context.localizeText('confirmations_count', [result]);
        context.setCaption(caption);
    });
}
