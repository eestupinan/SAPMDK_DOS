import libCommon from '../../Common/Library/CommonLibrary';
import Stylizer from '../../Common/Style/Stylizer';
import libVal from '../../Common/Library/ValidationLibrary';
import libControlDescription from '../../Common/Controls/DescriptionNoteControl';
import Logger from '../../Log/Logger';
import OpCreateSuccess from '../Operations/CreateUpdate/WorkOrderOperationBatchCreate';
import { OperationControlLibrary as libOperationControl, PrivateMethodLibrary as libPrivate } from './WorkOrderOperationLibrary';

/**
 * Contains the methods that are general to Operation
 */
export class OperationLibrary {

    /**
     * Dynamically set the CreateLinks of the WorkOrder
     * @param {IPageProxy} 
     * @return {Array} array of create update links
     */
    static getCreateUpdateLinks(pageProxy) {
        var links = [];

        let onCreate = libCommon.IsOnCreate(pageProxy);
        let onChangeSet = libCommon.isOnChangeset(pageProxy);
        let onWOChangeSet = libCommon.isOnWOChangeset(pageProxy);
        let parentWorkOrderPromise = libPrivate._getParentWorkOrder(pageProxy, onWOChangeSet);
        if (libCommon.isDefined(libOperationControl.getWorkOrder(pageProxy))) {
            if (onCreate) {
                if (onChangeSet && onWOChangeSet) {
                    let woLink = pageProxy.createLinkSpecifierProxy(
                        'WOHeader',
                        'MyWorkOrderHeaders',
                        '',
                        'pending_1'
                    );
                    links.push(woLink.getSpecifier());
                } else {
                    let woReadLink = libOperationControl.getWorkOrder(pageProxy);
                    let woLink = pageProxy.createLinkSpecifierProxy(
                        'WOHeader',
                        'MyWorkOrderHeaders',
                        '',
                        woReadLink
                    );
                    links.push(woLink.getSpecifier());
                }
            }

            //check Equipment ListPicker, if value is set, add Equipment link
            let equipment = libOperationControl.getEquipment(pageProxy);
            if (!libVal.evalIsEmpty(equipment)) {
                let equipmentLink = pageProxy.createLinkSpecifierProxy(
                    'EquipmentOperation',
                    'MyEquipments',
                    `$filter=EquipId eq '${equipment}'`
                );
                links.push(equipmentLink.getSpecifier());
            }

            //check Functional Location ListPicker, if value is set, add Func Loc link
            let funcLoc = libOperationControl.getFunctionalLocation(pageProxy);
            if (!libVal.evalIsEmpty(funcLoc)) {
                let funcLocLink = pageProxy.createLinkSpecifierProxy(
                    'FunctionalLocationOperation',
                    'MyFunctionalLocations',
                    `$filter=FuncLocIdIntern eq '${funcLoc}'`
                );
                links.push(funcLocLink.getSpecifier());
            }

            return links;
        } else {
            return parentWorkOrderPromise.then(parentWorkOrder => {
                // if on workorder create, we will need to add the folllowing link
                if (onCreate) {
                    if (onChangeSet && onWOChangeSet) {
                        let woLink = pageProxy.createLinkSpecifierProxy(
                            'WOHeader',
                            'MyWorkOrderHeaders',
                            '',
                            'pending_1'
                        );
                        links.push(woLink.getSpecifier());
                    } else {
                        let woReadLink = parentWorkOrder['@odata.readLink'];
                        let woLink = pageProxy.createLinkSpecifierProxy(
                            'WOHeader',
                            'MyWorkOrderHeaders',
                            '',
                            woReadLink
                        );
                        links.push(woLink.getSpecifier());
                    }
                }
    
                //check Equipment ListPicker, if value is set, add Equipment link
                let equipment = libOperationControl.getEquipment(pageProxy);
                if (!libVal.evalIsEmpty(equipment)) {
                    let equipmentLink = pageProxy.createLinkSpecifierProxy(
                        'EquipmentOperation',
                        'MyEquipments',
                        `$filter=EquipId eq '${equipment}'`
                    );
                    links.push(equipmentLink.getSpecifier());
                }
    
                //check Functional Location ListPicker, if value is set, add Func Loc link
                let funcLoc = libOperationControl.getFunctionalLocation(pageProxy);
                if (!libVal.evalIsEmpty(funcLoc)) {
                    let funcLocLink = pageProxy.createLinkSpecifierProxy(
                        'FunctionalLocationOperation',
                        'MyFunctionalLocations',
                        `$filter=FuncLocIdIntern eq '${funcLoc}'`
                    );
                    links.push(funcLocLink.getSpecifier());
                }
    
                return links;
            });
        }

    }

