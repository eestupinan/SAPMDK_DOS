import libMobile from '../../MobileStatus/MobileStatusLibrary';
import libCommon from '../../Common/Library/CommonLibrary';

export default function WorkOrderEnableMobileStatus(context) {
    let currentReadLink = libCommon.getTargetPathValue(context, '#Property:@odata.readLink');
    let isLocal = libCommon.isCurrentReadLinkLocal(currentReadLink);
    if (libMobile.isHeaderStatusChangeable(context) && !isLocal) {
        var woReceived = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue());
        var woHold = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/HoldParameterName.global').getValue());
        var woStarted = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
        var woTransfer = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/TransferParameterName.global').getValue());
        var woComplete = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
        var woLocal = libCommon.getAppParam(context,'APPLICATION', 'LocalIdentifier');
        var startQueryOption = "$expand=MobileStatus&$filter=(MobileStatus/MobileStatus eq '" + woStarted + "')";
        var workOrderAlreadyStarted = false;
        return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyWorkOrderHeaders', [], startQueryOption).then(
            statuses => {
                if (statuses) {
                    var count = statuses.length;
                    if (count > 0) {
                        workOrderAlreadyStarted = true;
                    }
                }
                return libMobile.mobileStatus(context, context.getPageProxy().binding).then(mobileStatus => {
                    if (workOrderAlreadyStarted && (mobileStatus === woReceived || mobileStatus === woHold)) {
                        return true;
                    } else if (mobileStatus === woTransfer || mobileStatus === woComplete || mobileStatus === woLocal) {
                        return false;
                    } else if (mobileStatus === woStarted || mobileStatus === woReceived || mobileStatus === woHold) {
                        return true;
                    } 
                    return false;
                });
            });
    }
    return false;
}
