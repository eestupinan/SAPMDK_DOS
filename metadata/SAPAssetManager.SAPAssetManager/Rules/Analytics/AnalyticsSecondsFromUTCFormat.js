import libCom from '../Common/Library/CommonLibrary';

export default function AnalyticsSecondsFromUTCFormat(clientAPI) {
    let clientData = clientAPI.getClientData();
    let context = clientData.context;
    if (context && context.binding) {
        if (context.binding.IsCounterReading === 'X') {
            return Number(context.binding.MeasurementDocNum);
        } else {
            let dt = new Date(clientData.value.substring(0,10) + 'T' + context.binding.ReadingTime);
            let backendOffset = libCom.getBackendOffsetFromSystemProperty(context) * 60 * 60 * 1000;	
            let dateTime = new Date(dt.getTime() - backendOffset);
            return dateTime.getTime()/(1000);
        }
    }
    return 0;
}
