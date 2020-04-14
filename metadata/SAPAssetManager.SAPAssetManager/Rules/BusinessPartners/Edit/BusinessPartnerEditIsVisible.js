import {GlobalVar as globals} from '../../Common/Library/GlobalCommon';

export default function BusinessPartnerEditIsVisible(context) {
    if (context.binding.PartnerFunction_Nav.PartnerType === globals.getAppParam().PARTNERFUNCTION.PersonelNumber) {
        context.setActionBarItemVisible(0, false);
    } else {
        context.setActionBarItemVisible(0, true);
    }
}
