import ComLib from '../../../Common/Library/CommonLibrary';
import NotificationLib from '../../../Notifications/NotificationLibrary';

export default function NotificationItemCreateUpdateOnCommit(clientAPI) {

    return NotificationLib.NotificationItemCreateUpdateValidation(clientAPI).then((isValid) => {
        if (isValid) {
            if (ComLib.IsOnCreate(clientAPI)) {
                if (ComLib.isOnChangeset(clientAPI)) {
                    return clientAPI.executeAction('/SAPAssetManager/Actions/Notifications/Item/NotificationItemCreate.action');
                }
                // If this is not already a change set, we want to make it one
                ComLib.setOnChangesetFlag(clientAPI, true);
                ComLib.resetChangeSetActionCounter(clientAPI);
                return clientAPI.executeAction('/SAPAssetManager/Actions/Notifications/Item/NotificationItemCreateChangeSet.action');
            } else {
                return clientAPI.executeAction('/SAPAssetManager/Actions/Notifications/Item/NotificationItemUpdate.action');
            }
        } else {
            return Promise.resolve(false);
        }
    });
}
