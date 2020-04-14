import isAndroid from '../../Common/IsAndroid';

export default function ConfirmationSyncImage(context) {
    if (context.getBindingObject()['@sap.isLocal']) {
        return isAndroid(context) ? '/SAPAssetManager/Images/syncOnListIcon.android.png' : '/SAPAssetManager/Images/syncOnListIcon.png';
    }
    return '';
}
