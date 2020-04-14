import libCom from '../../Common/Library/CommonLibrary';
import libForm from '../../Common/Library/FormatLibrary';

export default function PartCreateInitialValue(context) {
    if (libCom.IsOnCreate(context)) {
        return libForm.getFormattedKeyDescriptionPair(context, libCom.getAppParam(context, 'PART', 'StockItemCategory') ,
                                                        context.localizeText('stock_item'));
    } else {
        if (context.binding.ItemCategory === libCom.getAppParam(context, 'PART', 'StockItemCategory')) {
            return libForm.getFormattedKeyDescriptionPair(context, libCom.getAppParam(context, 'PART', 'StockItemCategory') ,
                                                            context.localizeText('stock_item'));
        } else {
            return libForm.getFormattedKeyDescriptionPair(context, libCom.getAppParam(context, 'PART', 'TextItemCategory') ,
                                                            context.localizeText('text_item'));
        }
    }

}
