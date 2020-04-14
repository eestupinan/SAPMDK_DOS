import libCommon from '../../Common/Library/CommonLibrary';
import assnType from '../../Common/Library/AssignmentType';
import {PrivateMethodLibrary as operationPrivateLib} from '../../WorkOrders/Operations/WorkOrderOperationLibrary';
import {PrivateMethodLibrary as subOperationPrivateLib} from '../../SubOperations/SubOperationLibrary';

export default class {

    /**
     * No oneed to check for assignment type level, Because for work order create/update page. we always default from json, unless its edit
     * @param {*} controlProxy 
     */
    static getWorkOrderPageDefaultValue(controlProxy) {
        let binding = controlProxy.getPageProxy().binding;
        return binding && binding.MainWorkCenterPlant ? binding.MainWorkCenterPlant : assnType.getWorkOrderFieldDefault('WorkOrderHeader', 'WorkCenterPlant');
    }

    /**
     * For operation page, if on create and hier.level is 'Operation', get from json default, else default from parent
     * @param {*} controlProxy 
     */
    static getOperationPageDefaultValue(controlProxy) {
        let binding = controlProxy.getPageProxy().binding;
        let onCreate = libCommon.IsOnCreate(controlProxy.getPageProxy());
        if (onCreate) {
            let assnTypeLevel = libCommon.getWorkOrderAssnTypeLevel(controlProxy);
            if (assnTypeLevel === 'Operation') {
                let workcenter = assnType.getWorkOrderFieldDefault('WorkOrderOperation', 'WorkCenterPlant');
                if (libCommon.isDefined(workcenter)) {
                    return workcenter;
                } else {
                    return '';
                }
            } else {
                let onChangeSet = libCommon.isOnWOChangeset(controlProxy.getPageProxy());
                return operationPrivateLib._getParentWorkOrder(controlProxy.getPageProxy(), onChangeSet).then(parent => {
                    if (parent && parent.MainWorkCenterPlant) {
                        return parent.MainWorkCenterPlant;
                    }
                    return '';
                });
            }
        } else {
            return binding.MainWorkCenterPlant;
        }
    }

    /**
     * For sub operation page, if on create and hier.level is 'Operation', get from json default, else default from parent
     * @param {*} controlProxy 
     */
    static getSubOperationPageDefaultValue(controlProxy) {
        let binding = controlProxy.getPageProxy().binding;
        let onCreate = libCommon.IsOnCreate(controlProxy.getPageProxy());
        if (onCreate) {
            let assnTypeLevel = libCommon.getWorkOrderAssnTypeLevel(controlProxy);
            if (assnTypeLevel === 'SubOperation') { 
                return assnType.getWorkOrderFieldDefault('WorkOrderSubOperation', 'WorkCenterPlant');
            } else {
                return subOperationPrivateLib._getParentOperation(controlProxy.getPageProxy()).then(parent => {
                    if (parent && parent.MainWorkCenterPlant) {
                        return parent.MainWorkCenterPlant;
                    }
                    return '';
                });
            }
        } else {
            return binding.MainWorkCenterPlant;
        }
    }
}
