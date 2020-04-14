import libCommon from '../Common/Library/CommonLibrary';
import libVal from '../Common/Library/ValidationLibrary';
import libControlDescription from '../Common/Controls/DescriptionNoteControl';
import { SubOperationControlLibrary as libSubOpControl, PrivateMethodLibrary as libPrivate } from './SubOperationLibrary';
import Logger from '../Log/Logger';

export class SubOperationLibrary {

    /**
     * get the SubOperation Long Text string
     * @param {*} pageProxy 
     */
    static getSubOperationLongText(pageProxy) {
        return libCommon.getLongText(pageProxy.binding.SubOperationLongText);
    }

    /**
     * Dynamically set the CreateLinks of the WorkOrder
     * @param {IPageProxy} 
     * @return {Array} array of create update links
     */
    static getCreateUpdateLinks(pageProxy) {
        var links = [];
        let onCreate = libCommon.IsOnCreate(pageProxy);

        return libPrivate._getParentOperation(pageProxy).then(parentOperation => {
            // if on create, we will need to add the folllowing link to link it to parent
            if (onCreate) {
                let opReadLink = parentOperation['@odata.readLink'];
                if (opReadLink === undefined) {
                    opReadLink = libSubOpControl.getOperation(pageProxy);
                }
                let woLink = pageProxy.createLinkSpecifierProxy(
                    'WorkOrderOperation',
                    'MyWorkOrderOperations',
                    '',
                    opReadLink
                );
                links.push(woLink.getSpecifier());
            }

            //check Equipment ListPicker, if value is set, add Equipment link
            let equipment = libSubOpControl.getEquipment(pageProxy);
            if (equipment && equipment !== '') {
                let equipmentLink = pageProxy.createLinkSpecifierProxy(
                    'EquipmentSubOperation',
                    'MyEquipments',
                    `$filter=EquipId eq '${equipment}'`
                );
                links.push(equipmentLink.getSpecifier());
            }

            //check Functional Location ListPicker, if value is set, add Func Loc link
            let funcLoc = libSubOpControl.getFunctionalLocation(pageProxy);
            if (funcLoc && funcLoc !== '') {
                let funcLocLink = pageProxy.createLinkSpecifierProxy(
                    'FunctionalLocationSubOperation',
                    'MyFunctionalLocations',
                    `$filter=FuncLocIdIntern eq '${funcLoc}'`
                );
                links.push(funcLocLink.getSpecifier());
            }

            return links;
        });
    }

    /**
     * Dynamically set the delete of the WorkOrder
     * @param {IPageProxy} 
     * @return {Array} array of create update links
     */
    static getDeleteLinks(pageProxy) {
        var links = [];

        //check Equipment ListPicker, if value is set, add Equipment link
        let equipment = libSubOpControl.getEquipment(pageProxy);
        if (!equipment && pageProxy.binding.EquipmentSubOperation) {
            let equipmentLink = pageProxy.createLinkSpecifierProxy(
                'EquipmentSubOperation',
                'MyEquipments',
                '',
                pageProxy.binding.EquipmentSubOperation['@odata.readLink']
            );
            links.push(equipmentLink.getSpecifier());
        }

        //check Functional Location ListPicker, if value is set, add Func Loc link
        let funcLoc = libSubOpControl.getFunctionalLocation(pageProxy);
        if (!funcLoc && pageProxy.binding.FunctionalLocationSubOperation) {
            let funcLocLink = pageProxy.createLinkSpecifierProxy(
                'FunctionalLocationSubOperation',
                'MyFunctionalLocations',
                '',
                pageProxy.binding.FunctionalLocationSubOperation['@odata.readLink']
            );
            links.push(funcLocLink.getSpecifier());
        }

        return links;
    }
}

export class SubOperationEventLibrary {

    /**
     * Trigger during PageLoad
     * @param {IPageProxy} pageProxy 
     */
    static createUpdateOnPageLoad(pageProxy) {
        if (!pageProxy.getClientData().LOADED) {
            //Determine if we are on edit vs. create
            let onCreate = libCommon.IsOnCreate(pageProxy);
            this.createUpdateVisibility(pageProxy, onCreate);

            if (onCreate) {
                //Get title
                let title = pageProxy.localizeText('add_suboperation');
                pageProxy.setCaption(title);

                this.setDefaultValues(pageProxy, onCreate);
            } else {
                let title = pageProxy.localizeText('edit_suboperation');
                pageProxy.setCaption(title);
            }
        } 

        pageProxy.getClientData().LOADED = true;
        return true;
    }

