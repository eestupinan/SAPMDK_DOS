export default function UninstallVisible(context) {
    let query = context.binding['@odata.type'] === '#sap_mobile.MyFunctionalLocation' ?
        `$filter=FunctionalLocation/FuncLocId eq '${context.binding.FuncLocId}'` :
        `$filter=SuperiorEquip eq '${context.binding.EquipId}'`;
    return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyEquipments', [], query).then(function(value) {
        if (value.length > 0) {
            return true;
        } else {
            return false;
        }
    });
}
