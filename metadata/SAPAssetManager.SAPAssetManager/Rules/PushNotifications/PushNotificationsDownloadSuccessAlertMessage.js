import libCom from '../Common/Library/CommonLibrary';
import viewEntity from './PushNotificationsViewEntityNav';
import {WorkOrderLibrary as libWo} from '../WorkOrders/WorkOrderLibrary';
import Logger from '../Log/Logger';
import downloadFailure from './PushNotificationsDownloadFailureAlertMessage';
import setSyncInProgressState from '../Sync/SetSyncInProgressState';
export default function PushNotificationsDownloadSuccessAlertMessage(context) {
    setSyncInProgressState(context, false);
    var binding = libCom.getClientDataForPage(context);
    let view = context.localizeText('view');
    let dismiss = context.localizeText('cancel');
    if (binding.ObjectType === 'WorkOrder') {
        return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyWorkOrderHeaders('+ '\'' + binding.TitleLocArgs +'\''+')', [], libWo.getWorkOrderDetailsNavQueryOption()).then((result) => {
            if (result && result.getItem(0)) {
                return context.executeAction('/SAPAssetManager/Actions/PushNotifications/PushNotificationsDownloadComplete.action').then(() => {
                    return libCom.showWarningDialog(context,context.localizeText('push_download_complete',[binding.TitleLocArgs]),context.localizeText('download_complete'),view, dismiss).then(() => {
                        return viewEntity(context);
                    }).catch(() => {
                        return '';
                    });
                });
            }
            return '';
        }).catch(() => {
            return downloadFailure(context);
        });
    }
    Logger.info(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryPushNotification.global').getValue() , 'Push is not implemented for ' + binding.ObjectType + ' entity set');
}
