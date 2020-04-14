export default function ChecklistsListViewQueryOptions(context) {
    let searchString = context.searchString;
    let queryBuilder = context.dataQueryBuilder();

    queryBuilder.orderBy('Form_Nav/UpdatedOn desc','Form_Nav/ShortDescription asc').expand('Form_Nav').filter('sap.entityexists(Form_Nav)');
    queryBuilder.filter().and(queryBuilder.filterTerm(`substringof('${searchString.toLowerCase()}', tolower(Form_Nav/ShortDescription))`));

    return queryBuilder;
}
