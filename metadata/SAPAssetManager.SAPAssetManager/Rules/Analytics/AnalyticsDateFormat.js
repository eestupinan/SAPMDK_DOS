import libCom from '../Common/Library/CommonLibrary';

export default function AnalyticsDateFormat(clientAPI) {
    let clientData = clientAPI.getClientData();
    let context = clientData.context;
    if (context && context.binding) {
        let dt = new Date(clientData.value.substring(0,10) + 'T' + context.binding.ReadingTime);
        let backendOffset = libCom.getBackendOffsetFromSystemProperty(context) * 60 * 60 * 1000;	
         let dateTime = new Date(dt.getTime() - backendOffset);
        if (context.binding.IsCounterReading === 'X') {
             //let t = odataDate.date();
             let month = dateTime.getMonth() + 1;
             let day = dateTime.getDate();
             return month+'/'+day;
        } else {
            return clientAPI.formatDate(dateTime);
        }
    }
    return '';
}
