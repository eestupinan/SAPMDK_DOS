import libPart from '../PartLibrary';
import libCom from '../../Common/Library/CommonLibrary';

/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function NavToOnlineOffline(context) {
    let isTextItem = libPart.evalIsTextItem(context, libCom.getControlDictionaryFromPage(context));
    if (isTextItem) {
        return context.executeAction('/SAPAssetManager/Actions/Parts/NavToPartCreateSummary.action');
    } else {
        if (libPart.isOnlineSearch(context)) {
            if (context.isDemoMode()) {
                return context.executeAction('/SAPAssetManager/Actions/OData/ODataCreateFailureMessage.action');
            } else {
                // check if online service is open
                let createSuccess = context.getGlobalDefinition('/SAPAssetManager/Globals/OnlineService/CreateSuccess.global').getValue();
                let openSuccess = context.getGlobalDefinition('/SAPAssetManager/Globals/OnlineService/OpenSuccess.global').getValue();
                let stateKey = context.getGlobalDefinition('/SAPAssetManager/Globals/OnlineService/CreateServiceState.global').getValue();
                let initSuccessActionKey = context.getGlobalDefinition('/SAPAssetManager/Globals/OnlineService/InitOnlineServiceSuccessAction.global').getValue();

                context.showActivityIndicator(context.localizeText('online_search_activityindicator_text'));

                let currentState = libCom.getStateVariable(context, stateKey);
                if (currentState === openSuccess) {
                    return context.executeAction('/SAPAssetManager/Actions/Parts/NavToPartOnlineSearch.action');
                } else if (currentState === createSuccess) {
                    libCom.setStateVariable(context, initSuccessActionKey, '/SAPAssetManager/Actions/Parts/NavToPartOnlineSearch.action');
                    return context.executeAction('/SAPAssetManager/Actions/OnlineService/OpenOnlineService.action');
                } else if (currentState === undefined) {
                    return context.executeAction('/SAPAssetManager/Actions/OnlineService/CreateOnlineServcie.action');
                }
            }

        } else {
            return context.executeAction('/SAPAssetManager/Actions/Parts/NavToPartOfflineSearch.action');
        }
    }
}
