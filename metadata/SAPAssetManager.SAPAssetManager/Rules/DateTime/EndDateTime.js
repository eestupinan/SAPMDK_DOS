import libCommon from '../Common/Library/CommonLibrary';
import ODataDate from '../Common/Date/ODataDate';
import OffsetODataDate from '../Common/Date/OffsetODataDate';


export default function EndDateTime(context) {
    let readLink = '';
    if (context.binding.hasOwnProperty('@odata.readLink')) {
        readLink = context.binding['@odata.readLink'];
    } else {
        readLink = libCommon.GetBindingObject(context)['@odata.readLink'];
    }
    return context.read('/SAPAssetManager/Services/AssetManager.service', readLink + '/MobileStatus', [], '').then(function(results) {
        let odataDate;
        if (results && results.getItem(0)) {
            var status = results.getItem(0);
            if (status) {
                odataDate = OffsetODataDate(context, status.EffectiveTimestamp);
                libCommon.setStateVariable(context, 'StatusStartDate', odataDate.date());
            }
        }
        odataDate = new ODataDate();
        libCommon.setStateVariable(context, 'StatusEndDate', odataDate.date());
        return odataDate.toDBDateTimeString(context);
    });
}
