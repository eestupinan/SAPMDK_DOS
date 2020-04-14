import ComLib from '../Common/Library/CommonLibrary';

export default function ReminderCreateUpdateOnCommit(clientAPI) {
    let onCreate = ComLib.IsOnCreate(clientAPI);
    if (onCreate) {
        clientAPI.executeAction('/SAPAssetManager/Actions/Reminders/ReminderCreate.action');
    } else {
        clientAPI.executeAction('/SAPAssetManager/Actions/Reminders/ReminderUpdate.action');
    }
}