    /**
     * Dynamically set the Delete of the WorkOrder
     * @param {IPageProxy} 
     * @return {Array} array of create update links
     */
    static getDeleteLinks(pageProxy) {
        var links = [];

        //check Equipment ListPicker, if value is set, add Equipment link
        let equipment = libOperationControl.getEquipment(pageProxy);
        if (libVal.evalIsEmpty(equipment) && pageProxy.binding.EquipmentOperation) {
            let equipmentLink = pageProxy.createLinkSpecifierProxy(
                'EquipmentOperation',
                'MyEquipments',
                '',
                pageProxy.binding.EquipmentOperation['@odata.readLink']
            );
            links.push(equipmentLink.getSpecifier());
        }

        //check Functional Location ListPicker, if value is set, add Func Loc link
        let funcLoc = libOperationControl.getFunctionalLocation(pageProxy);
        if (libVal.evalIsEmpty(funcLoc) && pageProxy.binding.FunctionalLocationOperation) {
            let funcLocLink = pageProxy.createLinkSpecifierProxy(
                'FunctionalLocationOperation',
                'MyFunctionalLocations',
                '',
                pageProxy.binding.FunctionalLocationOperation['@odata.readLink']
            );
            links.push(funcLocLink.getSpecifier());
        }

        return links;

    }
}

/**
 * Contains the methods that are page Event related
 */
export class OperationEventLibrary {

