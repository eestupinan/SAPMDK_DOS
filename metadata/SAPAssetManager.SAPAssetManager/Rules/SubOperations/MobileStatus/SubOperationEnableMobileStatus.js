import libMobile from '../../MobileStatus/MobileStatusLibrary';
import libWOMobile from '../../WorkOrders/MobileStatus/WorkOrderMobileStatusLibrary';
import libCommon from '../../Common/Library/CommonLibrary';
import libOpMobile from '../../Operations/MobileStatus/OperationMobileStatusLibrary';

export default function SubOperationEnableMobileStatus(context) {
    var received = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue());
    var hold = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/HoldParameterName.global').getValue());
    var started = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
    var transfer = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/TransferParameterName.global').getValue());
    var complete = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
    var local = libCommon.getAppParam(context,'APPLICATION', 'LocalIdentifier');
    var oprAlreadyStarted = false;
    return libMobile.mobileStatus(context, context.getPageProxy().binding).then(mobileStatus => {
        if (libMobile.isSubOperationStatusChangeable(context)) {
            var startQueryOption = "$expand=MobileStatus&$filter=(MobileStatus/MobileStatus eq '" + started + "')";
            return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyWorkOrderSubOperations', [],
                startQueryOption).then(
                statuses => {
                    if (statuses) {
                        var count = statuses.length;
                        if (count > 0) {
                            oprAlreadyStarted = true;
                        }
                    }
                    if (oprAlreadyStarted && (mobileStatus === received || mobileStatus === hold)) {
                        return true;
                    } else if (mobileStatus === transfer || mobileStatus === complete || mobileStatus === local) {
                        return false;
                    } else if (mobileStatus === started || mobileStatus === received || mobileStatus === hold) {
                        return true;
                    } 
                    return false;
                });
        } else if (libMobile.isOperationStatusChangeable(context)) {
            return libOpMobile.getOperationMobileStatus(context).then(opMobileStatus => {
                return opMobileStatus === started;
            });
        } else {
            return libWOMobile.getWorkOrderMobileStatus(context).then(headerMobileStatus => {
                return headerMobileStatus === started;
            });
        }
    });
}
