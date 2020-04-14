import libVal from '../Common/Library/ValidationLibrary';
import entitySet from './NotificationEntitySet';
import notificationTotalCount from '../Notifications/NotificationsTotalCount';
export default function OnNotificationFilterSuccess(context) {
    let queryOption = libVal.evalIsEmpty(context.actionResults.filterResult) ? '' : context.actionResults.filterResult.data.filter;
    var params = [];
    return notificationTotalCount(context).then((totalCount) => {
        return context.count('/SAPAssetManager/Services/AssetManager.service',entitySet(context.getControls()[0]),queryOption).then(count => {
            params.push(count);
            params.push(totalCount);
            if (count === totalCount) {
                return context.setCaption(context.localizeText('notifications_x', [totalCount]));
            }
            return context.setCaption(context.localizeText('notifications_x_x', params));
        });
    });
    
}
