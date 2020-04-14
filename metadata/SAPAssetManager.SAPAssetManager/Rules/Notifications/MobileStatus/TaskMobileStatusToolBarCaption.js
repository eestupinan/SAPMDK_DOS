import libMobile from '../../MobileStatus/MobileStatusLibrary';
import libTaskMobile from '../Task/TaskMobileStatusLibrary';
import libComm from '../../Common/Library/CommonLibrary';

export default function TaskMobileStatusToolBarCaption(context) {
    var received = libComm.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue());
    var started = libComm.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
    var complete = libComm.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
    var success = libComm.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/SuccessParameterName.global').getValue());
    return libTaskMobile.getHeaderMobileStatus(context).then(headerStatus => {
        if (headerStatus) {
            if (headerStatus === started) {
                return libMobile.mobileStatus(context, context.binding).then(mobileStatus => {
                    if (mobileStatus === received) {
                        return context.localizeText('start_task');
                    } else if (mobileStatus === started) {
                        return context.localizeText('end_task');
                    } else if (mobileStatus === complete) {
                        if (libComm.getTaskSucessFlag(context) === 'Yes') {
                            return context.localizeText('task_success');
                        } else {
                            return context.localizeText('end_task');
                        }
                    } else if (mobileStatus === success) {
                        return context.localizeText('success');
                    }
                    return context.localizeText('status');
                });
            }
        }
        return context.localizeText('start_task');
    });

}
