import libMobile from '../../MobileStatus/MobileStatusLibrary';
import libWOMobile from '../../WorkOrders/MobileStatus/WorkOrderMobileStatusLibrary';
import libCommon from '../../Common/Library/CommonLibrary';
import Logger from '../../Log/Logger';
import HideActionItems from '../../Common/HideActionItems';
import isTimeSheetsEnabled from '../../TimeSheets/TimeSheetsIsEnabled';
import isConfirmationsEnabled from '../../Confirmations/ConfirmationsIsEnabled';
import confirmationsCreateUpdateNav from '../../Confirmations/CreateUpdate/ConfirmationCreateUpdateNav';
import CompleteSubOperationMobileStatusAction from './CompleteSubOperationMobileStatusAction';
import UnconfirmSubOperationMobileStatusAction from './UnconfirmSubOperationMobileStatusAction';

const workOrderSubOperationDetailsPage = 'SubOperationDetailsPage';

export default class {


    static showTimeCaptureMessage(context, isFinalRequired=false) {

        if (isConfirmationsEnabled(context)) {
            return this.showConfirmationsCaptureMessage(context, isFinalRequired);
        } else if (isTimeSheetsEnabled(context)) {
            return this.showTimeSheetCaptureMessage(context);
        }
        return Promise.resolve(true);
    }

    static showConfirmationsCaptureMessage(context, isFinalRequired=false) {
        return this.showWorkOrderConfirmationMessage(context).then( didSelectOk => {
            if (!didSelectOk) {
                return Promise.resolve(true);
            }
            let startDate = libCommon.getStateVariable(context, 'StatusStartDate');
            let endDate = libCommon.getStateVariable(context, 'StatusEndDate');
            let binding = context.getBindingObject();
            
            let overrides = {
                'IsWorkOrderChangable': false,
                'IsOperationChangable': false,
                'IsSubOperationChangable': false,
                'OrderID': binding.OrderId,
                'WorkOrderHeader': binding.WorkOrderOperation.WOHeader,
                'Operation': binding.OperationNo,
                'SubOperation': binding.SubOperationNo,
                'MobileStatus': binding.MobileStatus,
                'WorkOrderOperation': binding.WorkOrderOperation,
                'IsFinalChangable': false,
                'Plant' : binding.MainWorkCenterPlant,
            };

            if (isFinalRequired) {
                overrides.IsFinal = true;
            }

            return confirmationsCreateUpdateNav(context, overrides, startDate, endDate).then(() => {
                return Promise.resolve(true);
            });
        });
    }

    static showTimeSheetCaptureMessage(context) {
        return this.showWorkOrderTimesheetMessage(context).then(
            doSetComplete => {
                if (doSetComplete) {
                    return context.executeAction('/SAPAssetManager/Actions/TimeSheets/TimeSheetEntryCreateForWONav.action');
                }
                return Promise.resolve();
            }, error => {
                /**Implementing our Logger class*/
                context.dismissActivityIndicator();
                Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategorySubOperations.global').getValue(),error);
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationMobileStatusFailureMessage.action');
            });
    }


