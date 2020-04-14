import libWOMobile from './WorkOrderMobileStatusLibrary';
import libCommon from '../../Common/Library/CommonLibrary';

export default function WorkOrderMobileStatusToolBarCaption(context) {
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
            return libWOMobile.headerMobileStatus(context, context.binding).then(mobileStatus => {
                if (workOrderAlreadyStarted && (mobileStatus === woReceived || mobileStatus === woHold)) {
                    return context.localizeText('transfer');
                } else if (mobileStatus === woReceived || mobileStatus === woHold || mobileStatus === woLocal) {
                    return context.localizeText('start_workorder');
                } else if (mobileStatus === woStarted) {
                    return context.localizeText('end_workorder');
                } else if (mobileStatus === woTransfer) {
                    return context.localizeText('transferred');
                } else if (mobileStatus === woComplete) {
                    return context.localizeText('completed');
                }
                return context.localizeText('status');
            });
        });
}
