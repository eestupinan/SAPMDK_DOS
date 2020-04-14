import libPages from '../../vanti/PagesConfigurationLibrary';
import libMobile from '../../MobileStatus/MobileStatusLibrary';
import libWOMobile from '../../WorkOrders/MobileStatus/WorkOrderMobileStatusLibrary';
import libCommon from '../../Common/Library/CommonLibrary';
import Logger from '../../Log/Logger';
import HideActionItems from '../../Common/HideActionItems';
import isTimeSheetsEnabled from '../../TimeSheets/TimeSheetsIsEnabled';
import isConfirmationsEnabled from '../../Confirmations/ConfirmationsIsEnabled';
import confirmationsCreateUpdateNav from '../../Confirmations/CreateUpdate/ConfirmationCreateUpdateNav';
import CompleteOperationMobileStatusAction from './CompleteOperationMobileStatusAction';
import UnconfirmOperationMobileStatusAction from './UnconfirmOperationMobileStatusAction';
import {ChecklistLibrary as libChecklist} from '../../Checklists/ChecklistLibrary';

const workOrderOperationDetailsPage = 'WorkOrderOperationDetailsPage';

export default class {


    static showTimeCaptureMessage(context, isFinalRequired=false) {

        if (isConfirmationsEnabled(context)) {
            return this.showConfirmationsCaptureMessage(context, isFinalRequired);
        } else if (isTimeSheetsEnabled(context)) {
            return this.showTimeSheetCaptureMessage(context);
        }
        // Default resolve true 
        return Promise.resolve(true);
    }

    static showConfirmationsCaptureMessage(context, isFinalRequired=false) {
        return this.showWorkOrderConfirmationMessage(context).then(didSelectOk => {
            if (!didSelectOk) {
                return Promise.resolve(true);
            }
            let startDate = libCommon.getStateVariable(context, 'StatusStartDate');
            let endDate = libCommon.getStateVariable(context, 'StatusEndDate');
            let binding = context.getBindingObject();
            
            let overrides = {
                'IsWorkOrderChangable': false,
                'IsOperationChangable': false,
                'OrderID': binding.OrderId,
                'WorkOrderHeader': binding.WOHeader,
                'Operation': binding.OperationNo,
                'MobileStatus': binding.MobileStatus,
                'IsFinalChangable': false,
                'Plant' : binding.MainWorkCenterPlant,
            };

            if (isFinalRequired) {
                overrides.IsFinal = true;
            }

            return confirmationsCreateUpdateNav(context, overrides, startDate, endDate).then(() => {
                return Promise.resolve();
            }, error => {
                context.dismissActivityIndicator();
                Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryOperations.global').getValue(), error);
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationMobileStatusFailureMessage.action');
            });
        });
    }

