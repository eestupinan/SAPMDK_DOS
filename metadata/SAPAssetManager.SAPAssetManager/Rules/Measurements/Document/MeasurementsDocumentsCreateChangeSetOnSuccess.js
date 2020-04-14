import libCommon from '../../Common/Library/CommonLibrary';
/**
 * After changeset success, reset the state variables
 */
export default function MeasurementDocumentsCreateChangeSetOnSuccess(pageProxy) {
    libCommon.resetChangeSetActionCounter(pageProxy);
    libCommon.setOnChangesetFlag(pageProxy, false);
    return pageProxy.executeAction('/SAPAssetManager/Actions/CreateUpdateDelete/CreateEntitySuccessMessage.action');
}
