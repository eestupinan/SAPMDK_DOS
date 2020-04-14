export default function MeasuringPointsListViewQueryOption(pageClientAPI) {
    let readLink = pageClientAPI.evaluateTargetPathForAPI('#Page:-Previous').getReadLink();
    if (readLink && readLink.indexOf('MyWorkOrderOperations') !== -1) {
        return '$filter=(PRTCategory eq \'P\')&$expand=PRTPoint&$orderby=PRTPoint/SortField&$select=PRTPoint/Point,PRTPoint/PointDesc,PRTPoint/UoM,PRTPoint/IsPrevReading,PRTPoint/PrevReadingDate,PRTPoint/PrevReadingTime,PRTPoint/PrevReadBy,PRTPoint/PrevReadingValue,PRTPoint/PrevHasReadingValue,PRTPoint/PrevValuationCode,PRTPoint/PrevCodeDescription';
    }
    return '$orderby=SortField&$select=Point,PointDesc,UoM,IsPrevReading,PrevReadingDate,PrevReadingTime,PrevReadBy,PrevReadingValue,PrevHasReadingValue,PrevValuationCode,PrevCodeDescription';
}
