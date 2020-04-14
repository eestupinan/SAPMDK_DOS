import libCom from '../Common/Library/CommonLibrary';
import downloadPush from './PushNotificationsDownload';
import setSyncInProgressState from '../Sync/SetSyncInProgressState';

export default function PushNotificationsDownloadFailureAlertMessage(context) {
    setSyncInProgressState(context, false);
    var binding = libCom.getClientDataForPage(context);
    let title = context.localizeText('download_incomplete');
    return context.executeAction('/SAPAssetManager/Actions/PushNotifications/PushNotificationsDownloadIncomplete.action').then(()=> {
        return libCom.showWarningDialog(context, context.localizeText('push_download_incomplete', [binding.TitleLocArgs]), title, context.localizeText('tryAgain'), context.localizeText('later')).then((result) => {
            if (result === true) {
                setSyncInProgressState(context, true);
                downloadPush(context, binding.ObjectType);
            }
            return '';
        });
    });  
   
}