    static showTimeSheetCaptureMessage(context) {
        return this.showWorkOrderTimesheetMessage(context).then(
            bool => {
                if (bool) {
                    return context.executeAction('/SAPAssetManager/Actions/TimeSheets/TimeSheetEntryCreateForWONav.action').then(function() {
                        if (libMobile.isOperationStatusChangeable(context)) {
                            return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationMobileStatusSuccessMessage.action').then(function() {
                            });
                        } else {
                            return Promise.resolve();
                        }
                    },
                   error => {
                       /**Implementing our Logger class*/
                       context.dismissActivityIndicator();
                       Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryOperations.global').getValue(), error);
                       return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationMobileStatusFailureMessage.action');
                   });
                } else {
                    return Promise.resolve();
                }
            });
    }

    static startOperation(context) {
        libMobile.setStartStatus(context);
        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationStartUpdate.action').then(function() {
            context.setToolbarItemCaption('IssuePartTbI', context.localizeText('end_operation'));
            //return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationMobileStatusSuccessMessage.action');
            context.dismissActivityIndicator();
            
            var oPages = new libPages();
            
            context.binding.sUserStatus = "";
            context.binding.sMsg = "";
            context.binding.oPages = oPages.conf;
            return context.executeAction('/SAPAssetManager/Actions/vanti/Open_form_1.action');
        },
        () => {
            return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationMobileStatusFailureMessage.action');
        });
    }

    static holdOperation(context) {
        libMobile.setHoldStatus(context);
        var parent = this;
        return this.showOperationHoldWarningMessage(context).then(
            result => {
                if (result) {

                    return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationHoldUpdate.action').then(function() {
                        context.setToolbarItemCaption('IssuePartTbI', context.localizeText('start_operation'));
                        return parent.showTimeCaptureMessage(context);
                    },
        () => {
            return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationMobileStatusFailureMessage.action');
        });
                } else {
                    return Promise.resolve();
                }
            });
    }

    static transferOperation(context) {
        if (libCommon.getWorkOrderAssignmentType(context)!=='4' && libCommon.getWorkOrderAssignmentType(context)!=='A') {
            libMobile.setTransferStatus(context);
            libCommon.SetBindingObject(context);
            return this.showOperationTransferWarningMessage(context);
        } else {
            context.dismissActivityIndicator();
            return Promise.resolve();
        }
    }

    static completeOperation(context) {
        let pageContext = libMobile.getPageContext(context, workOrderOperationDetailsPage);
        let parent = this;
        let promises = [];
        const pageBinding = pageContext.getBindingObject();
        const equipment = pageBinding.OperationEquipment;
        return libChecklist.allowWorkOrderComplete(context, equipment).then(results => { //Check for non-complete checklists and ask for confirmation
            if (results === true) {
                return this.showOperationCompleteWarningMessage(context).then(
                    doMarkComplete => {
                        if (!doMarkComplete) {
                            // User elected not to mark this operation as complete
                            return '';
                        }
        
                        let binding = pageContext.getBindingObject();
                        let actionArgs = {
                            OperationId: binding.OperationNo,
                            WorkOrderId: binding.OrderId,
                            isOperationStatusChangeable: libMobile.isOperationStatusChangeable(context),
                            isHeaderStatusChangeable: libMobile.isHeaderStatusChangeable(context),
                        };
                        let action = new CompleteOperationMobileStatusAction(actionArgs);
                        pageContext.getClientData().confirmationArgs = {
                            doCheckOperationComplete: false,
                        };
                        // Add this action to client data for retrieval as needed
                        pageContext.getClientData().mobileStatusAction = action;
                        if (!action.didExecute) {
                            // Action has not been executed (possibly canceled confirmation create)
                            // Attempt to execute action to recover
                            promises.push(action.execute(pageContext));
                        } 
                        // Action did executed, update UI accordingly
                        promises.push(parent.showTimeCaptureMessage(pageContext, true));
                        return Promise.all(promises).then(() =>{
                            return parent.didSetOperationCompleteWrapper(pageContext);
                        }, () => {
                            return pageContext.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationMobileStatusFailureMessage.action');
                        });
                    });
            } else {
                return Promise.resolve(true);
            }
        });
    }

    static unconfirmOperation(context) {
        let pageContext = libMobile.getPageContext(context, workOrderOperationDetailsPage);
        let parent = this;

        return this.showUnconfirmOperationWarningMessage(context).then(
            doMarkUnconfirm => {
                if (!doMarkUnconfirm) {
                    //User chose not to unconfirm operation
                    return '';
                }

                let binding = pageContext.getBindingObject();
                let actionArgs = {
                    OperationId: binding.OperationNo,
                    WorkOrderId: binding.OrderId,
                };

                let action = new UnconfirmOperationMobileStatusAction(actionArgs);
                // Add this action to client data for retrieval as needed
                pageContext.getClientData().mobileStatusAction = action;

                return action.execute(pageContext).then(() => {
                    return parent.didSetOperationUnconfirm(pageContext);
                }, () => {
                    return pageContext.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationUnconfirmFailureMessage.action');
                });

            }
        );
    }

    static didSetOperationCompleteWrapper(context) {
        if (libMobile.isOperationStatusChangeable(context)) {
            return this.didSetOperationComplete(context); 
        } else if (libMobile.isHeaderStatusChangeable(context)) {
            return this.didSetOperationConfirm(context); 
        } else {
            return Promise.resolve();
        }
    }

    static didSetOperationComplete(context) {

        context.setToolbarItemCaption('IssuePartTbI', context.localizeText('complete_text'));
        libCommon.enableToolBar(context, workOrderOperationDetailsPage, 'IssuePartTbI', false);
        // Hide the action items
        HideActionItems(context, 2);

        libMobile.setCompleteStatus(context);
        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationMobileStatusSuccessMessage.action');
    }

    static didSetOperationConfirm(context) {
        context.setToolbarItemCaption('IssuePartTbI', context.localizeText('unconfirm'));
        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationConfirmSuccessMessage.action');
    }

    static didSetOperationUnconfirm(context) {
        context.setToolbarItemCaption('IssuePartTbI', context.localizeText('confirm'));
        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationUnconfirmSuccessMessage.action');
    }

    static operationStatusPopoverMenu(context) {
        let currentReadLink = context.binding['@odata.readLink'];
        if (libCommon.isCurrentReadLinkLocal(currentReadLink)) {
            // Local item, return early
            context.dismissActivityIndicator();
            return Promise.resolve('');            
        }
        var started = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
        /*
        * Header status is changable, attempt to complete the operation
        */
        if (libMobile.isHeaderStatusChangeable(context)) {
            return libMobile.mobileStatus(context, context.binding).then(() => {
                return libWOMobile.getWorkOrderMobileStatus(context).then(headerMobileStatus => {
                    if (headerMobileStatus === started) {
                        return libMobile.isMobileStatusConfirmed(context).then(result => {
                            if (result) {
                                return this.unconfirmOperation(context); 
                            } else {
                                return this.completeOperation(context);
                            }
                        });
                    }
                    context.dismissActivityIndicator();
                    return libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
                });
            });
        }
        /*
        * If operation is changable, return the appropriate pop over
        */
        if (libMobile.isOperationStatusChangeable(context)) {
            var startQueryOption = "$expand=MobileStatus&$filter=(MobileStatus/MobileStatus eq '" + started + "')"; 
            // Only get sibling operations, not all operations
            return context.read('/SAPAssetManager/Services/AssetManager.service', currentReadLink + '/WOHeader/Operations', [],
                startQueryOption).then(
                statuses => {
                    if (statuses) {
                        return context.read('/SAPAssetManager/Services/AssetManager.service', currentReadLink + '/MobileStatus', [],
                            '').then(
                            results => {
                                if (results) {
                                    var item = results.getItem(0);
                                    if (item) {
                                        let mobileStatus = item.MobileStatus;
                                        let oprAlreadyStarted = statuses.length > 0;
                                        var oprHold = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/HoldParameterName.global').getValue());
                                        var oprReceived = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue());
                                        
                                        if (oprAlreadyStarted && (mobileStatus === oprHold || mobileStatus === oprReceived)) {
                                            var pageContext = libMobile.getPageContext(context, workOrderOperationDetailsPage);
                                            return this.transferOperation(pageContext);
                                        } else if (mobileStatus === oprReceived) {
                                            context.dismissActivityIndicator();
                                            return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationChangeStausReceivePopover.action');
                                        } else if (mobileStatus === started) {
                                            context.dismissActivityIndicator();
                                            return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationChangeStausStartPopover.action');
                                        } else if (mobileStatus === oprHold) {
                                            context.dismissActivityIndicator();
                                            return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationChangeStausHoldPopover.action');
                                        }
                                    }
                                }
                                context.dismissActivityIndicator();
                                return '';
                            });
                    }
                    context.dismissActivityIndicator();
                    return '';
                },
                error => {
                    /**Implementing our Logger class*/
                    Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryOperations.global').getValue(),error);
                    return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationMobileStatusFailureMessage.action');
                });
        }
        
        /**
         * If the suboperation is changable, mobile status is not changable
         */
        if (libMobile.isSubOperationStatusChangeable(context)) {
            return context.executeAction('/SAPAssetManager/Actions/MobileStatus/MobileStatusNotChangeable.action');
        }
        return Promise.resolve('');
    }

    static showOperationTransferWarningMessage(context) {
        return libMobile.showWarningMessage(context, context.localizeText('transfer_operation_warning_message')).then(bool => {
            if (bool) {
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/Operations/OperationTransferNav.action');
            } else {
                return Promise.resolve(false);
            }
        });
    }

    static showOperationHoldWarningMessage(context) {
        return libMobile.showWarningMessage(context, context.localizeText('hold_operation_warning_message'));
    }

    static showOperationCompleteWarningMessage(context) {
        if (libMobile.isOperationStatusChangeable(context)) {
            return libMobile.showWarningMessage(context, context.localizeText('complete_operation_warning_message'));
        } else {
            return libMobile.showWarningMessage(context, context.localizeText('confirm_operation_warning_message'));
        }
    }

    static showUnconfirmOperationWarningMessage(context) {
        return libMobile.showWarningMessage(context, context.localizeText('unconfirm_operation_warning_message'));
    }

    static operationRollUpMobileStatus(context, entitySet) {
        let currentReadLink = libCommon.getTargetPathValue(context, '#Property:@odata.readLink');
        let isLocal = libCommon.isCurrentReadLinkLocal(currentReadLink);
        var status = '';
        if (!isLocal) {
            var orderID = libMobile.getOrderId(context);
            var started = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
            var hold = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/HoldParameterName.global').getValue());
            var complete = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
            return context.read('/SAPAssetManager/Services/AssetManager.service', entitySet, ['OperationNo','OrderId', 'ObjectKey'], "$filter=(OrderId eq '" + orderID + "')&$orderby=OrderId")
                .then(function(results) {
                    if (results) {
                        var oprCount = results.length;
                        if (oprCount > 0) {
                            var oprStartQueryOption = '$select=ObjectKey,MobileStatus&$orderby=ObjectKey,MobileStatus&$filter=';
                            var oprHoldQueryOption = '$select=ObjectKey,MobileStatus&$orderby=ObjectKey,MobileStatus&$filter=';
                            var oprCompleteQueryOption = '$select=ObjectKey,MobileStatus&$orderby=ObjectKey,MobileStatus&$filter=';
                            for (var i = 0; i < oprCount; i++) {
                                if (i > 0) {
                                    oprStartQueryOption = oprStartQueryOption + ' or ';
                                    oprHoldQueryOption = oprHoldQueryOption + ' or ';
                                    oprCompleteQueryOption = oprCompleteQueryOption + ' or ';
                                }
                                var item = results.getItem(i);
                                oprStartQueryOption = oprStartQueryOption + "(ObjectKey eq '" + item.ObjectKey + "' and MobileStatus eq '" + started + "')";
                                oprHoldQueryOption = oprHoldQueryOption + "(ObjectKey eq '" + item.ObjectKey + "' and MobileStatus eq '" + hold + "')";
                                oprCompleteQueryOption = oprCompleteQueryOption + "(ObjectKey eq '" + item.ObjectKey + "' and MobileStatus eq '" + complete + "')";
                            }
                            return context.read('/SAPAssetManager/Services/AssetManager.service', 'MobileStatuses', [], oprStartQueryOption)
                                .then(oprStartResults => {
                                    if (oprStartResults) {
                                        var oprStartCount = oprStartResults.length;
                                        if (oprStartCount > 0) {
                                            return started;
                                        }
                                    }
                                    return context.read('/SAPAssetManager/Services/AssetManager.service', 'MobileStatuses', [], oprHoldQueryOption)
                                        .then(oprHoldResults => {
                                            if (oprHoldResults) {
                                                var oprHoldCount = oprHoldResults.length;
                                                if (oprHoldCount > 0) {
                                                    return hold;
                                                }
                                            }
                                            return context.read('/SAPAssetManager/Services/AssetManager.service', 'MobileStatuses', [], oprCompleteQueryOption)
                                                .then(oprCompleteResults => {
                                                    if (oprCompleteResults) {
                                                        var oprCompleteCount = oprCompleteResults.length;
                                                        if (oprCompleteCount === oprCount) {
                                                            return complete;
                                                        }
                                                    }
                                                    return libMobile.mobileStatus(context, context.binding);
                                                }).catch(() => {
                                                    return libMobile.mobileStatus(context, context.binding);
                                                });
                                        }).catch(() => {
                                            return libMobile.mobileStatus(context, context.binding);
                                        });
                                }).catch(() => {
                                    return libMobile.mobileStatus(context, context.binding);
                                });
                        }
                    }
                    return libMobile.mobileStatus(context, context.binding);
                });
        } else {
            status = libCommon.getAppParam(context,'APPLICATION', 'LocalIdentifier');
        }
        return Promise.resolve(status);
    }

    static getOperationMobileStatus(context) {
        var pageContext = context.evaluateTargetPathForAPI('#Page:WorkOrderOperationDetailsPage');
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

    static showWorkOrderConfirmationMessage(context) {
        let message = context.localizeText('confirmations_add_time_message');
        return libMobile.showWarningMessage(context, message);
    }

    static showWorkOrderTimesheetMessage(context) {
        let message = context.localizeText('workorder_add_timesheet_message');
        return libMobile.showWarningMessage(context, message);
    }
}
