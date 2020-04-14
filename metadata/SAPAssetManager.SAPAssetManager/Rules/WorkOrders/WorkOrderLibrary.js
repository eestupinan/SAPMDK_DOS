import libCommon from '../Common/Library/CommonLibrary';
import libVal from '../Common/Library/ValidationLibrary';
import assnType from '../Common/Library/AssignmentType';
import ConstantsLibrary from '../Common/Library/ConstantsLibrary';
import libWoMobile from './MobileStatus/WorkOrderMobileStatusLibrary';
import libDoc from '../Documents/DocumentLibrary';
import libControlDescription from '../Common/Controls/DescriptionNoteControl';
import Logger from '../Log/Logger';
import { UserPreferenceLibrary as libUserPref } from '../UserPreferences/UserPreferencesLibrary';
//This reference to itself is necessary because promises lose context when running these functions,
//causing sub-rules to be unaccessable when using "this." syntax
import { WorkOrderLibrary as libWo, WorkOrderControlsLibrary as libWoControls, PrivateMethodsLibrary as libPrivate } from './WorkOrderLibrary';
import markedJobCreateUpdateOnCommit from '../MarkedJobs/MarkedJobCreateUpdateOnCommit';
import Stylizer from '../Common/Style/Stylizer';
import DocLib from '../Documents/DocumentLibrary';


/**
 * Contains all common Work Order related method, except CreateUpdate page event and contorl method;
 * NOTE: For CreateUpdate related Event and Control please use WorkOrderEventLibrary and WorkWorkControlsLibrary
 */
export class WorkOrderLibrary {

    /**
	 * Set the ChangeSet flag
	 * @param {IPageProxy} context 
	 * @param {boolean} FlagValue 
	 */
    static setFollowUpFlag(context, FlagValue) {
        libCommon.setStateVariable(context, 'OnFollowUpWorkOrder', FlagValue, 'WorkOrderDetailsPage');
    }

    /**
     * gets the 'OnFollowUpWorkOrder'
     * 
     * @static
     * @param {IClientAPI} context 
     * @return {boolean}
     * 
     * @memberof WorkOrderLibrary
     */
    static getFollowUpFlag(context) {
        let result = libCommon.getStateVariable(context, 'OnFollowUpWorkOrder', 'WorkOrderDetailsPage');
        if (result) {
            return result;
        } else {
            return false;
        }
    }
    
    /**
     * Gets the count of High and Very High Workorders
     */
    static highPriorityOrdersCount(sectionProxy) {
        return sectionProxy.count('/SAPAssetManager/Services/AssetManager.service', 'MyWorkOrderHeaders', libWo.getFilterForHighPriorityWorkorders());
    }

    /**
     * Gets the filter for the query for High and Very High Workorders.
     */
    static getFilterForHighPriorityWorkorders() {
        return "$filter=(Priority eq '1' or  Priority eq '2')";
    }

