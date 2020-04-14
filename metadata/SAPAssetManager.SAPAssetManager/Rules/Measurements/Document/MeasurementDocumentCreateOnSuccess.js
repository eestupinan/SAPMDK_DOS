import libCommon from '../../Common/Library/CommonLibrary';

export default function MeasurementDocumentCreateOnSuccess(context) {
    let onChangeSet = libCommon.isOnChangeset(context);

    if (onChangeSet) {
        libCommon.incrementChangeSetActionCounter(context);
    } else {
        return context.executeAction('/SAPAssetManager/Actions/CreateUpdateDelete/CreateEntitySuccessMessage.action');
    }
}
