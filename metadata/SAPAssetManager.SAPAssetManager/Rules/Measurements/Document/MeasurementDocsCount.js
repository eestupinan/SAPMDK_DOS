export default function MeasurementDocsCount(clientAPI) {
    return clientAPI.count('/SAPAssetManager/Services/AssetManager.service',clientAPI.binding.getItem(0)['@odata.readLink']+'/MeasurementDocs','');
}
