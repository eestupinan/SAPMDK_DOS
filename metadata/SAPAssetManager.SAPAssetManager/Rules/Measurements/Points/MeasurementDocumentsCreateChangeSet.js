import libCommon from '../../Common/Library/CommonLibrary';

export default function MeasurementDocumentsCreateChangeSet(pageProxy) {
    libCommon.setOnChangesetFlag(pageProxy, true);
    libCommon.resetChangeSetActionCounter(pageProxy);
    libCommon.setStateVariable(pageProxy, 'TransactionType', 'CREATE');

    let extension = pageProxy.getControl('FormCellContainer')._control;

    extension.executeChangeSet('/SAPAssetManager/Actions/Measurements/MeasurementDocumentsCreateChangeSet.action');
}
