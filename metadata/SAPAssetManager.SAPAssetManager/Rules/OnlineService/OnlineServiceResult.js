/**
* Describe this function...
* @param {IClientAPI} context
*/
import libCommon from '../Common/Library/CommonLibrary';
import Logger from '../Log/Logger';

export default function OnlineServiceResult(context) {
    let createSuccess = context.getGlobalDefinition('/SAPAssetManager/Globals/OnlineService/CreateSuccess.global').getValue();
    let openSuccess = context.getGlobalDefinition('/SAPAssetManager/Globals/OnlineService/OpenSuccess.global').getValue();
    let stateKey = context.getGlobalDefinition('/SAPAssetManager/Globals/OnlineService/CreateServiceState.global').getValue();
    let initSuccessActionKey = context.getGlobalDefinition('/SAPAssetManager/Globals/OnlineService/InitOnlineServiceSuccessAction.global').getValue();

    try {
        if (libCommon.getActionResultError(context, 'result')) {
            // Error case, no need to update service state, call action to register for Push
            Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryCommon.global').getValue(), 'Online Service Create failed!');
            // Dismiss activity indicator
            context.dismissActivityIndicator();

            // If we're on the Overview page, don't show an error
            if (context.binding !== undefined) {
                context.executeAction('/SAPAssetManager/Actions/OData/ODataCreateFailureMessage.action').then(function() {
                    return context.executeAction('/SAPAssetManager/Actions/PushNotifications/PushNotificationRegister.action');
                });
            } else {
                return context.executeAction('/SAPAssetManager/Actions/PushNotifications/PushNotificationRegister.action');
            }
        }
    } catch (exception) {
        // success
        let currentState = libCommon.getStateVariable(context, stateKey);
        if (currentState === undefined) {
            libCommon.setStateVariable(context, stateKey, createSuccess);
            return context.executeAction('/SAPAssetManager/Actions/OnlineService/OpenOnlineService.action');
        } else if (currentState === createSuccess) {
            libCommon.setStateVariable(context, stateKey, openSuccess);
            let action = libCommon.getStateVariable(context, initSuccessActionKey);
            if (action) {
                return context.executeAction(action);
            }
        } else if (currentState === openSuccess) {
            // do nothing.
            Logger.info(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryCommon.global').getValue(), 'Online Service Initialization Successful!');
        }
    }
}
