import libMobile from './MobileStatusLibrary';
import mobileStatus from './MobileStatus';

export default function SubOperationMobileStatus(context) {
    let binding = context.binding;
    if (binding && binding.SubOperationNo && libMobile.isSubOperationStatusChangeable()) {
        return mobileStatus(context);
    } else {
        return '';
    }
}
