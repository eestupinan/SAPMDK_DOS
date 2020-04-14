import libCommon from '../Common/Library/CommonLibrary';
import libEval from '../Common/Library/ValidationLibrary';
import QueryBuilder from '../Common/Query/QueryBuilder';
import MobileStatusCompleted from './MobileStatusCompleted';
import FetchRequest from '../Common/Query/FetchRequest';

export default class {

    static getObjectKey(context) {
        return libCommon.getTargetPathValue(context, '#Property:ObjectKey');
    }

    static getPageContext(context, page) {
        return context.evaluateTargetPathForAPI('#Page:' + page);
    }

    static isHeaderStatusChangeable(context) {
        var assignmentType = libCommon.getWorkOrderAssignmentType(context);
        switch (assignmentType) {
            case '1':
                return true;
            case '2':
                return false;
            case '3':
                return false;
            case '4':
                return false;
            case '5':
                return true;
            case '6':
                return false;
            case '7':
                return true;
            case '8':
                return true;
            case 'A':
                return false;
            default:
                return false;
        }
    }

    static isNotifHeaderStatusChangeable(context) {
        var assignmentType = libCommon.getNotificationAssignmentType(context);
        switch (assignmentType) {
            case '1':
                return true;
            case '2':
                return true;
            case '3':
                return true;
            case '4':
                return false;
            case '5':
                return true;
            case '6':
                return false;
            case '7':
                return false;
            case '8':
                return false;
            case 'A':
                return false;
            default:
                return false;
        }
    }

    static isOperationStatusChangeable(context) {
        var assignmentType = libCommon.getWorkOrderAssignmentType(context);
        switch (assignmentType) {
            case '1':
                return false;
            case '2':
                return true;
            case '3':
                return false;
            case '4':
                return true;
            case '5':
                return false;
            case '6':
                return true;
            case '7':
                return false;
            case '8':
                return false;
            case 'A':
                return true;
            default:
                return false;
        }
    }

    static isSubOperationStatusChangeable(context) {
        var assignmentType = libCommon.getWorkOrderAssignmentType(context);
        switch (assignmentType) {
            case '1':
                return false;
            case '2':
                return false;
            case '3':
                return true;
            case '4':
                return false;
            case '5':
                return false;
            case '6':
                return false;
            case '7':
                return false;
            case '8':
                return false;
            case 'A':
                return false;
            default:
                return false;
        }
    }

    static setStartStatus(context) {
        var clientData = context.getClientData();
        clientData.ChangeStatus = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
    }

    static setHoldStatus(context) {
        var clientData = context.getClientData();
        clientData.ChangeStatus = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/HoldParameterName.global').getValue());
    }

    static setTransferStatus(context) {
        var clientData = context.getClientData();
        clientData.ChangeStatus = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/TransferParameterName.global').getValue());
    }

    static setCompleteStatus(context) {
        var clientData = context.getClientData();
        clientData.ChangeStatus = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
    }

    static setSuccessStatus(context) {
        var clientData = context.getClientData();
        clientData.ChangeStatus = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/SuccessParameterName.global').getValue());
    }

    static refreshPage(context) {
        if (context) {
            if (context.getControls()) {
                var controls = context.getControls();
                for (var i = 0; i < controls.length; i++) {
                    this.redraw(controls[i]);
                }
            }
        }
    }

    static refreshPreviousPage(context, page) {
        let pageProxy = context.evaluateTargetPathForAPI('#Page:' + page);
        this.refreshPage(pageProxy);
    }

    static redraw(control) {
        control.redraw();
    }

    static showWarningMessage(context, messageText, captionText = context.localizeText('confirm_status_change'), okButtonText = context.localizeText('ok'), cancelButtonText = context.localizeText('cancel_button_text')) {
        context.dismissActivityIndicator();
        if (!context.getPageProxy) {
            context.getClientData().DialogMessage = messageText;
            context.getClientData().DialogTitle = captionText;
            context.getClientData().DialogOkCaption = okButtonText;
            context.getClientData().DialogCancelCaption = cancelButtonText;
        } else {
            context.getPageProxy().getClientData().DialogMessage = messageText;
            context.getPageProxy().getClientData().DialogTitle = captionText;
            context.getPageProxy().getClientData().DialogOkCaption = okButtonText;
            context.getPageProxy().getClientData().DialogCancelCaption = cancelButtonText;
        }
        return context.executeAction('/SAPAssetManager/Actions/Common/GenericWarningDialog.action').then(result => {
            return result.data;
        });
    }

    static getOrderId(context) {
        return libCommon.getTargetPathValue(context, '#Property:OrderId');
    }

