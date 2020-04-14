import libCommon from '../../Common/Library/CommonLibrary';

export default function MeasurementDocumentCreateForChangeSetSkipCheck(context) {
    let skip = libCommon.getControlProxy(context, 'SkipValue').getValue();

    let actionArray = [];
    if (!skip) {
        actionArray.push('/SAPAssetManager/Actions/Measurements/MeasurementDocumentCreateForChangeSet.action');
    }
    return actionArray;
}
