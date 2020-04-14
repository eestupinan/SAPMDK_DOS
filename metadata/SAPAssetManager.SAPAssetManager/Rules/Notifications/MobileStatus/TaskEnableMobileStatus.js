import libTaskMobile from '../Task/TaskMobileStatusLibrary';
import libComm from '../../Common/Library/CommonLibrary';

export default function TaskEnableMobileStatus(context) {
    var received = libComm.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue());
    var started = libComm.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
    var complete = libComm.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
    var success = libComm.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/SuccessParameterName.global').getValue());
    if (!context.binding['@sap.isLocal']) {
        return libTaskMobile.readHeaderMobileStatus(context).then(headerStatus => {
            if (headerStatus) {
                if (headerStatus === started) {
                    return libTaskMobile.readTaskMobileStatus(context).then(mobileStatus => {
                        if (mobileStatus === received || mobileStatus === started) {
                            return true;
                        } else if (mobileStatus === complete) {
                            if (libComm.getTaskSucessFlag(context) === 'Yes') {
                                return true;
                            } else {
                                return false;
                            }
                        } else if (mobileStatus === success) {
                            return false;
                        }
                        return false;
                    });
                }
            }
            return false;
        });
    }
    return false;
}

