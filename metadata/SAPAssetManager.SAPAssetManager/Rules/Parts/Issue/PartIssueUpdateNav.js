import libCommon from '../../Common/Library/CommonLibrary';

const queryOption = '$select=RelatedItem/EntryQuantity,RelatedItem/EntryUOM,RelatedItem/Material,RelatedItem/MaterialDocYear,RelatedItem/MovementType,RelatedItem/OrderNumber,RelatedItem/Plant,RelatedItem/ReservationItemNumber,RelatedItem/ReservationNumber,RelatedItem/StorageLocation&$expand=RelatedItem';

export default function PartIssueUpdateNav(context) {
    libCommon.setOnCreateUpdateFlag(context, 'UPDATE');
    return libCommon.navigateOnRead(context, '/SAPAssetManager/Actions/Parts/PartIssueUpdateNav.action', context.getBindingObject()['@odata.readLink'], queryOption);
}