    /**
     * Checks to see if the work order from context is marked or not.
     * @param {*} pageClientAPI
     * @return true if work order is marked.
     */
    static isMarkedWorkOrder(pageProxy) {
        let woId = libUserPref.getPreferenceName(pageProxy);
        woId = woId.replace(/'/g, "''");
        let queryoption = `$filter=PreferenceName eq '${woId}' and PreferenceGroup eq 'MARKED_JOBS' and PreferenceValue eq 'true'&$orderby=PreferenceName`;
        return pageProxy.read('/SAPAssetManager/Services/AssetManager.service', 'UserPreferences', [], queryoption).then(markedJobs => {
            if (!libVal.evalIsEmpty(markedJobs)) {
                return true;
            } else {
                return false;
            }
        });
    }
    /**
    * Get Prioirty of the Work Order context
    * @param context
    * @return Priority Description if not null else empty space string
    */
    static getWorkOrderPriorityFormat(context) {
        let binding = context.getBindingObject();
        if (binding && binding.WOPriority && binding.WOPriority.PriorityDescription) {
            return binding.WOPriority.PriorityDescription;
        }
        return ' ';
    }

    /**
     * Gets the query options for work order list view.
     */
    static getWorkOrdersListViewQueryOptions() {
        return '$select=CostCenter,WODocuments/DocumentID,ObjectKey,OrderType,Priority,DueDate,HeaderEquipment,OrderDescription,OrderId,MainWorkCenter,MainWorkCenterPlant,MobileStatus/MobileStatus,Operations/MobileStatus/MobileStatus,Operations/SubOperations/MobileStatus/MobileStatus,WOPriority/PriorityDescription,MarkedJob/PreferenceValue&' 
        + '$expand=WODocuments,MobileStatus,Operations,Operations/MobileStatus,Operations/SubOperations,Operations/SubOperations/MobileStatus,WOPriority,MarkedJob&' 
        + '$orderby=Priority,DueDate,OrderId,WODocuments/DocumentID,MobileStatus/MobileStatus,Operations/MobileStatus/MobileStatus,Operations/SubOperations/MobileStatus/MobileStatus';
    }

    /**
     * Gets the High and Very High Workorders for the List view.
     */
    static getHighPriorityWorkOrdersQueryOptions() {
        return '$select=CostCenter,WODocuments/DocumentID,ObjectKey,OrderType,Priority,DueDate,HeaderEquipment,OrderDescription,OrderId,MainWorkCenter,MainWorkCenterPlant,MobileStatus/MobileStatus,Operations/MobileStatus/MobileStatus,Operations/SubOperations/MobileStatus/MobileStatus,WOPriority/PriorityDescription,MarkedJob/PreferenceValue&' 
        + libWo.getFilterForHighPriorityWorkorders()
        + '&$expand=WODocuments,MobileStatus,Operations,Operations/MobileStatus,Operations/SubOperations,Operations/SubOperations/MobileStatus,WOPriority,MarkedJob,WOGeometries,WOGeometries/Geometry,HeaderLongText&' 
        + '$orderby=Priority,DueDate,OrderId';
    }

    static getWorkOrderDetailsNavQueryOption() {
        return '$select=WOFormParams/OrdesClass,WOFormParams/ActivityClass,WOFormParams/UserStatus,WOFormParams/CurrPage,WOFormParams/NextPage,WOAnomalias/ClasOrd,WOAnomalias/StatusUsr,' + 
        	   'WOAnomalias/Codigo,WOAnomalias/Descripcion,WOEquipos/Equipment,WOEquipos/MaterialNo,WOEquipos/SerialNo,WOEquipos/MaterialDesc,WOUserStatus/Status,WOUserStatus/StatusProfile,' + 
        	   'WOUserStatus/UserStatus,WOUserStatus/UserStatusText,BPFirma,NumCuotas,CuentaContrato,CostCenter, MaintenanceActivityType,' + 
        	   'OrderId,Priority,OrderDescription,ObjectKey,OrderType,DueDate,MainWorkCenter,MainWorkCenterPlant,ControllingArea,MaintenancePlant,FunctionalLocation/FuncLocDesc,' + 
        	   'MobileStatus/MobileStatus,Operations/MobileStatus/MobileStatus,Operations/SubOperations/MobileStatus/MobileStatus,HeaderEquipment,HeaderFunctionLocation,MarkedJob,' + 
        	   'WOPartners/PartnerFunction,DescServhogar,WOSales_Nav/ProductDesc' +
        	   '&$expand=WOFormParams,WOAnomalias,WOEquipos,WOUserStatus,WOSales_Nav,WODocuments,MobileStatus,FunctionalLocation,Operations,Operations/MobileStatus,Operations/SubOperations,Operations/SubOperations/MobileStatus,' + 
        	   'WOGeometries/Geometry,MarkedJob,Confirmations,Address,WOPartners/Address_Nav';
    }

    /**
     * Gets the query option filter used to get all the marked jobs from UserPreferences EntitySet
     */
    static getMarkedJobsQueryOptionsFilter() {
        return "$filter=(PreferenceGroup eq 'MARKED_JOBS' and PreferenceValue eq 'true')&$orderby=PreferenceName";
    }

    /**
     * Query option filter used to retrieve all reminders from UserPreferences EntitySet.
     */
    static getRemindersQueryOptionsFilter() {
        return "$filter=(PreferenceGroup eq 'REMINDERS')&$orderby=PreferenceName";
    }

    /**
     * Gets all the UserPreferences properties for a given Job.
     * @param pageClientAPI Page Client API
     * @param orderId ID of the Job for which you want to get the UserPreferences info.
     * @return Promise that holds the results in an array.
     */
    static getUserPreferences(pageClientAPI, orderId) {
        var queryOptions = '$orderby=PreferenceName';
        if (!libVal.evalIsEmpty(orderId)) {
            queryOptions += "&$filter=(PreferenceName eq '" + orderId + "')";
        }
        return pageClientAPI.read('/SAPAssetManager/Services/AssetManager.service', 'UserPreferences', [], queryOptions);
    }

    /**
     * Gets a particular UserPreferences property for a given Job.
     * @param pageClientAPI Page Client API
     * @param orderId ID of the Job for which you want to get the UserPreferences property.
     * @param propertyName Name of the UserPreferences property you are looking for.
     * @return Value of the UserPreferences property for a given Job or blank if not found.
     */
    static getUserPreferencesProperty(pageClientAPI, orderId, propertyName) {
        var propertyValue = '';
        if (libVal.evalIsEmpty(orderId)) {
            return propertyValue;
        }
        return libWo.getUserPreferences(pageClientAPI, orderId).then(userPreferences => {
            if (userPreferences.length > 0) {
                propertyValue = userPreferences.getItem(0)[propertyName];
            }
            if (libVal.evalIsEmpty(propertyValue)) {
                return '';
            } else {
                return propertyValue;
            }
        });
    }

    /**
     * Dynamically set the CreateLinks of the WorkOrder
     * @param {IPageProxy} 
     */
    static getCreateUpdateLinks(pageProxy) {
        var links = [];
        let onCreate = libCommon.IsOnCreate(pageProxy);

        //check Equipment ListPicker, if value is set, add Equipment link
        let equipment = libWoControls.getEquipment(pageProxy);
        if (equipment && equipment !== '') {
            let equipmentLink = pageProxy.createLinkSpecifierProxy(
                'Equipment',
                'MyEquipments',
                `$filter=EquipId eq '${equipment}'`
            );
            links.push(equipmentLink.getSpecifier());
        }

        //check Functional Location ListPicker, if value is set, add Func Loc link
        let funcLoc = libWoControls.getFunctionalLocation(pageProxy);
        if (funcLoc && funcLoc !== '') {
            let funcLocLink = pageProxy.createLinkSpecifierProxy(
                'FunctionalLocation',
                'MyFunctionalLocations',
                `$filter=FuncLocIdIntern eq '${funcLoc}'`
            );
            links.push(funcLocLink.getSpecifier());
        }

        //update notification link if coming from Notification details
        if (pageProxy.binding.FromNotification) {
            let notificationLink = pageProxy.createLinkSpecifierProxy(
                'Notification',
                'MyNotificationHeaders',
                `$filter=NotificationNumber eq '${pageProxy.binding.NotificationNumber}'`
            );
            links.push(notificationLink.getSpecifier());
        }

        //update Priority PrioritySeg link
        let priority = libWoControls.getPriority(pageProxy);
        let planningPlant = libWoControls.getPlanningPlant(pageProxy);
        let orderType = libWoControls.getOrderType(pageProxy);
        if (onCreate) {
            return pageProxy.read('/SAPAssetManager/Services/AssetManager.service', 'OrderTypes', ['PriorityType'], `$filter=PlanningPlant eq '${planningPlant}' and OrderType eq '${orderType}'`).then(orderTypes => {
                if (orderTypes.getItem(0)) {
                    let priorityType = orderTypes.getItem(0).PriorityType;
                    if (!libVal.evalIsEmpty(priority)) {
                        let priorityLink = pageProxy.createLinkSpecifierProxy(
                            'WOPriority',
                            'Priorities',
                            `$filter=PriorityType eq '${priorityType}' and Priority eq '${priority}'`
                        );
                        links.push(priorityLink.getSpecifier());
                    }
                }
                return links;
            });
        } else {
            let priorityType = pageProxy.getBindingObject().PriorityType;
            if (!libVal.evalIsEmpty(priority)) {
                let priorityLink = pageProxy.createLinkSpecifierProxy(
                    'WOPriority',
                    'Priorities',
                    `$filter=PriorityType eq '${priorityType}' and Priority eq '${priority}'`
                );
                links.push(priorityLink.getSpecifier());
            }

            return Promise.resolve(links);
        }
    }

    /**
     * Dynamically set the DeleteLinks of WorkOrders
     */
    static getDeleteLinks(context) {
        let links = [];

        //check Equipment ListPicker, if not set and there is already a equipment. Remove it
        let equipment = libWoControls.getEquipment(context);
        if (!equipment && context.binding.Equipment) {
            let equipmentLink = context.createLinkSpecifierProxy(
                'Equipment',
                'MyEquipments',
                '',
                context.binding.Equipment['@odata.readLink']
            );
            links.push(equipmentLink.getSpecifier());
        }

        //check Functional Location ListPicker, if not set and there is already a functional loc. Remove it
        let funcLoc = libWoControls.getFunctionalLocation(context);
        if (!funcLoc && context.binding.FunctionalLocation) {
            let funcLocLink = context.createLinkSpecifierProxy(
                'FunctionalLocation',
                'MyFunctionalLocations',
                '',
                context.binding.FunctionalLocation['@odata.readLink']
            );
            links.push(funcLocLink.getSpecifier());
        }

        return links;
    }
}

/**
 * This stores the Work Order page's event related methods
 */
export class WorkOrderEventLibrary {

