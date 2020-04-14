import libMobile from './MobileStatusLibrary';
import mobileStatus from './MobileStatus';

export default function OperationMobileStatus(context) {
    let binding = context.binding;
    if (binding && binding.OperationNo && libMobile.isOperationStatusChangeable()) {
        return mobileStatus(context);
    } else {
        return '';
    }
}
