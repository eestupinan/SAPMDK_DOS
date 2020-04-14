/*
Triggered when a remote notification arrived that indicates there is data to be fetched.
https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1623013-application
*/
import Logger from '../Log/Logger';
import downloadAlert from './PushNotificationsAlertMessage';

export default function PushNotificationsContentAvailableEventHandler(clientAPI) {
    //TODO: Need to check this when SEAM will fix the bug about callback
    const appEventData = clientAPI.getAppEventData();
    if (appEventData.applicationStage === 'Live' ) {
        downloadAlert(clientAPI, appEventData);
    } else {
        Logger.error(clientAPI.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryPushNotification.global').getValue() , 'Content Available Event Handler Called');
    }

}
