import libCom from '../Common/Library/CommonLibrary';
export default function FilterPoints(clientAPI) {
    let clientData = clientAPI.getClientData();
    let context = clientData.context;
    let binding = context.binding;
    if (binding.MeasuringPoint.IsCounter === 'X') {
        return !libCom.isCurrentReadLinkLocal(binding['@odata.readLink']);
    } else {
        return true;
    }
}
