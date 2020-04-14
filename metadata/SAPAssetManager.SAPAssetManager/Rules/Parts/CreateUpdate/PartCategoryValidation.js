import libPart from '../PartLibrary';
import libCom from '../../Common/Library/CommonLibrary';


export default function PartCategoryValidation(context) {
    let controls = libCom.getControlDictionaryFromPage(context);
    if (libPart.evalIsTextItem(context,controls)) {
        return context.executeAction('/SAPAssetManager/Actions/Parts/PartItemCreateSummaryCheckRequiredFields.action');
    } else {
        return context.executeAction('/SAPAssetManager/Actions/Parts/PartCreateSummaryCheckRequiredFields.action');
    }
}
