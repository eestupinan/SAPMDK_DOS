
import libMobile from '../../MobileStatus/MobileStatusLibrary';
import libCommon from '../../Common/Library/CommonLibrary';
import libValidation from '../../Common/Library/ValidationLibrary';
import HideActionItems from '../../Common/HideActionItems';
import Logger from '../../Log/Logger';

const notificationDetailsPage = 'NotificationDetailsPage';

export default class {

    static startNotification(context) {
        var pageContext = libMobile.getPageContext(context, notificationDetailsPage);
        libMobile.setStartStatus(pageContext);
        return this.getHeaderMobileStatus(pageContext, notificationDetailsPage).then(status => {
            let allTaskComplete = this.isAllTasksComplete(context);
            let allItemTaskComplete = this.isAllItemTasksComplete(context);

            return Promise.all([allTaskComplete, allItemTaskComplete]).then(values => {
                pageContext.setToolbarItemCaption('EndNotificationTbI', pageContext.localizeText('complete_notification'));
                if (values[0] && values[1]) {
                    libCommon.enableToolBar(context, 'NotificationDetailsPage', 'EndNotificationTbI', true);
                } else {
                    libCommon.enableToolBar(context, 'NotificationDetailsPage', 'EndNotificationTbI', false);
                }
                const received = libCommon.getAppParam(pageContext, 'MOBILESTATUS', pageContext.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue());
                if (!libValidation.evalIsEmpty(status) && status === received) {
                    return pageContext.executeAction('/SAPAssetManager/Actions/Notifications/NotificationStartUpdate.action').then(function() {
                        return pageContext.executeAction('/SAPAssetManager/Actions/Notifications/NotificationMobileStatusSuccessMessage.action');
                    });
                }
                return pageContext.executeAction('/SAPAssetManager/Actions/Notifications/NotificationMobileStatusFailureMessage.action');
            });
        });
    }

    static completeNotification(context) {
        var pageContext = libMobile.getPageContext(context, notificationDetailsPage);
        libMobile.setCompleteStatus(pageContext);
        return this.getHeaderMobileStatus(pageContext, notificationDetailsPage).then(status => {
            const started = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
            if (!libValidation.evalIsEmpty(status) && status === started) {
                return this.showNotificationCompleteWarningMessage(context).then(
                    bool => {
                        if (bool) {
                            
                            return pageContext.executeAction('/SAPAssetManager/Actions/Notifications/NotificationCompleteUpdate.action').then(function() {
                                pageContext.setToolbarItemCaption('EndNotificationTbI', pageContext.localizeText('completed'));
                                libCommon.enableToolBar(context, notificationDetailsPage, 'EndNotificationTbI', false);
                                HideActionItems(context.getPageProxy(), 2);
                                return pageContext.executeAction('/SAPAssetManager/Actions/Notifications/NotificationMobileStatusSuccessMessage.action');
                            });
                        } else {
                            context.dismissActivityIndicator();
                            return Promise.resolve();
                        }
                    });
            }
            return pageContext.executeAction('/SAPAssetManager/Actions/Notifications/NotificationMobileStatusFailureMessage.action');
        });
    }

    static showNotificationCompleteWarningMessage(context) {
        let message = context.localizeText('notification_complete_warning');
        return libMobile.showWarningMessage(context, message);
    }

    static isNotificationComplete(context) {
        return new Promise((resolve, reject) => {
            try {
                this.getHeaderMobileStatus(context).then(status => {
                    const complete = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
                    if (status === complete) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
            } catch (error) {
                reject(false);
            }
        });
    }

    static getHeaderMobileStatus(context) {     
            // This request did not originate from notificationDetailsPage, so lets read from store
            var binding;
            if (context.binding) {
                binding = context.binding;
            }
            if (binding) {
                return context.read('/SAPAssetManager/Services/AssetManager.service',
                    'MyNotificationHeaders',
                    [],
                    "$filter=NotificationNumber eq '" + binding.NotificationNumber + "'&$expand=MobileStatus&$select=MobileStatus/MobileStatus")
                    .then(function(notificationHeaders) {
                        if (notificationHeaders) {
                            var notif = notificationHeaders.getItem(0);
                            return notif.MobileStatus.MobileStatus;
                        } else {
                            return '';
                        }
                    });
            } else {
                return Promise.resolve();
            }
    }

    static isAllTasksComplete(context) {
        var tasksComplete = false;
        var binding = context.binding;
        return context.read('/SAPAssetManager/Services/AssetManager.service', binding['@odata.readLink'] + '/Tasks', [], '$expand=MobileStatus')
            .then(function(mobileStatusData) {
                if (mobileStatusData) {
                    const completed = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
                    const success = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/SuccessParameterName.global').getValue());
                    var count = 0;
                    for (let i = 0; i < mobileStatusData.length; i++) {
                        var item = mobileStatusData.getItem(i);
                        var status = item.MobileStatus.MobileStatus;
                        if (status === completed || status === success) {
                            count = count + 1;
                        }
                    }
                    if (count === mobileStatusData.length) {
                        tasksComplete = true;
                    }
                }
                return tasksComplete;
            }).catch(err => {
                /**Implementing our Logger class*/
                Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryNotifications.global').getValue(),err);
                return '';
            });
    }

    static isAllItemTasksComplete(context) {
        var tasksComplete = false;
        var binding = context.binding;
        var completed = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
        var success = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/SuccessParameterName.global').getValue());
        return context.read('/SAPAssetManager/Services/AssetManager.service', binding['@odata.readLink'] + '/Items', [], '$expand=ItemTasks/MobileStatus')
            .then(function(mobileStatusData) {
                if (mobileStatusData) {
                    var completeCount = 0;
                    var taskCount = 0;
                    for (let i = 0; i < mobileStatusData.length; i++) {
                        var item = mobileStatusData.getItem(i);
                        if (item.ItemTasks) {
                            var tasks = item.ItemTasks;
                            for (let j = 0; j < tasks.length; j++) {
                                taskCount = taskCount + 1;
                                var task = tasks[j];
                                var status = task.MobileStatus.MobileStatus;
                                if (status === completed || status === success) {
                                    completeCount = completeCount + 1;
                                }
                            }
                        }
                    }
                    if (completeCount === taskCount) {
                        tasksComplete = true;
                    }
                }
                return tasksComplete;
            });
    }

    static isTasksAndItemTasksExists(context) {
        var binding = context.binding;
        return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyNotificationHeaders', [], "$filter=NotificationNumber eq '" + binding.NotificationNumber + "'&$expand=Tasks,Items/ItemTasks").then(function(results) {
            if (results && results.getItem(0)) {
                var notification = results.getItem(0);
                if ((notification.Tasks && notification.Tasks.length > 0) || (notification.Items.ItemTasks && notification.Items.ItemTasks.length > 0)) {
                    return true;
                }
            }
            return false;
        });
    }
}
