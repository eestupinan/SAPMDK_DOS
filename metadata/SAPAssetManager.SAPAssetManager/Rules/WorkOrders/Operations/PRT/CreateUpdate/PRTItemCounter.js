import GenerateLocalID from '../../../../Common/GenerateLocalID';
import libCommon from '../../../../Common/Library/CommonLibrary';

export default function PRTItemCounter(context) {

    if (!libCommon.IsOnCreate(context)) {
        return context.binding.ItemCounter;
    }
    
    let LocalId = GenerateLocalID(context, context.binding['@odata.readLink'] + '/Tools', 'ItemCounter', '00000000', "$filter=PRTCategory eq 'E'", '');
    return LocalId;
}
