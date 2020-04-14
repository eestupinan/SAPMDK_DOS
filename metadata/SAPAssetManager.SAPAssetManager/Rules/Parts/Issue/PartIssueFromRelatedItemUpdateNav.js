import libCommon from '../../Common/Library/CommonLibrary';

const queryOption = '$expand=RelatedItem';

export default function PartIssueFromRelatedItemUpdateNav(context) {
    libCommon.setOnCreateUpdateFlag(context, 'UPDATE');
    return libCommon.navigateOnRead(context, '/SAPAssetManager/Actions/Parts/PartIssueUpdateNav.action', context.getBindingObject()['@odata.readLink'] + '/AssociatedMaterialDoc', queryOption);
}
