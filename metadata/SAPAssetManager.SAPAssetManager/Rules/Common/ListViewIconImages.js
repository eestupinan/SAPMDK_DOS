import isAndroid from './IsAndroid';

export default function ListViewIconImages(controlProxy) {
    var iconImage = [];
    if (controlProxy.evaluateTargetPath('#Property:@sap.isLocal')) {
        iconImage.push(isAndroid(controlProxy) ? '/SAPAssetManager/Images/syncOnListIcon.android.png' : '/SAPAssetManager/Images/syncOnListIcon.png');
    }
    if (controlProxy.binding['@odata.type'] === '#sap_mobile.MyEquipment') {
	return controlProxy.count('/SAPAssetManager/Services/AssetManager.service', controlProxy.binding['@odata.readLink'] + '/EquipDocuments', '').then(function(count) {
        if (count > 0) {
            iconImage.push(isAndroid(controlProxy) ? '/SAPAssetManager/Images/attachmentStepIcon.android.png' : '/SAPAssetManager/Images/attachmentStepIcon.png');
        }
        return iconImage;
	});
    }
    return iconImage;
}
