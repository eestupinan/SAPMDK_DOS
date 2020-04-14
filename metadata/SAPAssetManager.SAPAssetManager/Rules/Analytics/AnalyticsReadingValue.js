import Logger from '../Log/Logger';
export default function AnalyticsReadingValue(clientAPI) {
    let binding = clientAPI.binding;
    let value  = binding.ReadingValue;
    if (binding.IsCounterReading === 'X') {
        value = binding.CounterReadingDifference;
    }
    if (typeof(value) === 'string') {
        let floatValue = parseFloat(value);
        if (floatValue) {
            return floatValue;
        }
        Logger.error(clientAPI.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryAnalytics.global').getValue(), 'AnalyticsReadingValue failed: unable to parse value as float');
    }
    return value;
}
