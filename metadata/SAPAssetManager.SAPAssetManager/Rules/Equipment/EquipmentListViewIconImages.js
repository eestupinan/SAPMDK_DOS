import isAndroid from '../Common/IsAndroid';

export default function EquipmentListViewIconImages(context) {
    // check if this Equipment has any docs
    let docs = context.binding.EquipDocuments;
    if (docs && docs.length > 0) {
        if (isAndroid(context)) {
            return ['/SAPAssetManager/Images/attachmentStepIcon.android.png'];
        } else {
            return ['/SAPAssetManager/Images/attachmentStepIcon.png'];
        }
    } else {
        return [];
    }

}