    /**
     * Trigger during PageLoad
     * @param {IPageProxy} pageProxy 
     */
    static createUpdateOnPageLoad(pageProxy) {
        if (!pageProxy.getClientData().LOADED) {
            //Determine if we are on edit vs. create
            let onCreate = libCommon.IsOnCreate(pageProxy);
            this.createUpdateVisibility(pageProxy, onCreate);

            let equipmentControl = pageProxy.getControl('FormCellContainer').getControl('EquipmentLstPkr');
            let equipValue = '';
            let equipArray = equipmentControl.getValue();
            if (equipArray && libCommon.getListPickerValue(equipArray) !== '') {
                equipValue = libCommon.getListPickerValue(equipArray);
            }

            if (onCreate) {
                //Get title
                let title = pageProxy.localizeText('add_operation');
                pageProxy.setCaption(title);

                this.setDefaultValues(pageProxy);
            } else {
                let title = pageProxy.localizeText('edit_operation');
                pageProxy.setCaption(title);
                let stylizer = new Stylizer(['GrayText']);
                let formCellContainerProxy = pageProxy.getControl('FormCellContainer');
                let workCenterPlant = formCellContainerProxy.getControl('WorkCenterPlantLstPkr');
                let workCenterLstPkr = formCellContainerProxy.getControl('WorkCenterLstPkr');
                stylizer.apply(workCenterPlant, 'Value');
                stylizer.apply(workCenterLstPkr, 'Value');
            }
            return libOperationControl.updateEquipment(pageProxy).then(()=> { //Filter the equipment list by functional location
                if (equipValue) {
                    equipmentControl.setValue(equipValue);
                }
                pageProxy.getClientData().LOADED = true;
                return true;
            });
        } else {
            pageProxy.getClientData().LOADED = true;
            return true;
        }
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

        let allControls = pageProxy.getControl('FormCellContainer').getControls();
        for (let item of allControls) {
            libCommon.setInlineControlErrorVisibility(item, false);
        }
        pageProxy.getControl('FormCellContainer').redraw();

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
     * @param {IPageProxy} pageProxy 
     */
    static createUpdateOnPageUnloaded(pageProxy) {
        //reset global state
        libCommon.setOnCreateUpdateFlag(pageProxy, '');

        let workOrderDV = libCommon.getStateVariable(pageProxy, 'WorkOrder');
        if (workOrderDV) {
            // if this changeset was a WorkOrder/Operation changeset, reset the ChangeSet flag to false. 
            // Because this is the last action of the changeset
            libCommon.setOnChangesetFlag(pageProxy, false);
        }
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
                    return libOperationControl.updateEquipment(controlProxy.getPageProxy());
                case 'EquipmentLstPkr':
                    libOperationControl.updateFloc(controlProxy.getPageProxy());
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
        return Promise.resolve();
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

            //var that tells if we are on create
            let onCreate = libCommon.IsOnCreate(controlProxy.getPageProxy());

            //var that tells if we are on ChangeSet
            let onWoChangeSet = libCommon.isOnWOChangeset(controlProxy);
            let parentWorkOrderPromise = libPrivate._getParentWorkOrder(controlProxy.getPageProxy(), onWoChangeSet);
            return parentWorkOrderPromise.then(parentWorkOrder => {
                // Based on the control we are on, return the right query or list items accordingly
                switch (controlName) {
                    case 'FunctionalLocationLstPkr':

                        if (onCreate) {
                            if (libCommon.isDefined(parentWorkOrder.MainWorkCenterPlant)) {
                                result = `$filter=PlanningPlant eq '${parentWorkOrder.MainWorkCenterPlant}'&`;
                            }
                                result += '$orderby=FuncLocIdIntern';
                        } else {
                            let planningPlant = libCommon.getTargetPathValue(controlProxy, '#Property:MainWorkCenterPlant');
                            result = `$filter=PlanningPlant eq '${planningPlant}'&$orderby=FuncLocIdIntern`;
                        }
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
                return result;
            });
        } catch (err) {		
            /**Implementing our Logger class*/		 
            Logger.error(controlProxy.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(), err);
        }
        return result;
    }

    /**
     * Dynamically bind the queryoptions to the controls
     * @param {IControlProxy} controlProxy 
     */
    static createUpdateControlsPickerItems(controlProxy) {
        try {
            let controlName = controlProxy.getName();
            var result = '';

            //var that tells if we are on create
            let onCreate = libCommon.IsOnCreate(controlProxy.getPageProxy());

            //var that tells if we are on ChangeSet
            let onWoChangeSet = libCommon.isOnWOChangeset(controlProxy);
            let parentWorkOrderPromise = libPrivate._getParentWorkOrder(controlProxy.getPageProxy(), onWoChangeSet);

            return parentWorkOrderPromise.then(parentWorkOrder => {
                let assignmentType = libCommon.getWorkOrderAssignmentType(controlProxy.getPageProxy());

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
                                        let mainWorkCenter = '';
                                        if (onCreate) {
                                            mainWorkCenter = parentWorkOrder.MainWorkCenter;
                                        } else {
                                            mainWorkCenter = libCommon.getTargetPathValue(controlProxy, '#Property:MainWorkCenter');
                                        }
                                        entityRead = controlProxy.read(
                                    '/SAPAssetManager/Services/AssetManager.service',
                                    'WorkCenters',
                                    [],
                                    `$filter=ExternalWorkCenterId eq '${mainWorkCenter}'`);
                                        break;
                                    }
                                default:
                                    {
                                //default is assignmentType 8
                                        let mainWorkCenter = '';
                                        if (onCreate) {
                                            mainWorkCenter = parentWorkOrder.MainWorkCenter;
                                        } else {
                                            mainWorkCenter = libCommon.getTargetPathValue(controlProxy, '#Property:MainWorkCenter');
                                        }
                                        entityRead = controlProxy.read(
                                    '/SAPAssetManager/Services/AssetManager.service',
                                    'WorkCenters',
                                    [],
                                    `$filter=ExternalWorkCenterId eq '${mainWorkCenter}'`);
                                        break;
                                    }
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
            }).catch(() => {
                Logger.error(controlProxy, 'WO Operation. No Parent WO exists returning all workcenters');
                let entity= controlProxy.read(
                    '/SAPAssetManager/Services/AssetManager.service',
                    'WorkCenters',
                    [],
                    '');
                return entity.then(function(obArray) {
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
            });
        } catch (err) {
            /**Implementing our Logger class*/
            Logger.error(controlProxy, 'WO Operation' + err);
            return '';
        }
    }

    /**
     * Trigger when user hit save button
     * @param {IPageProxy} pageProxy 
     */
    static createUpdateOnCommit(pageProxy) {
        //Determine if we are on edit vs. create
        let onCreate = libCommon.IsOnCreate(pageProxy);

        if (onCreate) {
            return OpCreateSuccess(pageProxy);
            //return pageProxy.executeAction('/SAPAssetManager/Actions/WorkOrders/Operations/WorkOrderOperationCreate.action');
        } else {
            return pageProxy.executeAction('/SAPAssetManager/Actions/WorkOrders/Operations/WorkOrderOperationUpdate.action');
        }
    }

    /**
     * Set the default value when its on create mode
     * @param {IPageProxy} pageProxy 
     * @param {boolean} onCreate
     * @param {Map} userInfo
     */
    static setDefaultValues(pageProxy) {
        let onWoChangeSet = libCommon.isOnWOChangeset(pageProxy);
        let parentWorkOrderPromise = libPrivate._getParentWorkOrder(pageProxy, onWoChangeSet);

        // get the controls
        let controlKeyCtrl = pageProxy.getControl('FormCellContainer').getControl('ControlKeyLstPkr');


        parentWorkOrderPromise.then(parentWorkOrder => {
            // set the defaut value from Parent - WorkOrder
            controlKeyCtrl.setValue(parentWorkOrder.OrderType);

            //set the 'SetValueFromRule' flag of each control to true
            controlKeyCtrl.getClientData().SetValueFromRule = true;

            //set the 'DefaultValuesLoaded' flag of the page to true
            pageProxy.getClientData().DefaultValuesLoaded = true;
        });
    }
}

/**
 * Contains the methods that are page control related
 */
export class OperationControlLibrary {

    static getPersonNum(pageProxy) {
        let assignmentType = libCommon.getWorkOrderAssignmentType(pageProxy);

        if (assignmentType === '2') {
            return libCommon.getPersonnelNumber();
        } else {
            return '';
        }
    }

    /**
     * get the new OperationNo for the next new operation
     * 
     * @static
     * @param {any} pageProxy 
     * @returns 
     * 
     * @memberof OperationControlLibrary
     */
    static getOperationNo(pageProxy) {
        let onWoChangeSet = libCommon.isOnWOChangeset(pageProxy);
        if (onWoChangeSet) {
            return '0010';
        } else {
            return libPrivate._getParentWorkOrder(pageProxy, onWoChangeSet).then(parentWorkOrder => {
                let woODataId = parentWorkOrder['@odata.id'];
                return pageProxy.count('/SAPAssetManager/Services/AssetManager.service', `${woODataId}/Operations`, '$orderby=OrderId')
                    .then(resultCount => {
                        return resultCount;
                    });
            });
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
     * WorkOrderParent getter
     * @param {IPageProxy} pageProxy 
     */
    static getWorkOrder(pageProxy) {
        let wo = libCommon.getTargetPathValue(pageProxy, '#Control:WorkOrderLstPkr/#Value');
        return libCommon.getListPickerValue(wo);
    }

    /**
     * get the equipment description based on equipment id
     * 
     * @static
     * @param {any} pageProxy 
     * 
     * @memberof OperationControlLibrary
     */
    static getEquipmentDescription(context, equipId) {
        return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyEquipments', [], `$filter=EquipId eq '${equipId}'`)
            .then(equipments => {
                if (!libVal.evalIsEmpty(equipments)) {
                    return equipments.getItem(0).EquipDesc;
                } else {
                    return '';
                }
            });
    }

    /**
     * get the func loc description based on functional location intern id
     * 
     * @static
     * @param {any} pageProxy 
     * 
     * @memberof OperationControlLibrary
     */
    static getFuncLocDescription(context, funcLocInternId) {
        return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyFunctionalLocations', [], `$filter=FuncLocIdIntern eq '${funcLocInternId}'`)
            .then(funcLocs => {
                if (!libVal.evalIsEmpty(funcLocs)) {
                    return funcLocs.getItem(0).FuncLocDesc;
                } else {
                    return '';
                }
            });
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
            return equipmentControl.setTargetSpecifier(equipmentCtrlSpecifier);
        } catch (err) {
            /**Implementing our Logger class*/
            Logger.error(pageProxy.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(), `UpdateEquipment Error: ${err}`);
        }
        return Promise.resolve();
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
}

/**
 * contains the private method of the Operation page
 * 
 * @export
 * @class PrivateMethodLibrary
 */
export class PrivateMethodLibrary {

    static _isWorkCenterEditable(isOnCreate, isLocal) {
        if (!isOnCreate && !isLocal) {
            return false;
        } else {
            return true;
        }
    }

    static _isMainWorkCenterEditable( isOnCreate, isLocal) {
        if (!isOnCreate && !isLocal) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * 
     * 
     * @static
     * @param {IPageProxy} context 
     * @returns 
     * 
     * @memberof PrivateMethodLibrary
     */
    static _getParentWorkOrder(context, onWoChangeSet) {
        if (context.getClientData().ParentWorkOrder) {
            return Promise.resolve(context.getClientData().ParentWorkOrder);
        } else {
            if (onWoChangeSet) {
                let workOrderDV = libCommon.getStateVariable(context, 'WorkOrder');
                context.getClientData().ParentWorkOrder = workOrderDV;
                return Promise.resolve(workOrderDV);
            } else {
                let woReadLink = context.binding['@odata.readLink'];
                let onCreate = libCommon.IsOnCreate(context);
                if (!onCreate) {
                    woReadLink = context.binding['@odata.readLink'] + '/WOHeader';
                }
                
                return context.read('/SAPAssetManager/Services/AssetManager.service', woReadLink, [], '')
                    .then(workOrder => {
                        context.getClientData().ParentWorkOrder = workOrder.getItem(0);
                        return workOrder.getItem(0);
                    });
            }
        }
    }
}

export class OperationConstants {
    static get FromWOrkOrderOperationListQueryOptions() {
        return '$select=OrderId,OperationNo,OperationShortText,ControlKey,ObjectKey,MainWorkCenter,MainWorkCenterPlant,OperationFunctionLocation,OperationEquipment,MobileStatus/MobileStatus,WOHeader/MainWorkCenter,WOHeader/CostCenter,WOHeader/DueDate,WOHeader/OrderId,WOHeader/MaintenanceActivityType,WOHeader/OrderType,WOPrecintos/SerieActual,WOPrecintos/EstadoActual,WOPrecintos/Caracteristica,WOprecintos/CaractEstado&$expand=MobileStatus,OperationLongText,WOHeader,WOPrecintos&$orderby=OrderId,OperationNo';
    }

    static get OperationListQueryOptions() {
        return '$select=OrderId,OperationNo,OperationShortText,ControlKey,ObjectKey,MainWorkCenter,MainWorkCenterPlant,OperationFunctionLocation,OperationEquipment,MobileStatus/MobileStatus,WOHeader/MainWorkCenter,WOHeader/CostCenter,WOHeader/DueDate,WOHeader/OrderId,WOHeader/MaintenanceActivityType,WOHeader/OrderType,WOPrecintos/SerieActual,WOPrecintos/EstadoActual,WOPrecintos/Caracteristica,WOprecintos/CaractEstado&$expand=MobileStatus,OperationLongText,WOHeader,WOPrecintos&$orderby=OperationNo,OrderId,ObjectKey';
    }
}
