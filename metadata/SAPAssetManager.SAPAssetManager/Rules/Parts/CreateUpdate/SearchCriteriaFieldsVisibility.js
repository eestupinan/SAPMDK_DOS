/**
* Describe this function...
* @param {IClientAPI} context
*/
import libPart from '../PartLibrary';
import libCom from '../../Common/Library/CommonLibrary';
export default function SearchCriteriaFieldsVisibility(context) {
    if (!context) {
        throw new TypeError('Context can\'t be null or undefined');
    }
    let controls = libCom.getControlDictionaryFromPage(context);
    // Default category to Stock Item and disable it if online search
    if (context.getValue() === true) {
        controls.PartCategoryLstPkr.setValue(`${context.localizeText('stock_item')} (${libCom.getAppParam(context, 'PART', 'StockItemCategory')})`);
        controls.PartCategoryLstPkr.setVisible(false);
    } else {
        controls.PartCategoryLstPkr.setVisible(true);
    }
    libPart.partCreateUpdateFieldVisibility(context, controls);
    context.getControl('FormCellContainer').redraw();
}