    /**
     * validation rule of Operation Create/Update action
     * 
     * @static
     * @param {IPageProxy} pageProxy 
     * @return {Boolean}
     * 
     * @memberof WorkOrderEventLibrary
     */
    static createUpdateValidationRule(pageProxy) {
        let valPromises = [];

        // get all of the validation promises
        valPromises.push(libControlDescription.validationCharLimit(pageProxy));

        // check all validation promises;
        // if all resolved -> return true
        // if at least 1 rejected -> return false
        return Promise.all(valPromises).then(() => {
            return true;
        }).catch(() => {
            let container = pageProxy.getControl('FormCellContainer');
            container.redraw();
            return false;
        });
    }

    /**
     * Trigger during Page Unload
     * Note: unload actually triggered everytime you go back to the page from ListPicker
     * @param {IPageProxy} pageProxy 
     */
    static createUpdateOnPageUnloaded() {

    }

    /**
     * Trigger by control, when it has binding to the following OnChange method
     * @param {IControlProxy} controlProxy 
     */
    static createUpdateOnChange(controlProxy) {
        if (controlProxy.getPageProxy().getClientData().LOADED && !controlProxy.getClientData().SetValueFromRule) {
            let name = controlProxy.getName();

            switch (name) {
                case 'FunctionalLocationLstPkr':
                    libSubOpControl.updateEquipment(controlProxy.getPageProxy());
                    break;
                case 'EquipmentLstPkr':
                    libSubOpControl.updateFloc(controlProxy.getPageProxy());
                    break;
                case 'ControlKeyLstPkr':
                    break;
                case 'WorkCenterLstPkr':
                    break;
                case 'WorkCenterPlantLstPkr':
                    break;
                default:
                    break;
            }

            if (!libVal.evalIsEmpty(controlProxy.getValue())) {
                controlProxy.clearValidation();
            }
        } else {
            controlProxy.getClientData().SetValueFromRule = false;
        }
    }

    /**
     * Set the visible state of the fields
     * @param {IPageProxy} pageProxy 
     * @param {boolean} isOnCreate 
     */
    static createUpdateVisibility(pageProxy, isOnCreate) {
        let noteNoteControl = pageProxy.getControl('FormCellContainer').getControl('LongTextNote');
        noteNoteControl.setVisible(isOnCreate);
    }

