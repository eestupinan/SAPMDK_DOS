//import libCom from '../../Common/Library/CommonLibrary';
import libPart from '../PartLibrary';

export default function PartCreateSummaryMaterial(context) {
    
    let controls = {};

    let onlineSearch = context.evaluateTargetPath('#Page:PartCreatePage/#Control:OnlineSearchSwitch/#Value');
    let itemTypeControl = context.evaluateTargetPath('#Page:PartCreatePage/#Control:PartCategoryLstPkr');
    controls.PartCategoryLstPkr = itemTypeControl;
    
    let textItem = libPart.evalIsTextItem(context, controls);

    if (onlineSearch === true) {
        return '{{#Property:MaterialNum}} - {{#Property:MaterialDesc}}'; //Online materials
    }
    if (textItem) { //Text item
        return '';
    }
    return '{{#Property:MaterialNum}} - {{#Property:Material/#Property:Description}}'; //Offline materials
}
