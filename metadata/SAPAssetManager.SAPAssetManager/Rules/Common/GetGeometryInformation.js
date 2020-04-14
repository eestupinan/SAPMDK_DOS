import equipmentRead from './GetEquipmentLocationInformation';

export default function GetGeometryInformation(context, geometryPrefix) {

    var binding = context.binding;
    let links = '/Geometry';
    if (geometryPrefix === 'WOGeometries') {
        links = '/Geometry,MobileStatus,MarkedJob';
    } else if (geometryPrefix === 'NotifGeometries') {
        links = '/Geometry,MobileStatus';
    }
    return context.read('/SAPAssetManager/Services/AssetManager.service', binding['@odata.readLink'], [], '$expand=' + geometryPrefix + links).then(function(woResults) {
        let busObj = woResults.getItem(0);
        if (busObj[geometryPrefix].length > 0) {
            return busObj;
        } else {
            return flocRead(context);
        }
    });
}

// "Private" functions - defined separately due to error checking mechanisms
function flocRead(context) {
    let binding = context.getBindingObject();
    return context.read('/SAPAssetManager/Services/AssetManager.service', binding['@odata.readLink'] + '/FunctionalLocation', [], '$expand=FuncLocGeometries/Geometry').then(function(flocResult) {
        let item = flocResult.getItem(0);
        if (item && item.FuncLocGeometries && item.FuncLocGeometries.length > 0 && item.FuncLocGeometries[0].Geometry) {
            return item;
        }
        if (binding['@odata.type'] !== '#sap_mobile.MyEquipment') {
            return equipmentRead(context);
        } else {
            return null;
        }
    });
}