    /**
     * Triggered when the page is loaded
     * @param {IPageProxy} pageClientAPI 
     */
    static createUpdateOnPageLoad(pageClientAPI) {
        if (!pageClientAPI.getClientData().LOADED) {
            let onCreate = libCommon.IsOnCreate(pageClientAPI);
            let onFollowUp = libWo.getFollowUpFlag(pageClientAPI);

            libPrivate._setTitle(pageClientAPI, onCreate, onFollowUp);
            this.setDefaultValues(pageClientAPI, onCreate, onFollowUp);

            pageClientAPI.getClientData().LOADED = true;
        }
    }

    /**
     * execute the validation rule of Work Order Create/Update action
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

        // check attachment count, run the validation rule if there is an attachment
        if (libDoc.attachmentSectionHasData(pageProxy)) {
            valPromises.push(libDoc.createValidationRule(pageProxy));
        }

        // check all validation promises;
        // if all resolved -> return true
        // if at least 1 rejected -> return false
        return Promise.all(valPromises).then((results) => {
            const pass = results.reduce((total, value) => {
                return total && value;
            });
            if (!pass) {
                throw false;
            }
            return true;
        }).catch(() => {
            let container = pageProxy.getControl('FormCellContainer');
            container.redraw();
            return false;
        });
    }

    /** 
     * Triggered when one of the control has changed the value; Binded to each control
     * @param {ControlProxy} control 
     */
    static createUpdateOnChange(control) {

        //check wether it is invoke from a rule or by user
        if (control.getPageProxy().getClientData().LOADED && !control.getClientData().SetValueFromRule) {
            let name = control.getName();
            switch (name) {
                case 'PlanningPlantLstPkr':
                    libWoControls.updateOrderType(control.getPageProxy());
                    libWoControls.updateFunctionalLocation(control.getPageProxy());
                    libWoControls.updateEquipment(control.getPageProxy());
                    //TODO: need a way to rebind PickerItems 
                    libWoControls.rebindWorkCenterPlant(control.getPageProxy());
                    break;
                case 'TypeLstPkr':
                    libWoControls.updatePriority(control.getPageProxy());
                    break;
                case 'FunctionalLocationLstPkr':
                    libWoControls.updateEquipment(control.getPageProxy());
                    break;
                case 'EquipmentLstPkr':
                    libWoControls.updateFloc(control.getPageProxy());
                    break;
                default:
                    break;
            }

            //JCL - Not doing this for now.  Put in place when we can handle for all fields
            if (!libVal.evalIsEmpty(control.getValue())) {
                control.clearValidation();
            }
        } else {
            //value is set or changed by the user, not from rule or code behind
            control.getClientData().SetValueFromRule = false;
        }
    }

