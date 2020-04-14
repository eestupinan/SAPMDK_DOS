import isAndroid from '../../Common/IsAndroid';

export default function MeasuringPointValueIsLocal(clientAPI) {
    if (clientAPI.binding['@sap.isLocal']) {
        return isAndroid(clientAPI) ? '/SAPAssetManager/Images/syncOnListIcon.android.png' : '/SAPAssetManager/Images/syncOnListIcon.png';
    }
    return '';
}