    static markedJobsListMobileStatus(context, binding) {
        let currentReadLink = binding.WorkOrderHeader['@odata.readLink'];
        let isLocal = libCommon.isCurrentReadLinkLocal(currentReadLink);
        var status = '';
        if (!isLocal) {
            if (binding && binding.WorkOrderHeader && binding.WorkOrderHeader.MobileStatus.MobileStatus) {
                status = binding.WorkOrderHeader.MobileStatus.MobileStatus;
            } else if (binding && binding.WorkOrderHeader && binding.WorkOrderHeader.MobileStatus) {
                status = binding.WorkOrderHeader.MobileStatus;
            }
        } else {
            status = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue());
        }
        return status;
    }

    static mobileStatus(context) {
        let currentReadLink = libCommon.getTargetPathValue(context, '#Property:@odata.readLink');
        let isLocal = libCommon.isCurrentReadLinkLocal(currentReadLink);
        if (!isLocal) {
            return context.read('/SAPAssetManager/Services/AssetManager.service', context.binding['@odata.readLink'], [], '$expand=MobileStatus&$select=MobileStatus/MobileStatus').then(status => {
                if (status) {
                    var getMobileStatus = status.getItem(0);
                    return getMobileStatus.MobileStatus.MobileStatus;
                } else {
                    return '';
                }
            });
        } 
        return Promise.resolve(libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue()));
    }

    static mobileStatusCount(context, binding, queryOptions) {
        return context.count('/SAPAssetManager/Services/AssetManager.service', binding['@odata.readLink'] + '/MobileStatuses', queryOptions);
    }

    static isMobileStatusConfirmed(context, SubOperation) {

        let binding = context.getBindingObject();

        let queryBuilder = new QueryBuilder();
        queryBuilder.addSelectStatement('FinalConfirmation');
        queryBuilder.addFilter(`OrderID eq '${binding.OrderId}'`);
        queryBuilder.addFilter(`Operation eq '${binding.OperationNo}'`);

        if (SubOperation) {
            queryBuilder.addFilter(`SubOperation eq '${SubOperation}'`);
        } else {
            queryBuilder.addFilter("SubOperation eq ''");
        }
        queryBuilder.addExtra('orderby=ConfirmationCounter desc');
        queryBuilder.addExtra('top=1');

        let request = new FetchRequest('Confirmations', queryBuilder.build());

        return request.execute(context).then(result => {
    
            if (result && result.length > 0) {
                let confirmation = result.getItem(0);
                if (confirmation && confirmation.FinalConfirmation) {
                    return confirmation.FinalConfirmation === 'X';
                }
            }
            return false;
        });
    }

    static getQueryOptionsForCompletedStatusForOperations(context, orderId) {
        let binding = context.getBindingObject();
        let queryBuilder = new QueryBuilder();

        queryBuilder.addFilter(`OrderId eq '${orderId}'`);
        queryBuilder.addAllSelectStatements(['OperationNo', 'OperationShortText']);

        if (this.isOperationStatusChangeable(context)) {
            queryBuilder.addExpandStatement('MobileStatus');
            if (!libEval.evalIsEmpty(binding.Operation)) {
                queryBuilder.addFilter(`OperationNo eq '${binding.Operation}'`);
            } else {
                queryBuilder.addFilter(`MobileStatus/MobileStatus ne '${MobileStatusCompleted(context)}'`);
            }
            return queryBuilder.build();
        } else { //Header level assignment type so need to check for confirmed status
            return this.getAllConfirmationsForWorkorderForOperation(context, orderId).then(allConfirmations => {
                let grouped = this.groupByOperation(allConfirmations, confirmation => confirmation.Operation);
                let iterator1 = grouped[Symbol.iterator]();

                for (let [key, value] of iterator1) {
                    if (value.FinalConfirmation === 'X') {
                        if (binding.Operation === key) { //During confirmation edit we do not want to exclude the current operation
                            queryBuilder.addFilter(`OperationNo eq '${key}'`);   
                        }
                    }
                }
                queryBuilder.addExtra('orderby=OperationNo');
                return queryBuilder.build();
            });  
        }
    }

    static getStatusForOperations(context, orderId) {
        let queryBuilder = new QueryBuilder();

        queryBuilder.addFilter(`OrderId eq '${orderId}'`);

        return this.getAllConfirmationsForWorkorderForOperation(context, orderId).then(allConfirmations => {
            let grouped = this.groupByOperation(allConfirmations, confirmation => confirmation.Operation);
            let iterator1 = grouped[Symbol.iterator]();

            for (let [key, value] of iterator1) {
                if (value.FinalConfirmation === 'X') {
                    queryBuilder.addFilter(`OperationNo ne '${key}'`);
                }
            }
            return queryBuilder.build();
        });  
    }

    static getQueryOptionsForCompletedStatusForSuboperations(context, orderId, operation) {
        let binding = context.binding;        
        let queryBuilder = new QueryBuilder();

        queryBuilder.addFilter(`OrderId eq '${orderId}'`);
        queryBuilder.addFilter(`OperationNo eq '${operation}'`);
        queryBuilder.addExtra('orderby=SubOperationNo');

        if (this.isSubOperationStatusChangeable(context)) { //check for subop completed status
            queryBuilder.addExpandStatement('MobileStatus');
            if (!libEval.evalIsEmpty(binding.SubOperation)) {
                queryBuilder.addFilter(`SubOperationNo eq '${binding.SubOperation}'`);
            } else {
                queryBuilder.addFilter(`MobileStatus/MobileStatus ne '${MobileStatusCompleted(context)}'`);
            }
            return new Promise((resolve, reject) => {
                try {
                    return resolve(queryBuilder.build());
                } catch (error) {
                    return reject('');
                }
            });
        } else { // check for confirmed status of suboperations
            return this.getAllConfirmationsForWorkorderForSubOperation(context, orderId, operation).then(allConfirmations => {
                let grouped = this.groupByOperation(allConfirmations, confirmation => confirmation.SubOperation);
                let iterator1 = grouped[Symbol.iterator]();
    
                for (let [key, value] of iterator1) {
                    if (value.FinalConfirmation === 'X') {
                        if (binding.SubOperation === key) { //During confirmation edit we do not want to exclude the current suboperation
                            queryBuilder.addFilter(`SubOperationNo eq '${key}'`);   
                        }
                    }
                }
                return queryBuilder.build();
            }); 
        }

    }

    static getStatusForSubOperations(context, orderId, operationNo) {    
        let queryBuilder = new QueryBuilder();

        queryBuilder.addFilter(`OrderId eq '${orderId}'`);
        queryBuilder.addFilter(`OperationNo eq '${operationNo}'`);

        return this.getAllConfirmationsForWorkorderForSubOperation(context, orderId, operationNo).then(allConfirmations => {
            let grouped = this.groupByOperation(allConfirmations, confirmation => confirmation.SubOperation);
            let iterator1 = grouped[Symbol.iterator]();

            for (let [key, value] of iterator1) {
                if (value.FinalConfirmation === 'X') {
                    queryBuilder.addFilter(`SubOperationNo ne '${key}'`);
                }
            }
            return queryBuilder.build();
        });   
    }

    static groupByOperation(confirmations, keyProperty) {
        let map = new Map();
        confirmations.forEach((confirmation) => {
            let operationNo = keyProperty(confirmation);
            let existingConfirmation = map.get(operationNo);
            if (!existingConfirmation) { //no confirmation exist for this operation so add it
                map.set(operationNo, confirmation);
            } else { //multiple confirmations for this operation
                let counter = parseInt(confirmation.ConfirmationCounter);
                let existingCounter = parseInt(existingConfirmation.ConfirmationCounter);
                if (counter > existingCounter) {
                    map.set(operationNo, confirmation);
                }
            }
        });
        return map;
    }

    static getAllConfirmationsForWorkorderForOperation(context, orderId) {
        let queryBuilder = new QueryBuilder();
        queryBuilder.addFilter(`OrderID eq '${orderId}'`);
        queryBuilder.addFilter("SubOperation eq ''");

        let request = new FetchRequest('Confirmations', queryBuilder.build());

        return request.execute(context).then(result => {
            let confirmations = [];
            result.forEach(item => {
                confirmations.push(item);
            });
            return confirmations;
        });
    }

    static getAllConfirmationsForWorkorderForSubOperation(context, orderId, operationNo) {
        let queryBuilder = new QueryBuilder();
        queryBuilder.addFilter(`OrderID eq '${orderId}'`);
        queryBuilder.addFilter(`Operation eq '${operationNo}'`);  
        queryBuilder.addFilter("SubOperation ne ''");

        let request = new FetchRequest('Confirmations', queryBuilder.build());

        return request.execute(context).then(result => {
            let confirmations = [];
            result.forEach(item => {
                confirmations.push(item);
            });
            return confirmations;
        });
    }
    
    static isMobileStatusComplete(context, entitySet, orderId, operation) {
        let queryBuilder = new QueryBuilder();

        queryBuilder.addFilter(`OrderId eq '${orderId}'`);

        if (operation) {
            queryBuilder.addFilter(`OperationNo eq '${operation}'`);
        }
        
        queryBuilder.addExpandStatement('MobileStatus');
        let fetchRequest = new FetchRequest(entitySet, queryBuilder.build());

        return fetchRequest.execute(context).then(result => {
            let wo = result.getItem(0);
            if (wo.MobileStatus.MobileStatus === MobileStatusCompleted(context)) {
                return true;
            }
            return false;
        });
    }
}