    static startSubOperation(context) {
        libMobile.setStartStatus(context);
        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationStartUpdate.action').then(function() {
            context.setToolbarItemCaption('IssuePartTbI',context.localizeText('end_suboperation'));
            return context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationMobileStatusSuccessMessage.action');
        });
    }

    static holdSubOperation(context) {
        libMobile.setHoldStatus(context);
        var parent = this;
        return this.showSubOperationHoldWarningMessage(context).then(
            result => {
                if (result) {
                    return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationHoldUpdate.action').then(function() {
                        context.setToolbarItemCaption('IssuePartTbI', context.localizeText('start_suboperation'));

                        return parent.showTimeCaptureMessage(context);
                    });
                } else {
                    return Promise.resolve();
                }
            });
    }

    static transferSubOperation(context) {
        libMobile.setTransferStatus(context);
        return this.showSubOperationTransferWarningMessage(context);
    }

    static completeSubOperation(context) {
        var pageContext = libMobile.getPageContext(context, workOrderSubOperationDetailsPage);
        libMobile.setCompleteStatus(pageContext);
        var parent = this;
        let promises = [];
        return this.showSubOperationCompleteWarningMessage(pageContext).then(
            doSetComplete => {

                if (!doSetComplete) {
                    // Return early, user elected to not complete this operation
                    return true;
                }
                // Setup the SubOperation action
                let binding = pageContext.getBindingObject();

                let actionArgs = {
                    SubOperationId: binding.SubOperationNo,
                    OperationId: binding.OperationNo,
                    WorkOrderId: binding.OrderId,
                    isSubOperationStatusChangeable: libMobile.isSubOperationStatusChangeable(context),
                    isOperationStatusChangeable: libMobile.isOperationStatusChangeable(context),
                    isHeaderStatusChangeable: libMobile.isHeaderStatusChangeable(context),
                };
                let action = new CompleteSubOperationMobileStatusAction(actionArgs);
                pageContext.getClientData().confirmationArgs = {
                    doCheckSubOperationComplete: false,
                };
                // Add this action to client data for retrieval as needed
                pageContext.getClientData().mobileStatusAction = action;
                if (!action.didExecute) {
                    promises.push(action.execute(pageContext));
                }
                promises.push(parent.showTimeCaptureMessage(pageContext, true));
                return Promise.all(promises).then(() =>{
                    return parent.didSetSubOperationCompleteWrapper(pageContext);
                }, (error) => {
                    /**Implementing our Logger class*/
                    pageContext.dismissActivityIndicator();
                    Logger.error(pageContext.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategorySubOperations.global').getValue(),error);
                    pageContext.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationMobileStatusFailureMessage.action');
                    return Promise.reject(error);                
                });
            });
    }

    static unconfirmSubOperation(context) {
        let pageContext = libMobile.getPageContext(context, workOrderSubOperationDetailsPage);
        let parent = this;

        return this.showUnconfirmSubOperationWarningMessage(context).then(
            doMarkUnconfirm => {
                if (!doMarkUnconfirm) {
                    //User chose not to unconfirm operation
                    return '';
                }

                let binding = pageContext.getBindingObject();
                let actionArgs = {
                    OperationId: binding.OperationNo,
                    WorkOrderId: binding.OrderId,
                    SubOperationId: binding.SubOperationNo,
                };

                let action = new UnconfirmSubOperationMobileStatusAction(actionArgs);
                // Add this action to client data for retrieval as needed
                pageContext.getClientData().mobileStatusAction = action;

                return action.execute(pageContext).then(() => {
                    return parent.didSetSubOperationUnconfirm(pageContext);
                }, () => {
                    return pageContext.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationUnconfirmFailureMessage.action');
                });

            }
        );
    }

    static showUnconfirmSubOperationWarningMessage(context) {
        return libMobile.showWarningMessage(context, context.localizeText('unconfirm_suboperation_warning_message'));
    }

    static didSetSubOperationCompleteWrapper(context) {
        if (libMobile.isSubOperationStatusChangeable(context)) {
            return this.didSetSubOperationComplete(context); 
        } else {
            return this.didSetSubOperationConfirm(context); 
        }
    }

    static didSetSubOperationComplete(context) {
        context.setToolbarItemCaption('IssuePartTbI', context.localizeText('complete_text'));
        libCommon.enableToolBar(context, workOrderSubOperationDetailsPage, 'IssuePartTbI', false);

        // Hide the toolbar items
        HideActionItems(context, 2);
        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationMobileStatusSuccessMessage.action');
    }

    static didSetSubOperationConfirm(context) {
        context.setToolbarItemCaption('IssuePartTbI', context.localizeText('unconfirm'));
        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationConfirmSuccessMessage.action');
    }

    static didSetSubOperationUnconfirm(context) {
        context.setToolbarItemCaption('IssuePartTbI', context.localizeText('confirm'));
        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationUnconfirmSuccessMessage.action');
    }

    // eslint-disable-next-line consistent-return
    static subOperationStatusPopoverMenu(context) {
        let currentReadLink = context.binding['@odata.readLink'];
        if (libCommon.isCurrentReadLinkLocal(currentReadLink)) {
            // This is a local entity, return early
            // Shouldn't we tell the user why they cannot use this? Or disable the button ?
            // If we decide to do that, change the action here
            context.dismissActivityIndicator();
            return Promise.resolve();
        }

        var started = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
        if (libMobile.isHeaderStatusChangeable(context) || libMobile.isOperationStatusChangeable(context)) {
            return libMobile.mobileStatus(context, context.binding).then(() => {
                return libWOMobile.getWorkOrderMobileStatus(context).then(() => {
                    return libMobile.isMobileStatusConfirmed(context, context.binding.SubOperationNo).then(result => {
                        if (result) {
                            return this.unconfirmSubOperation(context); 
                        } else {
                            return this.completeSubOperation(context);
                        }
                    });
                });
            });
        } else if (libMobile.isSubOperationStatusChangeable(context)) {
            var oprReceived = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue());
            var oprHold = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/HoldParameterName.global').getValue());
            var startQueryOption = "$expand=MobileStatus&$filter=(MobileStatus/MobileStatus eq '" + started + "')";
            return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyWorkOrderSubOperations', [],
                startQueryOption).then(
                statuses => {
                    if (statuses) {
                        let subOprAlreadyStarted = statuses.length > 0;
                        // eslint-disable-next-line consistent-return
                        return context.read('/SAPAssetManager/Services/AssetManager.service', currentReadLink + '/MobileStatus', [],
                            '').then(
                            // eslint-disable-next-line consistent-return
                            results => {
                                if (results) {
                                    var item = results.getItem(0);
                                    if (item) {
                                        let mobileStatus = item.MobileStatus;
                                        if (subOprAlreadyStarted && (mobileStatus === oprHold || mobileStatus === oprReceived)) {
                                            var pageContext = libMobile.getPageContext(context, workOrderSubOperationDetailsPage);
                                            return this.transferSubOperation(pageContext);
                                        } else if (mobileStatus === oprReceived) {
                                            context.dismissActivityIndicator();
                                            return context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationChangeStausReceivePopover.action');
                                        } else if (mobileStatus === started) {
                                            context.dismissActivityIndicator();
                                            return context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationChangeStausStartPopover.action');
                                        } else if (mobileStatus === oprHold) {
                                            context.dismissActivityIndicator();
                                            return context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationChangeStausHoldPopover.action');
                                        }                                            
                                    }
                                }
                                context.dismissActivityIndicator();
                                return '';
                            });
                    }
                    context.dismissActivityIndicator();
                    return Promise.resolve();
                },
                error => {
                    /**Implementing our Logger class*/
                    Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategorySubOperations.global').getValue(),error);
                    return context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationMobileStatusFailureMessage.action');
                });
        }
        context.dismissActivityIndicator();
        return Promise.resolve();
    }

    static showSubOperationTransferWarningMessage(context) {
        let message = context.localizeText('transfer_suboperation');
        return libMobile.showWarningMessage(context, message).then(bool => {
            if (bool) {
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationTransferNav.action');
            } else {
                return Promise.resolve(false);
            }
        });
    }

    static showSubOperationCompleteWarningMessage(context) {
       if (libMobile.isSubOperationStatusChangeable(context)) {
            return libMobile.showWarningMessage(context, context.localizeText('complete_suboperation'));
        } else {
            return libMobile.showWarningMessage(context, context.localizeText('confirm_suboperation_warning_message'));
        }
    }

    static showSubOperationHoldWarningMessage(context) {
        let message = context.localizeText('hold_suboperation_warning_message');
        return libMobile.showWarningMessage(context, message);
    }

    static showWorkOrderConfirmationMessage(context) {
        let message = context.localizeText('confirmations_add_time_message');
        return libMobile.showWarningMessage(context, message);
    }

    static showWorkOrderTimesheetMessage(context) {
        let message = context.localizeText('workorder_add_timesheet_message');
        return libMobile.showWarningMessage(context, message);
    }
}
