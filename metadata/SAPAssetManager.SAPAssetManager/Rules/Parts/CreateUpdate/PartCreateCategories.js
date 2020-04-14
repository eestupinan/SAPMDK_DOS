import libCom from '../../Common/Library/CommonLibrary';
import libForm from '../../Common/Library/FormatLibrary';

export default function PartCreateCategories(context) {
    let item = libForm.getFormattedKeyDescriptionPair(context, libCom.getAppParam(context, 'PART', 'TextItemCategory'),
    context.localizeText('text_item'));
    let stock = libForm.getFormattedKeyDescriptionPair(context, libCom.getAppParam(context, 'PART', 'StockItemCategory') ,
    context.localizeText('stock_item'));
    return [item,stock];
}