    /**
     * Set controls' visibility
     * @param {IPageProxy} pageProxy 
     * @param {boolean} isOnCreate 
     */
    static createUpdateVisibility(control) {

        let controlName = control.getName();
        let isOnCreate = libCommon.IsOnCreate(control.getPageProxy());
        let result = false;

        switch (controlName) {
            case 'LongTextNote':
                result = libPrivate._shouldNoteVisible(isOnCreate);
                break;
            case 'Marked':
                result = libPrivate._shouldMarkedJobSwitchVisible(isOnCreate);
                break;
            default:
                result = true;
        }

        return result;
    }

    /**
     * This will returns the correct QueryOptions for each control
     * @param {IControlProxy} controlProxy 
     */
    static createUpdateControlsQueryOptions(controlProxy) {
        let controlName = controlProxy.getName();
        var result = '';

        //Determine if we are on create
        let onCreate = libCommon.IsOnCreate(controlProxy.getPageProxy());

        // Based on the control we are on, return the right query or list items accordingly
        switch (controlName) {
            case 'TypeLstPkr':
                {
                    let planningPlant = '';
                    if (onCreate) {
                        planningPlant = assnType.getWorkOrderFieldDefault('WorkOrderHeader', 'PlanningPlant');
                    } else {
                        planningPlant = libCommon.getTargetPathValue(controlProxy, '#Property:PlanningPlant');
                    }

                    result = `$filter=PlanningPlant eq '${planningPlant}'&$orderby=OrderType`;
                    break;
                }
            case 'PrioritySeg':
                {
                //Priority is based on PriorityType property that live inside OrderTypes
                    result = libPrivate._prioritySeg(controlProxy, onCreate);
                    break;
                }
            case 'FunctionalLocationLstPkr':
                {
                //if on create, get the default value from app param
                    let planningPlant = onCreate ? planningPlant = assnType.getWorkOrderFieldDefault('WorkOrderHeader', 'PlanningPlant') : libCommon.getTargetPathValue(controlProxy, '#Property:PlanningPlant');

                    result = `$filter=PlanningPlant eq '${planningPlant}'&$orderby=FuncLocIdIntern`;
                    break;
                }
            case 'EquipmentLstPkr':
                {
                    let equipId = libCommon.getTargetPathValue(controlProxy, '#Property:HeaderEquipment');
                    let funcLoc = libCommon.getTargetPathValue(controlProxy, '#Property:HeaderFunctionLocation');
                    if (equipId && equipId !== '') {
                        result = "$filter=EquipId eq '" + equipId + "'";
                    } else if (funcLoc && funcLoc !== '') {
                        result = "$filter=FuncLocId eq '" + funcLoc + "'&$orderby=EquipId";
                    } else {
                        result = '$orderby=EquipId';
                    }
                    break;
                }
            default:
                break;
        }

        return Promise.resolve(result);
    }