    /**
     * Dynamically bind the queryoptions to the controls
     * @param {IControlProxy} controlProxy 
     */
    static createUpdateControlsQueryOptions(controlProxy) {
        try {
            let controlName = controlProxy.getName();
            var result = '';

            // Based on the control we are on, return the right query or list items accordingly
            switch (controlName) {
                case 'FunctionalLocationLstPkr':
                    result = '$orderby=FuncLocIdIntern';
                    break;
                case 'EquipmentLstPkr': {
                    let equipId = libCommon.getTargetPathValue(controlProxy, '#Property:OperationEquipment');                   
                    let funcLoc = libCommon.getTargetPathValue(controlProxy, '#Property:OperationFunctionLocation');
                    if (equipId && equipId !== '') {
                        result = "$filter=EquipId eq '" + equipId + "'";
                    } else if (funcLoc !== null && funcLoc !== '') {
                        result = "$filter=FuncLocId eq '" + funcLoc + "'&$orderby=EquipId";
                    } else {
                        result = '$orderby=EquipId';
                    }
                    break; 
                }   
                case 'ControlKeyLstPkr': 
                    result = '$orderby=ControlKeyDescription';
                    break; 
                default:
                    break;
            }
            
        } catch (err) {		
            /**Implementing our Logger class*/		
            Logger.error(controlProxy.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategorySubOperations.global').getValue(), err);		
        }
        return result;
    }


    static createUpdateControlsPickerItems(controlProxy) {
        try {
            let controlName = controlProxy.getName();
            var result = '';

            //var that tells if we are on create
            let assignmentType = libCommon.getWorkOrderAssignmentType(controlProxy.getPageProxy());
            return libPrivate._getParentOperation(controlProxy.getPageProxy()).then(() => {
                // Based on the control we are on, return the right query or list items accordingly
                switch (controlName) {
                    case 'WorkCenterPlantLstPkr':
                        {
                            let entityRead = null;
                            switch (assignmentType) {
                                case '1':
                                case '2':
                                case '3':
                                case '4':
                                case '5':
                                case '6':
                                case '7':
                                case '8':
                                    {
                                        entityRead = controlProxy.read(
                                            '/SAPAssetManager/Services/AssetManager.service',
                                            'WorkCenters',
                                            [],
                                            '');
                                        break;
                                    }
                                default:
                                    //default is assignmentType 8
                                    entityRead = controlProxy.read(
                                        '/SAPAssetManager/Services/AssetManager.service',
                                        'WorkCenters',
                                        [],
                                        '');
                                    break;
                            }
                            return entityRead.then(function(obArray) {
                                var jsonResult = [];
                                obArray.forEach(function(element) {
                                    jsonResult.push(
                                        {
                                            'DisplayValue': `${element.PlantId} - ${element.WorkCenterName}`,
                                            'ReturnValue': element.PlantId,
                                        });
                                });
                                const uniqueSet = new Set(jsonResult.map(item => JSON.stringify(item)));
                                let finalResult = [...uniqueSet].map(item => JSON.parse(item));
                                return finalResult;
                            });
                        }
                    default:
                        return result;
                }
            });
        } catch (err) {
            /**Implementing our Logger class*/
            Logger.error(controlProxy.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategorySubOperations.global').getValue(), err);
        }
        return result;
    }

    /**
     * Trigger when user hit save button
     * @param {IPageProxy} pageProxy 
     */
    static createUpdateOnCommit(pageProxy) {
        //Determine if we are on edit vs. create
        let onCreate = libCommon.IsOnCreate(pageProxy);

        if (onCreate) {
            return pageProxy.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationCreate.action');
        } else {
            return pageProxy.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationUpdate.action');
        }
    }

    /**
     * Set the default value when its on create mode
     * @param {IPageProxy} pageProxy 
     * @param {boolean} onCreate
     */
    static setDefaultValues(pageProxy, onCreate) {
        try {
            //get controls
            let container = pageProxy.getControl('FormCellContainer');
            let controlKey = container.getControl('ControlKeyLstPkr');
            
            if (onCreate) {
                libPrivate._getParentOperation(pageProxy).then(parentOperation => {
                    controlKey.setValue(parentOperation.ControlKey);
                    controlKey.getClientData().SetValueFromRule = true;
                    pageProxy.getClientData().DefaultValuesLoaded = true;
                });
            }
        } catch (err) {
            /**Implementing our Logger class*/
            Logger.error(pageProxy.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategorySubOperations.global').getValue(), 'Error: setDefaultValues - ' + err);
        }
    }


}

export class SubOperationControlLibrary {

    static getPersonNum(pageProxy) {
        let assignmentType = libCommon.getWorkOrderAssignmentType(pageProxy);

        if (assignmentType === '3') {
            return libCommon.getPersonnelNumber();
        } else {
            return '';
        }
    }

    /**
     * Funcational Location getter
     * @param {IPageProxy} pageProxy 
     */
    static getFunctionalLocation(pageProxy) {
        let funcLoc = libCommon.getTargetPathValue(pageProxy, '#Control:FunctionalLocationLstPkr/#Value');
        return libCommon.getListPickerValue(funcLoc);
    }

    /**
     * Equipment getter
     * @param {IPageProxy} pageProxy 
     */
    static getEquipment(pageProxy) {
        let equipHeader = libCommon.getTargetPathValue(pageProxy, '#Control:EquipmentLstPkr/#Value');
        return libCommon.getListPickerValue(equipHeader);
    }

    /**
     * ControlKey getter
     * @param {IPageProxy} pageProxy 
     */
    static getControlKey(pageProxy) {
        let controlKey = libCommon.getTargetPathValue(pageProxy, '#Control:ControlKeyLstPkr/#Value');
        return libCommon.getListPickerValue(controlKey);
    }

    /**
     * WorkCenterPlant getter
     * @param {IPageProxy} pageProxy 
     */
    static getWorkCenterPlant(pageProxy) {
        let workCenterPlant = libCommon.getTargetPathValue(pageProxy, '#Control:WorkCenterPlantLstPkr/#Value');
        return libCommon.getListPickerValue(workCenterPlant);
    }

    /**
     * MainWorkCenter getter
     * @param {IPageProxy} pageProxy 
     */
    static getMainWorkCenter(pageProxy) {
        let workCenter = libCommon.getTargetPathValue(pageProxy, '#Control:WorkCenterLstPkr/#Value');
        return libCommon.getListPickerValue(workCenter);
    }

    /**
     * Update Equipment control
     * @param {IPageProxy} pageProxy 
     */
    static updateEquipment(pageProxy) {
        try {
            let formCellContainer = pageProxy.getControl('FormCellContainer');

            let funcLocControlValue = formCellContainer.getControl('FunctionalLocationLstPkr').getValue();
            let equipmentControl = formCellContainer.getControl('EquipmentLstPkr');
            var equipmentCtrlSpecifier = equipmentControl.getTargetSpecifier();
            if (funcLocControlValue && libCommon.getListPickerValue(funcLocControlValue) !== '') {
                equipmentCtrlSpecifier.setQueryOptions("$filter=FuncLocIdIntern eq '" + libCommon.getListPickerValue(funcLocControlValue) + "'&$orderby=EquipId");
            } else {
                equipmentCtrlSpecifier.setQueryOptions('$orderby=EquipId');
            }
            equipmentControl.setTargetSpecifier(equipmentCtrlSpecifier);
        } catch (err) {
            /**Implementing our Logger class*/
            Logger.error(pageProxy.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategorySubOperations.global').getValue(), `UpdateEquipment Error: ${err}`);
        }
    }

    /**
     * Update Functional Location control
     * @param {IPageProxy} pageProxy 
     */
    static updateFloc(pageProxy) {
        try {
            let formCellContainer = pageProxy.getControl('FormCellContainer');
            let funcLocControl = formCellContainer.getControl('FunctionalLocationLstPkr');
            let funcLocCtrlSpecifier = funcLocControl.getTargetSpecifier();

            let equipmentControlValue = formCellContainer.getControl('EquipmentLstPkr').getValue();
            if (equipmentControlValue && libCommon.getListPickerValue(equipmentControlValue) !== '') {
                return pageProxy.read('/SAPAssetManager/Services/AssetManager.service', 'MyEquipments', ['FuncLocId'], `$filter=EquipId eq '${libCommon.getListPickerValue(equipmentControlValue)}'&$expand=FunctionalLocation&$orderby=EquipId`).then( results => {
                    if (results.length > 0 && results.getItem(0).FuncLocId) {
                        funcLocControl.setValue(results.getItem(0).FuncLocId, false);
                    }
                    return funcLocControl.setTargetSpecifier(funcLocCtrlSpecifier);
                });
            }
        } catch (err) {
            /**Implementing our Logger class*/
            Logger.error(pageProxy.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(),`UpdateFloc Error: ${err}`);
        }
        return '';
    }

    /**
     * Get OperatonNumber for SubOperation
     * from control, or parent, if necessary
     * @param {IPageProxy} pageProxy
     */
    static getOperationNo(pageProxy) {
        if (pageProxy.getClientData().ParentOperation) {
            return pageProxy.getClientData().ParentOperation.OperationNo;
        } else {
            let formCellContainer = pageProxy.getControl('FormCellContainer');
            let opControlValue = formCellContainer.getControl('OperationLstPkr').getValue();
            let operationReadLink = libCommon.getListPickerValue(opControlValue);
            return pageProxy.read('/SAPAssetManager/Services/AssetManager.service', operationReadLink, [], '')
                        .then(operation => {
                            return operation.getItem(0).OperationNo;
                        });
                    
        }

    }

    /**
     * WorkOrderParent getter
     * @param {IPageProxy} pageProxy 
     */
    static getWorkOrder(pageProxy) {
        let wo = libCommon.getTargetPathValue(pageProxy, '#Control:WorkOrderLstPkr/#Value');
        return libCommon.getListPickerValue(wo);
    }


    /**
     * WorkOrderParent getter
     * @param {IPageProxy} pageProxy 
     */
    static getOperation(pageProxy) {
        let op = libCommon.getTargetPathValue(pageProxy, '#Control:OperationLstPkr/#Value');
        return libCommon.getListPickerValue(op);
    }    
}

export class PrivateMethodLibrary {

    static _getParentOperation(context) {
        try {
            if (context.getClientData().ParentOperation) {
                return Promise.resolve(context.getClientData().ParentOperation);
            } else {
                let operationReadLink = libCommon.getTargetPathValue(context, '#Property:@odata.readLink');
                if (operationReadLink !== '') {
                    return context.read('/SAPAssetManager/Services/AssetManager.service', operationReadLink, [], '')
                        .then(parentOp => {
                            context.getClientData().ParentOperation = parentOp.getItem(0);
                            return parentOp.getItem(0);
                        });
                    } else {
                        return Promise.resolve('');
                    }
            }
        } catch (err) {
            /**Implementing our Logger class*/
            Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategorySubOperations.global').getValue(), 'Error: _getParentOperation - ' + err);
            return Promise.reject(err);
        }

    }

    static _getParentWorkOrder(context) {
        if (context.getClientData().ParentWorkOrder) {
            return Promise.resolve(context.getClientData().ParentWorkOrder);
        } else {
            let woReadLink = '';
            let onCreate = libCommon.IsOnCreate(context);
            if (onCreate) {
                woReadLink = context.binding['@odata.readLink'] + '/WOHeader';
            } else {
                woReadLink = context.binding.WorkOrderOperation.WOHeader['@odata.readLink'];
            }
            
            if (context.binding['@odata.readLink'] !== undefined) {
                return context.read('/SAPAssetManager/Services/AssetManager.service', woReadLink, [], '')
                    .then(workOrder => {
                        context.getClientData().ParentWorkOrder = workOrder.getItem(0);
                        return workOrder.getItem(0);
                    });
                } else {
                    return Promise.resolve('');
                }
            }
    }
}
