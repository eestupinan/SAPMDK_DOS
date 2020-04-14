import Logger from '../Log/Logger';
import libCom from '../Common/Library/CommonLibrary';
import libForm from '../Common/Library/FormatLibrary';

export default function AnalyticsKPIValue(clientAPI) {
    let clientData = clientAPI.getClientData();
    let context = clientData.context;
    if (context && context.binding) {
        let obj = context.binding;
        if (obj.PrevHasReadingValue !== 'X') {
            if (obj.hasOwnProperty('ValuationCode') && libCom.isDefined(obj.PrevValuationCode) && libCom.isDefined(obj.PrevCodeDescription)) {
                return libForm.getFormattedKeyDescriptionPair(context, obj.PrevValuationCode, obj.PrevCodeDescription);
            } else {
                return '-';
            }
        }
        let value = obj.PrevReadingValue;
        let floatValue = parseFloat(libCom.convertSapStringToNumber(value));
        if (floatValue) {
            return floatValue.toFixed((floatValue % 1 === 0) ? 0 : 2);
        }
        Logger.error(clientAPI.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryAnalytics.global').getValue() , 'AnalyticsKPIValue unable to parse float');
        return value;
    }
    return clientData.value;
}
