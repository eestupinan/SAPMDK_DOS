import libCom from '../Common/Library/CommonLibrary';
export default function ChartType(clientAPI) {
    let clientData = clientAPI.getClientData();
    let context = clientData.context;
    let binding = context.binding;
    /**Code group and CharName determine if val code only. Else render charts accordingly*/
    if (libCom.isDefined(binding.CodeGroup)) {
        if (!libCom.isDefined(binding.MeasuringPoint.CharName)) {
            return 'valCode';
        } else {
            if (binding.IsCounterReading === 'X') {
                return 'bar';
            } else {
                return 'line';
            }
        }
    } else {
        if (binding.IsCounterReading === 'X') {
            return 'bar';
        } else {
            return 'line';
        }
    }
}
