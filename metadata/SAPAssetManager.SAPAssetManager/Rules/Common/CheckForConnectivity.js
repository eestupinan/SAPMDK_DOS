/**
* This rule will return true if network connectivity is available, false otherwise.
* @param {IClientAPI} context
*/
import libCom from '../Common/Library/CommonLibrary';
export default function CheckForConnectivity(context) {
    return libCom.networkConnectionAvialable(context);
}
