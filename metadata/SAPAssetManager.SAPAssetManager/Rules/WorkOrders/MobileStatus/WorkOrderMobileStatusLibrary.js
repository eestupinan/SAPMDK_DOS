import libMobile from '../../MobileStatus/MobileStatusLibrary';
import libOprMobile from '../../Operations/MobileStatus/OperationMobileStatusLibrary';
import libCommon from '../../Common/Library/CommonLibrary';
import {PartnerFunction} from '../../Common/Library/PartnerFunction';
import Logger from '../../Log/Logger';
import isTimeSheetsEnabled from '../../TimeSheets/TimeSheetsIsEnabled';
import isConfirmationsEnabled from '../../Confirmations/ConfirmationsIsEnabled';
import confirmationsCreateUpdateNav from '../../Confirmations/CreateUpdate/ConfirmationCreateUpdateNav';
import WorkOrderOperationsCount from '../Operations/WorkOrderOperationsCount';
import CompleteWorkOrderMobileStatusAction from './CompleteWorkOrderMobileStatusAction';

const workOrderDetailsPage = 'WorkOrderDetailsPage';

export default class {

    static startWorkOrder(context) {
        libMobile.setStartStatus(context);
        libCommon.SetBindingObject(context);
        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/WorkOrderStartUpdate.action').then(() => {
            this.setCaption(context, 'Start');
            return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderMobileStatusSuccessMessage.action');
        },
            () => {
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderMobileStatusFailureMessage.action');
            });
    }

    static showTimeCaptureMessage(context, isFinalRequired=false) {

        if (isConfirmationsEnabled(context)) {
            return libMobile.getStatusForOperations(context, context.binding.OrderId).then(query => {
                return WorkOrderOperationsCount(context, query).then(count => {
                    // Check to make sure the count for Confirmation Operations > 0
                    if (count > 0) {
                        // Display the confirmations message
                        return this.showConfirmationMessage(context, isFinalRequired);
                    }
                    // If operation count = 0, do nothing
                    return true;
                });
            });
        } else if (isTimeSheetsEnabled(context)) {
            // If time sheets is enabled, display time sheet message
            return this.showTimeSheetMessage(context);
        }
        // Default resolve true
        return Promise.resolve(true);
    }

    static showTimeSheetMessage(context) {
        return this.showWorkOrderTimesheetMessage(context).then(bool => {
            if (bool) {
                libCommon.setOnCreateUpdateFlag(context, 'CREATE');
                return context.executeAction('/SAPAssetManager/Actions/TimeSheets/TimeSheetEntryCreateForWONav.action').then(() => {
                    return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderMobileStatusSuccessMessage.action');
                }, error => {
                    /**Implementing our Logger class*/
                    context.dismissActivityIndicator();
                    Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(), error);
                });
            }
            return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderMobileStatusSuccessMessage.action');
        });
    }

    static showConfirmationMessage(context, isFinalRequired=false) {
        return this.showWorkOrderConfirmationsMessage(context).then(didSelectOk => {
            if (!didSelectOk) {
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderMobileStatusSuccessMessage.action');
            }
            let startDate = libCommon.getStateVariable(context, 'StatusStartDate');
            let endDate = libCommon.getStateVariable(context, 'StatusEndDate');
            let binding = context.binding;

            // Override page values as shown
            let overrides = {
                'IsWorkOrderChangable': false,
                'WorkOrderHeader': binding,
                'OrderID': binding.OrderId,
                'IsFromWorkOrderHold': binding.IsFromWorkOrderHold,
                'Plant' : binding.MainWorkCenterPlant,
            };

            if (isFinalRequired) {
                overrides.IsFinalChangable = false;
                overrides.IsFinal = true;
            }

            return confirmationsCreateUpdateNav(context, overrides, startDate, endDate).then(() => {
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderMobileStatusSuccessMessage.action');
            }, error => {
                /**Implementing our Logger class*/
                context.dismissActivityIndicator();
                Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(), error);
            });
            
        });
    }

    static holdWorkOrder(context) {
        libMobile.setHoldStatus(context);
        libCommon.SetBindingObject(context);
        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderHoldUpdate.action').then(() => {
            this.setCaption(context, 'Hold');
            context.getBindingObject().IsFromWorkOrderHold = true;
            this.showTimeCaptureMessage(context);
            context.dismissActivityIndicator();
        }, () => {
            return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderMobileStatusFailureMessage.action');
        });
    }
    static showTransferWarningMessage(context) {
        return this.showWorkOrderTransferWarningMessage(context).then(bool => {
            if (bool) {
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/WorkOrderTransferNav.action');
            } else {
                return Promise.resolve(false);
            }
        });
    }

    static transferWorkOrder(context) {
        libMobile.setTransferStatus(context);
        libCommon.SetBindingObject(context);
        return this.showTransferWarningMessage(context);
    }

    static updateCompleteStatus(context) {

        let binding = context.binding;
        let promises = [];
        let actionArgs = {
            WorkOrderId: binding.OrderId,
        };
        let action = new CompleteWorkOrderMobileStatusAction(actionArgs);
        context.getClientData().confirmationArgs = {
            doCheckWorkOrderComplete: false,
        };
        // Add this action to the binding
        context.getClientData().mobileStatusAction = action;
        // Hold the previous state of the context
        let pageContext = context;
        // eslint-disable-next-line consistent-return

        if (!action.didExecute) {
            promises.push(action.execute(context));
        }
        promises.push(this.showTimeCaptureMessage(context, true));
        return Promise.all(promises).then(() =>{
            return this.didSetWorkOrderComplete(pageContext);
        }, () => {
            return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderMobileStatusFailureMessage.action');
        });
       
    }

    // Called after the work order has been set to complete
    static didSetWorkOrderComplete(context) {
        this.setCaption(context, 'Complete');
        libCommon.enableToolBar(context, workOrderDetailsPage, 'IssuePartTbI', false);
        try {
            context.setActionBarItemVisible(0, false);
            context.setActionBarItemVisible(1, false);
        } catch (exception) {
            /**Implementing our Logger class*/
            Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(), `workOrdersListViewPage refresh error: ${exception}`);
        }
        //remove the marked job related if theres any
        if (context.binding.MarkedJob) {
            context.executeAction('/SAPAssetManager/Actions/WorkOrders/MarkedJobDelete.action');
        }
        context.getControl('SectionedTable').redraw();
    }

    static completeWorkOrder(context) {
        libMobile.setCompleteStatus(context);
        return this.showWorkOrderCompleteWarningMessage(context).then(bool => {
            if (bool) {
                return this.updateCompleteStatus(context);
            } else {
                return Promise.resolve(false);
            }
        });
    }

    static setCaption(context, status) {
        switch (status) {
            case 'Start':
                context.setToolbarItemCaption('IssuePartTbI', context.localizeText('end_workorder'));
                break;
            case 'Hold':
                context.setToolbarItemCaption('IssuePartTbI', context.localizeText('start_workorder'));
                break;
            case 'Transfer':
                context.setToolbarItemCaption('IssuePartTbI', context.localizeText('transferred'));
                break;
            case 'Complete':
                context.setToolbarItemCaption('IssuePartTbI', context.localizeText('completed'));
                break;
            default:
                context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderMobileStatusFailureMessage.action');
                break;
        }
    }

    static workOrderStatusPopoverMenu(context) {
        let currentReadLink = libCommon.getTargetPathValue(context, '#Property:@odata.readLink');
        if (libCommon.isCurrentReadLinkLocal(currentReadLink) || !libMobile.isHeaderStatusChangeable(context)) {
            context.dismissActivityIndicator();
            return Promise.resolve('');
        }

        let woStarted = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
        let startQueryOption = "$expand=MobileStatus&$filter=(MobileStatus/MobileStatus eq '" + woStarted + "')";

        return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyWorkOrderHeaders', [], startQueryOption).then(
            statuses => {
                if (!statuses) {
                    context.dismissActivityIndicator();
                    return Promise.resolve('');
                }
                let binding = context.binding;
                let isWorkOrderStarted = (statuses.length > 0);

                return context.read('/SAPAssetManager/Services/AssetManager.service', binding['@odata.readLink'] + '/MobileStatus', [],
                    '').then(
                    results => {
                        if (results) {
                            let item = results.getItem(0);
                            if (item) {
                                let mobileStatus = item.MobileStatus;
                                let woReceived = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue());
                                let woHold = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/HoldParameterName.global').getValue());
                                var pageContext = libMobile.getPageContext(context, 'WorkOrderDetailsPage');
                                if (isWorkOrderStarted && (mobileStatus === woHold || mobileStatus === woReceived)) {
                                    return this.transferWorkOrder(pageContext);
                                } else if (mobileStatus === woReceived) {
                                    context.dismissActivityIndicator();
                                    return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderChangeStausReceivePopover.action');
                                } else if (mobileStatus === woStarted) {
                                    context.dismissActivityIndicator();
                                    return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderChangeStausStartPopover.action');
                                } else if (mobileStatus === woHold) {
                                    context.dismissActivityIndicator();
                                    return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderChangeStausHoldPopover.action');
                                }
                            }
                        }
                        context.dismissActivityIndicator();
                        return Promise.resolve('');
                    },
                    error => {
                        /**Implementing our Logger class*/
                        Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(), error);
                        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderMobileStatusFailureMessage.action');
                    });

            });
    }

    static showWorkOrderTransferWarningMessage(context) {
        let message = context.localizeText('transfer_workorder');
        return libMobile.showWarningMessage(context, message);
    }

    static showWorkOrderCompleteWarningMessage(context) {
        let message = context.localizeText('complete_workorder');
        return libMobile.showWarningMessage(context, message);
    }

    static showWorkOrderTimesheetMessage(context) {
        let message = context.localizeText('workorder_add_timesheet_message');
        let caption = context.localizeText('time_entry');
        return libMobile.showWarningMessage(context, message, caption);
    }

    static showWorkOrderConfirmationsMessage(context) {
        let message = context.localizeText('confirmations_add_time_message');
        let caption = context.localizeText('time_entry');
        return libMobile.showWarningMessage(context, message, caption);
    }

    static headerMobileStatus(context) {
        if (libMobile.isHeaderStatusChangeable(context)) {
            return libMobile.mobileStatus(context, context.binding);
        } else if (libMobile.isOperationStatusChangeable(context)) {
            return libOprMobile.operationRollUpMobileStatus(context, 'MyWorkOrderOperations');
        } else if (libMobile.isSubOperationStatusChangeable(context)) {
            return libOprMobile.operationRollUpMobileStatus(context, 'MyWorkOrderSubOperations');
        }
        return libMobile.mobileStatus(context, context.binding);
    }

    static isOrderComplete(context) {
        var pageContext = context;
        try {
            pageContext = context.evaluateTargetPathForAPI('#Page:' + workOrderDetailsPage);
        } catch (error) {
            /**Implementing our Logger class*/
            Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(), `isOrderComplete error: ${error}`);
        }
        return new Promise((resolve, reject) => {
            try {
                var woComplete = libCommon.getAppParam(pageContext, 'MOBILESTATUS', pageContext.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
                return this.getHeaderMobileStatus(pageContext).then(status => {
                    if (status === woComplete) {
                        return resolve(true);
                    } else {
                        return resolve(false);
                    }
                });
            } catch (error) {
                return reject(false);
            }
        });
    }

    static getHeaderMobileStatus(context) {
        return libMobile.mobileStatus(context, context.binding);
    }

    static getWorkOrderMobileStatus(context) {
        var pageContext = context;
        try {
            pageContext = context.evaluateTargetPathForAPI('#Page:' + workOrderDetailsPage);
        } catch (error) {
            /**Implementing our Logger class*/
            Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(), `getWorkOrderMobileStatus error: ${error}`);
        }
        return new Promise((resolve, reject) => {
            try {
                libMobile.mobileStatus(pageContext, pageContext.binding).then(status => {
                    resolve(status);
                });
            } catch (error) {
                reject('');
            }
        });
    }

    static getPartnerNumber(context) {
        var OrderId = libCommon.getTargetPathValue(context, '#Property:OrderId');
        var partnerFunction = PartnerFunction.getPersonnelPartnerFunction();
        var queryOptions = "$filter=(OrderId eq '" + OrderId + "' and PartnerFunction eq '" + partnerFunction + "')";
        return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyWorkOrderPartners', [], queryOptions).then(results => {
            if (results && results.length > 0) {
                return results.getItem(0).Partner;
            }
            return '';
        });
    }
}
