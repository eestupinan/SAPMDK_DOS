import isLocalChar from '../CharacteristicIsLocalChar';
import charCreateAction from '../CharacteristicCreateAction';
export default function CharacteristicCreateOrUpdate(context) {
    if (isLocalChar(context)) {
        return charCreateAction(context);
    } else {
        return context.executeAction('/SAPAssetManager/Actions/Classification/Characteristics/CharacteristicUpdate.action');
    }
}