    /**
     * This will returns the correct PickerItems for the Picker Controls
     * @param {IControlProxy} controlProxy 
     */
    static createUpdateControlsPickerItems(controlProxy) {
        let controlName = controlProxy.getName();

        //Determine if we are on create
        //let onCreate = libCommon.IsOnCreate(controlProxy.getPageProxy());

        // Based on the control we are on, return the right list items accordingly
        if (controlName === 'PlanningPlantLstPkr') {
            //TODO - AssignmentType case scenario will be needed here after more AssignmentType are introduced
            let planningPlantValue = assnType.getWorkOrderFieldDefault('WorkOrderHeader', 'PlanningPlant');
            return controlProxy.read('/SAPAssetManager/Services/AssetManager.service', 'Plants', [], `$filter=PlanningPlant eq '${planningPlantValue}'`).then(obArray => {
                var jsonResult = [];
                obArray.forEach(function(element) {
                    jsonResult.push(
                        {
                            'DisplayValue': `${element.PlanningPlant} - ${element.PlantDescription}`,
                            'ReturnValue': element.PlanningPlant,
                        });
                });
                const uniqueSet = new Set(jsonResult.map(item => JSON.stringify(item)));
                let finalResult = [...uniqueSet].map(item => JSON.parse(item));
                return finalResult;
            });
        } else if (controlName === 'WorkCenterPlantLstPkr') {
            //TODO - AssignmentType case scenario will be needed here after more AssignmentType are introduced
            //let planningPlant = onCreate ? appParams.get('PlanningPlant') : libCommon.getTargetPathValue(controlProxy, '#Property:PlanningPlant');
            //let mainWorkCenter = userInfo.get('USER_PARAM.AGR');
            //let queryOption = `$filter=PlantId eq '${planningPlant}' and ExternalWorkCenterId eq '${mainWorkCenter}'`;

            return controlProxy.read('/SAPAssetManager/Services/AssetManager.service', 'WorkCenters', [], '').then(function(obArray) {
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
        } else {
            return Promise.resolve([]);
        }
    }

    /**
     * Triggered when the user hit "Save" button
     * @param {IPageProxy} pageProxy 
     */
    static CreateUpdateOnCommit(pageProxy) {
        //Determine if we are on edit vs. create
        let onCreate = libCommon.IsOnCreate(pageProxy);

        if (onCreate) {
            //get the value from controls that need to pass to Operation create
            let planningPlant = libWoControls.getPlanningPlant(pageProxy);
            let workCenter = libWoControls.getMainWorkCenter(pageProxy);
            let workCenterPlant = libWoControls.getWorkCenterPlant(pageProxy);
            let orderType = libWoControls.getOrderType(pageProxy);

            let woDefaultValue = {
                'PlanningPlant': planningPlant,
                'MainWorkCenter': workCenter,
                'MainWorkCenterPlant': workCenterPlant,
                'OrderType': orderType,
            };

            libCommon.setStateVariable(pageProxy, 'WorkOrder', woDefaultValue);
            libCommon.setStateVariable(pageProxy, 'FromOperationsList', false);
            let descriptionCtrlValue = pageProxy.getControl('FormCellContainer').getControl('AttachmentDescription').getValue();
            let attachmentCtrlValue = pageProxy.getControl('FormCellContainer').getControl('Attachment').getValue();
            libCommon.setStateVariable(pageProxy, 'DocDescription', descriptionCtrlValue);
            libCommon.setStateVariable(pageProxy, 'Doc', attachmentCtrlValue);
            libCommon.setStateVariable(pageProxy, 'Class', 'WorkOrder');
            libCommon.setStateVariable(pageProxy, 'ObjectKey', 'OrderId');
            libCommon.setStateVariable(pageProxy, 'entitySet' ,'MyWorkOrderDocuments');
            libCommon.setStateVariable(pageProxy,'parentEntitySet', 'MyWorkOrderHeaders');
            libCommon.setStateVariable(pageProxy,'parentProperty', 'WOHeader');
            libCommon.setStateVariable(pageProxy,'attachmentCount', DocLib.validationAttachmentCount(pageProxy));

            return pageProxy.executeAction('/SAPAssetManager/Actions/WorkOrders/Operations/WorkOrderOperationCreateUpdateNav.action');
        } else {
            return markedJobCreateUpdateOnCommit(pageProxy).then(() => {
                return pageProxy.executeAction('/SAPAssetManager/Actions/WorkOrders/WorkOrderUpdate.action');
            });
        }
    }

    /**
     * set the default values of the page's control
     * 
     * @static
     * @param {IPageProxy} pageProxy
     * @param {Map} userInfo 
     * @param {boolean} onCreate
     * @param {boolean} onFollowUp
     * 
     * @memberof WorkOrderEventLibrary
     */
    static setDefaultValues(pageProxy, onCreate, onFollowUp) {
        if (onCreate && onFollowUp) {
            let descriptionControl = libCommon.getControlProxy(pageProxy, 'DescriptionNote');
            descriptionControl.setValue(pageProxy.localizeText('followup') + ' ' + descriptionControl.getValue());

            let priorityCtrl = libCommon.getControlProxy(pageProxy, 'PrioritySeg');
            priorityCtrl.setValue(ConstantsLibrary.defaultPriority);

        } else {
            let formCellContainer = pageProxy.getControl('FormCellContainer');
            let stylizer = new Stylizer(['GrayText']);
            let plantPkr = formCellContainer.getControl('PlanningPlantLstPkr');
            let wrkCenterPkr = formCellContainer.getControl('WorkCenterPlantLstPkr');
            let mainWrkCenterPkr = formCellContainer.getControl('MainWorkCenterLstPkr');
            stylizer.apply(plantPkr , 'Value');
            stylizer.apply(wrkCenterPkr, 'Value');
            stylizer.apply(mainWrkCenterPkr, 'Value');
        }


        pageProxy.getClientData().DefaultValuesLoaded = true;
    }

    static createOnSuccess(pageProxy) {
        let assignmentType = libCommon.getWorkOrderAssignmentType(pageProxy);

        switch (assignmentType) {
            case '1':
                // Header Level - WorkOrderPartner
                return pageProxy.executeAction('/SAPAssetManager/Actions/WorkOrders/WorkOrderPartnerCreate.action');
            case '2':
                // Operation Level - Personel Number
                return pageProxy.executeAction('/SAPAssetManager/Actions/CreateUpdateDelete/UpdateEntitySuccessMessage.action');
            case '3':
                // Sub Operation Level - Personel Number
                return pageProxy.executeAction('/SAPAssetManager/Actions/CreateUpdateDelete/UpdateEntitySuccessMessage.action');
            case '4':
                // Operation Level - Employee ID
                return pageProxy.executeAction('/SAPAssetManager/Actions/Page/ClosePageNextChangeset.action');
            case '5':
                // Header Level - Planner Group
                return pageProxy.executeAction('/SAPAssetManager/Actions/Page/ClosePageNextChangeset.action');
            case '6':
                // Operation Level - Work Center
                return pageProxy.executeAction('/SAPAssetManager/Actions/Page/ClosePageNextChangeset.action');
            case '7':
                // Header Level - Business Partner
                return pageProxy.executeAction('/SAPAssetManager/Actions/WorkOrders/WorkOrderPartnerCreate.action');
            case '8':
                // Header Level - Work Center
                return pageProxy.executeAction('/SAPAssetManager/Actions/WorkOrders/Operations/WorkOrderOperationCreateUpdateNav.action');
            case 'A':
                // Operation Level - MRS (N/A)
                return Promise.resolve(true);
            default:
                //assuming default is 8
                return pageProxy.executeAction('/SAPAssetManager/Actions/WorkOrders/Operations/WorkOrderOperationCreateUpdateNav.action');
        }
    }

    /**
	 * Used for formatting and adding data to WorkOrders list view
     * @param context WorkOrderListView page context
	 */
    static WorkOrdersListViewFormat(context) {
        var section = context.getName();
        var property = context.getProperty();
        var binding = context.binding;
        var value = '';
        var clientData = libCommon.getClientDataForPage(context);
        switch (section) {
            case 'WorkOrdersListSection':
                switch (property) {
                    case 'StatusText':
                        try {
                            //Priorities and OrderTypes were cached prior to list screen loading
                            value = clientData.Priorities[clientData.OrderTypes[binding.OrderType].PriorityType + binding.Priority].PriorityDescription;
                            break;
                        } catch (err) {
                            break;
                        }
                    case 'SubstatusText':
                        value = libWoMobile.headerMobileStatus(context).then(function(mStatus) {
                            return context.localizeText(mStatus);
                        });
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
        return value;
    }
}

/**
 * The following class stores all of the Work Order controls specific methods
 */
export class WorkOrderControlsLibrary {

    /**
     * Planning Plant getter
     * @param {IPageProxy} pageProxy 
     */
    static getPlanningPlant(pageProxy) {
        let planningPlant = libCommon.getTargetPathValue(pageProxy, '#Page:WorkOrderCreateUpdatePage/#Control:PlanningPlantLstPkr/#Value');
        return libCommon.getListPickerValue(planningPlant);
    }

    /**
     * OrderType getter
     * @param {IPageProxy} pageProxy 
     */
    static getOrderType(pageProxy) {
        let orderType = libCommon.getTargetPathValue(pageProxy, '#Page:WorkOrderCreateUpdatePage/#Control:TypeLstPkr/#Value');
        return libCommon.getListPickerValue(orderType);
    }

    /**
     * Priority getting
     * @param {IPageProxy} pageProxy 
     */
    static getPriority(pageProxy) {
        let priorty = libCommon.getTargetPathValue(pageProxy, '#Page:WorkOrderCreateUpdatePage/#Control:PrioritySeg/#Value');
        return libCommon.getListPickerValue(priorty);
    }

    /**
     * Funcational Location getter
     * @param {IPageProxy} pageProxy 
     */
    static getFunctionalLocation(pageProxy) {
        let funcLoc = libCommon.getTargetPathValue(pageProxy, '#Page:WorkOrderCreateUpdatePage/#Control:FunctionalLocationLstPkr/#Value');
        return libCommon.getListPickerValue(funcLoc);
    }

    /**
     * Equipment getter
     * @param {IPageProxy} pageProxy 
     */
    static getEquipment(pageProxy) {
        let equipHeader = libCommon.getTargetPathValue(pageProxy, '#Page:WorkOrderCreateUpdatePage/#Control:EquipmentLstPkr/#Value');
        return libCommon.getListPickerValue(equipHeader);
    }

    /**
     * BusinessArea getter
     * @param {IPageProxy} pageProxy 
     */
    static getBusinessArea(pageProxy) {
        let businessArea = libCommon.getTargetPathValue(pageProxy, '#Page:WorkOrderCreateUpdatePage/#Control:BusinessAreaLstPkr/#Value');
        return libCommon.getListPickerValue(businessArea);
    }

    /**
     * WorkCenterPlant getter
     * @param {IPageProxy} pageProxy 
     */
    static getWorkCenterPlant(pageProxy) {
        let workCenterPlant = libCommon.getTargetPathValue(pageProxy, '#Page:WorkOrderCreateUpdatePage/#Control:WorkCenterPlantLstPkr/#Value');
        return libCommon.getListPickerValue(workCenterPlant);
    }

    /**
     * MainWorkCenter getter
     * @param {IPageProxy} pageProxy 
     */
    static getMainWorkCenter(pageProxy) {
        let mainWorkCenter = libCommon.getTargetPathValue(pageProxy, '#Page:WorkOrderCreateUpdatePage/#Control:MainWorkCenterLstPkr/#Value');
        return libCommon.getListPickerValue(mainWorkCenter);
    }

    /**
     * Update the order type control
     * @param {IPageProxy} pageProxy 
     */
    static updateOrderType(pageProxy) {
        try {
            let formCellContainer = pageProxy.getControl('FormCellContainer');

            let planningPlantControl = formCellContainer.getControl('PlanningPlantLstPkr');
            let typeControl = formCellContainer.getControl('TypeLstPkr');

            var typeCtrlSpecifier = typeControl.getTargetSpecifier();
            typeCtrlSpecifier.setQueryOptions("$filter=PlanningPlant eq '" + libCommon.getListPickerValue(planningPlantControl.getValue()) + "'&$orderby=OrderType");
            typeControl.setTargetSpecifier(typeCtrlSpecifier);
        } catch (err) {
            /**Implementing our Logger class*/
            Logger.error(pageProxy.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(),`updateOrderType Error: ${err}`);
        }
    }

    static rebindWorkCenterPlant(pageProxy) {
        let formCellContainer = pageProxy.getControl('FormCellContainer');
        let wcp = formCellContainer.getControl('WorkCenterPlantLstPkr');
        wcp.redraw();
    }

    /**
     * Update Main Work Center control
     * @param {IPageProxy} pageProxy 
     */
    static updateMainWorkCenter(pageProxy) {
        try {
            let formCellContainer = pageProxy.getControl('FormCellContainer');
            let workCenterPlantControlValue = formCellContainer.getControl('WorkCenterPlantLstPkr').getValue();

            if (!libVal.evalIsEmpty(workCenterPlantControlValue)) {
                let mainWorkCenterControl = formCellContainer.getControl('MainWorkCenterLstPkr');

                let workCenterPlantSpecifier = mainWorkCenterControl.getTargetSpecifier();
                workCenterPlantSpecifier.setQueryOptions("$filter=PlantId eq '" + libCommon.getListPickerValue(workCenterPlantControlValue) + "'");
                mainWorkCenterControl.setTargetSpecifier(workCenterPlantSpecifier);
            }
        } catch (err) {
            /**Implementing our Logger class*/
            Logger.error(pageProxy.GlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(),`updateMainWorkCenter Error: ${err}`);
        }

    }

    /**
     * Update Priority control
     * @param {IPageProxy} pageProxy 
     */
    static updatePriority(pageProxy) {
        try {
            // you need to get OrderType, then find out PriorityType that is associated with that OrderType;
            // because Priority depends on PriorityType property in OrderType
            let formCellContainer = pageProxy.getControl('FormCellContainer');
            let planningPlantValue = formCellContainer.getControl('PlanningPlantLstPkr').getValue();
            let orderTypeValue = formCellContainer.getControl('TypeLstPkr').getValue();

            return pageProxy.read('/SAPAssetManager/Services/AssetManager.service', 'OrderTypes', [], `$filter=OrderType eq '${orderTypeValue}' and PlanningPlant eq ${planningPlantValue}`)
                .then(function(myOrderTypes) {
                    let record = myOrderTypes.getItem(0);

                    let priorityControl = formCellContainer.getControl('PrioritySeg');
                    var priortiyCtrlSpecifier = priorityControl.getTargetSpecifier();
                    priortiyCtrlSpecifier.setQueryOptions(`$filter=PriorityType eq '${record.PriorityType}'&$orderby=Priority`);
                    priorityControl.setTargetSpecifier(priortiyCtrlSpecifier);
                    return true;
                });

        } catch (err) {
            /**Implementing our Logger class*/
            Logger.error(pageProxy.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(),`updatePriority Error: ${err}`);
            return Promise.reject(err);
        }
    }

    /**
     * Update Functional Location control
     * @param {IPageProxy} pageProxy 
     */
    static updateFunctionalLocation(pageProxy) {
        try {
            let formCellContainer = pageProxy.getControl('FormCellContainer');

            let planningPlantControlValue = formCellContainer.getControl('PlanningPlantLstPkr').getValue();
            let funcLocControl = formCellContainer.getControl('FunctionalLocationLstPkr');

            var funLocCtrlSpecifier = funcLocControl.getTargetSpecifier();
            funLocCtrlSpecifier.setQueryOptions("$filter=PlanningPlant eq '" + libCommon.getListPickerValue(planningPlantControlValue) + "'&$orderby=FuncLocDesc");
            funcLocControl.setTargetSpecifier(funLocCtrlSpecifier);
        } catch (err) {
            /**Implementing our Logger class*/
            Logger.error(pageProxy.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(),`updateFunctionalLocation Error: ${err}`);
        }
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
                equipmentCtrlSpecifier.setQueryOptions('&$orderby=EquipId');
            }

            equipmentControl.setTargetSpecifier(equipmentCtrlSpecifier);
        } catch (err) {
            /**Implementing our Logger class*/
            Logger.error(pageProxy.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(),`UpdateEquipment Error: ${err}`);
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
}


export class PrivateMethodsLibrary {

    static _setTitle(context, onCreate, onFollowUp) {
        let title = '';
        if (onCreate) {
            if (onFollowUp) {
                title = context.localizeText('workorder_add_followup');
            } else {
                title = context.localizeText('add_workorder');
            }
        } else {
            title = context.localizeText('edit_workorder');
        }
        context.setCaption(title);
    }

    static _isWorkCenterEditable(isOnCreate, isLocal) {
        if (!isOnCreate && !isLocal) {
            return false;
        } else {
            return true;
        }
    }

    static _isMainWorkCenterEditable(control, isOnCreate, isLocal) {
        let assignmentType = libCommon.getWorkOrderAssignmentType(control.getPageProxy());
        if (assignmentType === 8) {
            return false;
        } else if (!isOnCreate && !isLocal) {
            return false;
        } else {
            return true;
        }
    }

    static _isPlanningPlantEditable(isOnCreate, isLocal) {
        if (!isOnCreate && !isLocal) {
            return false;
        } else {
            return true;
        }
    }

    static _isFunctionalLocationEditable(isOnCreate, isLocal) {
        if (!isOnCreate && !isLocal) {
            return false;
        } else {
            return true;
        }
    }

    static _isEquipmentEditable(isOnCreate, isLocal) {
        if (!isOnCreate && !isLocal) {
            return false;
        } else {
            return true;
        }
    }

    static _isOrderTypeEditable(isOnCreate, isLocal) {
        if (!isOnCreate && !isLocal) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * return Note visibility based on isOnCreate;
     * 
     * @static
     * @param {boolean} isOnCreate 
     * @returns {boolean}
     * 
     * @memberof PrivateMethodsLibrary
     */
    static _shouldNoteVisible(isOnCreate) {
        return isOnCreate;
    }

    /**
     * return MarkedJob Switch visibility
     * 
     * @static
     * @param {boolean} isOnCreate 
     * @returns {boolean}
     * 
     * @memberof PrivateMethodsLibrary
     */
    static _shouldMarkedJobSwitchVisible(isOnCreate) {
        return !isOnCreate;
    }

    static _prioritySeg(controlProxy, onCreate) {
        let woOrderType = onCreate ? libCommon.getAppParam(controlProxy, 'WORKORDER', 'OrderType') : libCommon.getTargetPathValue(controlProxy, '#Property:OrderType');
        return controlProxy.read('/SAPAssetManager/Services/AssetManager.service', 'OrderTypes', [], `$filter=OrderType eq '${woOrderType}'`)
            .then(function(myOrderTypes) {
                let record = myOrderTypes.getItem(0);
                return "$filter=PriorityType eq '" + record.PriorityType + "'&$orderby=Priority";
            });
    }
}
