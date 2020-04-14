import libMobile from '../../MobileStatus/MobileStatusLibrary';
import libCommon from '../../Common/Library/CommonLibrary';
export default function OperationMobileStatusToolBarCaption(context) {
    var received = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue());
    var hold = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/HoldParameterName.global').getValue());
    var started = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
    var transfer = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/TransferParameterName.global').getValue());
    var complete = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
    var local = libCommon.getAppParam(context,'APPLICATION', 'LocalIdentifier');
    var oprAlreadyStarted = false;
    return libMobile.mobileStatus(context, context.binding).then(mobileStatus => {
        if (libMobile.isOperationStatusChangeable(context)) {
            var startQueryOption = "$expand=MobileStatus&$filter=(MobileStatus/MobileStatus eq '" + started + "')"; 
            // Only get sibling operations, not all operations
            return context.read('/SAPAssetManager/Services/AssetManager.service', context.binding['@odata.readLink'] + '/WOHeader/Operations', [],
                startQueryOption).then(
                statuses => {
                    if (statuses) {
                        var count = statuses.length;
                        if (count > 0) {
                            oprAlreadyStarted = true;
                        }
                    }
                    if (oprAlreadyStarted && (mobileStatus === received || mobileStatus === hold)) {
                        return context.localizeText('transfer');
                    } else if (mobileStatus === received || mobileStatus === hold || mobileStatus === local) {
                        return context.localizeText('start_operation');
                    } else if (mobileStatus === started) {
                        return context.localizeText('end_operation');
                    } else if (mobileStatus === transfer) {
                        return context.localizeText('transferred');
                    } else if (mobileStatus === complete) {
                        return context.localizeText('completed');
                    }
                    return context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/Status.global').getValue();
                });
        } else {
            return libMobile.isMobileStatusConfirmed(context).then(result => {
                if (result) {
                    return context.localizeText('unconfirm');
                } else {
                    return context.localizeText('confirm');
                }
            });
        }
    });
}
