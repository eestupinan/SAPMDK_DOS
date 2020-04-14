import libCom from '../../Common/Library/CommonLibrary';

export default function allowChecklistCreateEquipment(context) {

    var binding = context.binding;
    if (!libCom.isDefined(binding.EquipId)) {
        binding = context.getPageProxy().binding;
    }
    return context.count('/SAPAssetManager/Services/AssetManager.service','ObjectFormCategories', "$filter=EquipId eq '" + binding.EquipId + "'").then(count => {
        if (count < 1) {
            return Promise.resolve(false);
        }
        return Promise.resolve(true);
    });    
}
