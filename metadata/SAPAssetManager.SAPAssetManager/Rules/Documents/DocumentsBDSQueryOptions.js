import Logger from '../Log/Logger';

export default function DocumentsBDSQueryOption(controlProxy) {
    let value = '$expand=Document&$orderby=Document/FileName&$filter=Document/FileName ne null';
    Logger.debug(controlProxy.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryDocuments.global').getValue(), 'QueryOption: ' + value);
    return value;
}
