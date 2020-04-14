import DocLib from '../Documents/DocumentLibrary';
import isAndroid from '../Common/IsAndroid';
export default function FunctionalLocationListViewIconImages(context) {
    let binding = context.binding;
    var iconImage = [];
    let id = binding.FuncLocIdIntern;
    return DocLib.getDocumentCount(context, 'MyFuncLocDocuments', "$filter=FuncLocIdIntern eq '" + id + "'&$expand=Document").then(count => {
        if (count > 0) {
            if (isAndroid(context)) {
                iconImage.push('/SAPAssetManager/Images/attachmentStepIcon.android.png');
            } else {
                iconImage.push('/SAPAssetManager/Images/attachmentStepIcon.png');
            }
            return DocLib.getDocumentCount(context, 'MyFuncLocDocuments', "$filter=sap.islocal() and FuncLocIdIntern eq '" + id + "'&$expand=Document").then(locals => {
                if (locals > 0) {
                    iconImage.push(isAndroid(context) ? '/SAPAssetManager/Images/syncOnListIcon.android.png' : '/SAPAssetManager/Images/syncOnListIcon.png');
                }
                return iconImage;
            });
        } 
        return iconImage;
    });
}
