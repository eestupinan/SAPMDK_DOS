import libCom from '../Common/Library/CommonLibrary';
import libForm from '../Common/Library/FormatLibrary';
import libVal from '../Common/Library/ValidationLibrary';
import libThis from './NotificationLibrary';
import libDoc from '../Documents/DocumentLibrary';
import Constants from '../Common/Library/ConstantsLibrary';
import Logger from '../Log/Logger';
import {GlobalVar as globals} from '../Common/Library/GlobalCommon';

export default class {
    static NormalizeSequenceNumber(value) {
        return value !== undefined ? value : '[Local]';
    }

    /**
	 * Used for getting the Part Group on Notification Item/Task/Activity Details page
	 * USAGE: Format Rule
	 * REFERENCES: PMCatalogCodes
	 */
    static NotificationCodeGroupStr(context, type, codeGroup) {
        let notif = (context.binding.Notification || context.binding.Item.Notification);
        return this.CatalogCodeQuery(context, notif, type).then(function(result) {
            return context.read('/SAPAssetManager/Services/AssetManager.service', `PMCatalogProfiles(CodeGroup='${codeGroup}',CatalogProfile='${result.CatalogProfile}',Catalog='${result.Catalog}')`, [], '').then(function(data) {
                    return libForm.getFormattedKeyDescriptionPair(context, data.getItem(0).CodeGroup, data.getItem(0).Description);
                });
        });
    }
    /**
	 * Used for getting Part Details on Notification Item/Task/Activity Details page
	 * USAGE: Format Rule
	 * REFERENCES: PMCatalogCodes
	 */
    static NotificationCodeStr(context, type, codeGroup, code) {
        let notif = (context.binding.Notification || context.binding.Item.Notification);
        return this.CatalogCodeQuery(context, notif, type).then(function(result) {
            return context.read('/SAPAssetManager/Services/AssetManager.service', `PMCatalogCodes(Catalog='${result.Catalog}',Code='${code}',CodeGroup='${codeGroup}')`, [], '')
            .then(function(data) {
                return libForm.getFormattedKeyDescriptionPair(context, data.getItem(0).Code, data.getItem(0).CodeDescription);
            });
        });
        
    }
    /**
	 * Used for updating the Notification Task/Activity Code picker, based on selection from Group Picker
	 * USAGE: List On Change Rule
	 * References: (N/A)
	 */
    static NotificationTaskActivityCreateUpdateCode(context, type) {
        var selection = context.getValue();
        var page = context.getPageProxy().getControl('FormCellContainer');
        if (!page.isContainer()) {
            return Promise.resolve();
        }
        var targetList = page.getControl('CodeLstPkr');
        var specifier = targetList.getTargetSpecifier();

        if (selection.length > 0) {
            let notif = context.getPageProxy().binding;

            if (notif['@odata.type'] === '#sap_mobile.MyNotificationItem' || notif['@odata.type'] === '#sap_mobile.MyNotificationTask' || notif['@odata.type'] === '#sap_mobile.MyNotificationActivity') {
                notif = notif.Notification;
            } else if (notif['@odata.type'] === '#sap_mobile.MyNotificationItemCause' || notif['@odata.type'] === '#sap_mobile.MyNotificationItemTask' || notif['@odata.type'] === '#sap_mobile.MyNotificationItemActivity') {
                notif = notif.Item.Notification;
            }
            
            return this.CatalogCodeQuery(context, notif, type).then(function(result) {
                selection = selection[0].ReturnValue;

                specifier.setDisplayValue('{{#Property:Code}} - {{#Property:CodeDescription}}');
                specifier.setReturnValue('{Code}');

                specifier.setEntitySet('PMCatalogCodes');
                specifier.setService('/SAPAssetManager/Services/AssetManager.service');

                specifier.setQueryOptions("$filter=Catalog eq '" + result.Catalog + "' and CodeGroup eq '" + selection + "'&$orderby=Code");
                libCom.setEditable(targetList, true);

                return targetList.setTargetSpecifier(specifier);
            });
        } else {
            targetList.setValue('');
            targetList.setEditable(false);
            return Promise.resolve();
        }
    }
    /**
	 * Used for updating the Notification Item Part picker, based on selection from Part Group Picker
	 * USAGE: List On Change Rule
	 * References: (N/A)
	 */
    static NotificationItemCreateUpdatePart(context) {
        var selection = context.getValue();
        var page = context.getPageProxy().getControl('FormCellContainer');
        if (!page.isContainer()) {
            return null;
        }
        var targetList = page.getControl('PartDetailsLstPkr');
        var specifier = targetList.getTargetSpecifier();

        if (selection.length > 0) {
            // Grab current notification (if it exists)
            let notif = context.getPageProxy().binding;

            if (notif['@odata.type'] === '#sap_mobile.MyNotificationItem') {
                notif = notif.Notification;
            } else if (notif['@odata.type'] !== '#sap_mobile.MyNotificationHeader' ) {
                notif = libCom.getStateVariable(context, 'CreateNotification');
            }
            
            return this.CatalogCodeQuery(context, notif, 'CatTypeObjectParts').then(function(result) {
                selection = selection[0].ReturnValue;

                specifier.setDisplayValue('{{#Property:Code}} - {{#Property:CodeDescription}}');
                specifier.setReturnValue('{Code}');

                specifier.setEntitySet('PMCatalogCodes');
                specifier.setService('/SAPAssetManager/Services/AssetManager.service');

                specifier.setQueryOptions("$filter=Catalog eq '" + result.Catalog + "' and CodeGroup eq '" + selection + "'&$orderby=Code");
                libCom.setEditable(targetList, true);

                return targetList.setTargetSpecifier(specifier);
            });
        } else {
            targetList.setValue('');
            libCom.setEditable(targetList, false);
            return Promise.resolve();
        }
    }
    /**
	 * Used for updating the Notification Item Damage picker, based on selection from Damage Group Picker
	 * USAGE: List On Change Rule
	 * References: (N/A)
	 */
    static NotificationItemCreateUpdateDamage(context) {
        var selection = context.getValue();
        var page = context.getPageProxy().getControl('FormCellContainer');
        if (!page.isContainer()) {
            return null;
        }
        var targetList = page.getControl('DamageDetailsLstPkr');
        var specifier = targetList.getTargetSpecifier();

        if (selection.length > 0) {
            // Grab current notification (if it exists)
            let notif = context.getPageProxy().binding;

            if (notif['@odata.type'] === '#sap_mobile.MyNotificationItem') {
                notif = notif.Notification;
            } else if (notif['@odata.type'] !== '#sap_mobile.MyNotificationHeader') {
                notif = libCom.getStateVariable(context, 'CreateNotification');
            }
            
            return this.CatalogCodeQuery(context, notif, 'CatTypeDefects').then(function(result) {
                selection = selection[0].ReturnValue;

                specifier.setDisplayValue('{{#Property:Code}} - {{#Property:CodeDescription}}');
                specifier.setReturnValue('{Code}');

                specifier.setEntitySet('PMCatalogCodes');
                specifier.setService('/SAPAssetManager/Services/AssetManager.service');

                specifier.setQueryOptions("$filter=Catalog eq '" + result.Catalog + "' and CodeGroup eq '" + selection + "'&$orderby=Code");
                libCom.setEditable(targetList, true);

                return targetList.setTargetSpecifier(specifier);
            });
        } else {
            targetList.setValue('');
            libCom.setEditable(targetList, false);
            return Promise.resolve();
        }
    }
    /**
	 * 
	 */
    static NotificationCreateUpdatePrioritySelector(context) {
        var selection = context.getValue();
        var page = context.getPageProxy().getControl('FormCellContainer');
        if (!page.isContainer()) {
            return;
        }
        var targetList = page.getControl('PrioritySeg');
        var specifier = targetList.getTargetSpecifier();

        if (selection.length > 0) {
            selection = selection[0].ReturnValue;
            context.read('/SAPAssetManager/Services/AssetManager.service', 'NotificationTypes', [], "$filter=NotifType eq '" + selection + "'")
                .then(function(data) {
                    specifier.setDisplayValue('{PriorityDescription}');
                    specifier.setReturnValue('{Priority}');
                    specifier.setEntitySet('Priorities');
                    specifier.setService('/SAPAssetManager/Services/AssetManager.service');
                    specifier.setQueryOptions("$filter=PriorityType eq '" + data.getItem(0).PriorityType + "'");
                });
        }
        targetList.setTargetSpecifier(specifier).then(function() {
            var binding = targetList.getBindingObject();
            if (binding.Priority === undefined) {
                binding.Priority = libCom.getAppParam(targetList, 'NOTIFICATION', 'Priority');
            }
            targetList.setValue(binding.Priority);
        });
    }

    static GroupQuery(context, notification, type) {
        return this.CatalogCodeQuery(context, notification, type).then(function(value) {
            return "$filter=Catalog eq '" + value.Catalog + "' and CatalogProfile eq '" + value.CatalogProfile + "'&$orderby=CodeGroup";
        });
    }

    static CatalogCodeQuery(context, notification, type) {

        // Assume we do not have a valid readLink (We're on a changeset)
        let equipEntitySet = 'MyEquipments';
        let flocEntitySet = 'MyFunctionalLocations';

        let equipQuery = "$filter=EquipId eq '" + notification.HeaderEquipment + "' and length(CatalogProfile) gt 0";
        let flocQuery = "$filter=FuncLocIdIntern eq '" + notification.HeaderFunctionLocation + "' and length(CatalogProfile) gt 0";

        // If we are not on a changeset (and do have a valid readLink)
        if (notification['@odata.readLink'] && notification['@odata.readLink'] !== 'pending_1') {
            equipEntitySet = notification['@odata.readLink'] + '/Equipment';
            flocEntitySet = notification['@odata.readLink'] + '/FunctionalLocation';

            equipQuery = '';
            flocQuery = '';
        }

        // Handle optional order overrides
        let order = ['Equipment', 'FunctionalLocation', 'NotificationType'];
        if (globals.getAppParam().CATALOGTYPE.CatalogProfileOrder) {
            order = globals.getAppParam().CATALOGTYPE.CatalogProfileOrder.split(/, ?/);
        }

        let reads = [];
        
        // Equipment Read
        reads.push(context.read('/SAPAssetManager/Services/AssetManager.service', equipEntitySet, [], equipQuery));
        // Functional Location Read
        reads.push(context.read('/SAPAssetManager/Services/AssetManager.service', flocEntitySet, [], flocQuery));
        // Notification Type Read
        reads.push(context.read('/SAPAssetManager/Services/AssetManager.service', 'NotificationTypes', [], `$filter=NotifType eq '${notification.NotificationType}' and length(CatalogProfile) gt 0`));
        
        return Promise.all(reads).then(function(readResults) {

            // Handle optional Catalog Type overrides and populate defaults
            let catalogs = {'CatTypeActivities' : '', 'CatTypeObjectParts' : '', 'CatTypeDefects' : '', 'CatTypeTasks' : '', 'CatTypeCauses' : ''};
            for (let catType in catalogs) {
                if (globals.getAppParam().CATALOGTYPE[catType]) {
                    catalogs[catType] = globals.getAppParam().CATALOGTYPE[catType];
                } else {
                    catalogs[catType] = readResults[2].getItem(0)[catType];
                }
            }

            let readResultsAssoc = {
                'Equipment': readResults[0],
                'FunctionalLocation': readResults[1],
                'NotificationType': readResults[2],
            };

            let catalogProfileResults = [];

            for (let i in order) {
                let current = readResultsAssoc[order[i]];

                if (current && current.length > 0 && current.getItem(0).CatalogProfile) {
                    catalogProfileResults.push(Promise.resolve(current.getItem(0)).then(function(value) {
                            return context.count('/SAPAssetManager/Services/AssetManager.service', 'PMCatalogProfiles', `$filter=Catalog eq '${catalogs[type]}' and CatalogProfile eq '${value.CatalogProfile}'`).then(function(cnt) {
                            return { item: value, count: cnt, catalogProfile: value.CatalogProfile };
                        });
                    }));
                }
            }

            return Promise.all(catalogProfileResults).then(function(codeReadResults) {
                for (let i in codeReadResults) {
                    if (codeReadResults[i].count > 0) {
                        if (codeReadResults[i].item['@odata.type'] === '#sap_mobile.NotificationType') {
                            return {'Catalog' : codeReadResults[i].item[type], 'CatalogProfile' : codeReadResults[i].catalogProfile};
                        } else {
                            return {'Catalog' : catalogs[type], 'CatalogProfile' : codeReadResults[i].catalogProfile};
                        }
                    }
                }
                let defaultCatalogs = {'CatTypeActivities' : 'A', 'CatTypeObjectParts' : 'B', 'CatTypeDefects' : 'C', 'CatTypeTasks' : '2', 'CatTypeCauses' : '5'};
                return { 'Catalog': defaultCatalogs[type], 'CatalogProfile': readResults[2].getItem(0).CatalogProfile };
            });
        });
    }
    /**
	 * Used for setting the List Target QueryOptions for Notification Task/Activity Group
	 * USAGE: Target QueryOptions
	 * References: MyEquipments, MyFunctionalLocations, NotificationTypes
	 */
    static NotificationTaskActivityGroupQuery(context, type) {
        let binding = context.getPageProxy().binding;
        if (binding['@odata.type'] === '#sap_mobile.MyNotificationHeader') {
            // Simple case: we're on a Notification already
            return this.GroupQuery(context, binding, type);
        } else {
            // Alternate case: we're on an Item, Task, or Activity
            if (binding['@odata.readLink'] && (binding['@odata.type'] === '#sap_mobile.MyNotificationItem' || binding['@odata.type'] === '#sap_mobile.MyNotificationTask' || binding['@odata.type'] === '#sap_mobile.MyNotificationActivity')) {
                return context.read('/SAPAssetManager/Services/AssetManager.service', binding['@odata.readLink'] + '/Notification', [], '')
                    .then(function(data) {
                        return libThis.GroupQuery(context, data.getItem(0), type);
                    });
            } else {
                // Final case: We're creating a fresh Notification + Item
                binding = libCom.getStateVariable(context, Constants.notificationKey);
                if (binding) {
                    return this.GroupQuery(context, binding, type);
                } else {
                    // Shouldn't get here
                    return '';
                }
            }
        }
    }

    static NotificationTaskActivityCodeQuery(context, type, codeGroupName) {
        try {
            var codeGroup = libCom.getTargetPathValue(context, '#Property:' + codeGroupName);
            if (libCom.isDefined(codeGroup)) {
                libCom.setEditable(context, true);
            } else {
                libCom.setEditable(context, false);
            }
            let notif = context.getPageProxy().binding;

            if (notif['@odata.type'] === '#sap_mobile.MyNotificationItem' || notif['@odata.type'] === '#sap_mobile.MyNotificationActivity' || notif['@odata.type'] === '#sap_mobile.MyNotificationTask') {
                notif = notif.Notification;
            } else if (notif['@odata.type'] === '#sap_mobile.MyWorkOrderHeader') {
                notif = libCom.getStateVariable(context, 'CreateNotification');
            } else if (notif['@odata.type'] === '#sap_mobile.MyNotificationItemCause' || notif['@odata.type'] === '#sap_mobile.MyNotificationItemTask' || notif['@odata.type'] === '#sap_mobile.MyNotificationItemActivity') {
                notif = notif.Item.Notification;
            }

            return this.CatalogCodeQuery(context, notif, type).then(function(result) {
                return "$filter=Catalog eq '" + result.Catalog + "' and CodeGroup eq '" + codeGroup + "'&$orderby=Code,CodeGroup,Catalog";
            });
        } catch (exception) {
            libCom.setEditable(context, false);
            return '';
        }
    }

    /**
	 * Used for setting the List Target QueryOptions for Notification Item Task/Activity Group
	 * USAGE: Target QueryOptions
	 * References: MyEquipments, MyFunctionalLocations, NotificationTypes
	 */
    static NotificationItemTaskActivityGroupQuery(context, type) {
        var notificationItem = context.getPageProxy().binding;
        var parent = this;

        var specifier = '/Notification';

        if (notificationItem['@odata.type'] !== '#sap_mobile.MyNotificationItem') {
            specifier = '/Item' + specifier;
        }

        return context.read('/SAPAssetManager/Services/AssetManager.service', notificationItem['@odata.readLink'] + specifier, [], '')
            .then(function(data) {
                return parent.GroupQuery(context, data.getItem(0), type);
            });
    }

    ////////////////////////////////////////////////////

    static NotificationPriority(context, notificationType, priority) {
        try {
            if (priority !== undefined && priority !== null) {
                let pageBinding = context.getPageProxy().getClientData();

                if (pageBinding.NotificationTypes && pageBinding.Priorities) {
                    return pageBinding.Priorities[pageBinding.NotificationTypes[notificationType]][priority];
                } else {
                    return context.read('/SAPAssetManager/Services/AssetManager.service', 'NotificationTypes', [], '').then(function(data) {
                        // Make a dictionary cache of Notification Types
                        // pageBinding.NotificationTypes[NotifType] => PriorityType
                        pageBinding.NotificationTypes = Object();
                        data.forEach(function(value) {
                            pageBinding.NotificationTypes[value.NotifType] = value.PriorityType;
                        });
                        return context.read('/SAPAssetManager/Services/AssetManager.service', 'Priorities', [], '').then(function(priorityData) {
                            // Make a cache of Priorities
                            // pageBinding.Priorities[PriorityType] => {Priority, PriorityDescription}
                            pageBinding.Priorities = Object();
                            priorityData.forEach(function(value) {
                                var priorityMapping = pageBinding.Priorities[value.PriorityType];
                                if (!priorityMapping) {
                                    priorityMapping = {};
                                }
                                priorityMapping[value.Priority] = value.PriorityDescription;
                                pageBinding.Priorities[value.PriorityType] = priorityMapping;
                            });

                            // Return value
                            return pageBinding.Priorities[pageBinding.NotificationTypes[notificationType]][priority];
                        });
                    });
                }
            } else {
                return context.localizeText('unknown');
            }
        } catch (exception) {
            /**Implementing our Logger class*/
            Logger.debug(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryNotes.global').getValue(), '#Priority:Priority could not be evaluated. Returning Unknown.');
            return context.localizeText('unknown');
        }
    }

    /**
	 * Set the FromWorkorder flag
	 * @param {IPageProxy} context 
	 * @param {boolean} FlagValue 
	 */
    static setAddFromJobFlag(context, FlagValue) {
        libCom.setStateVariable(context, 'NotificationFromWorkorder', FlagValue, 'WorkOrderDetailsPage');
    }

    /**
	 * Set the FromWorkorder flag
	 * @param {IPageProxy} context 
	 * @param {boolean} FlagValue 
	 */
    static setAddFromOperationFlag(context, FlagValue) {
        libCom.setStateVariable(context, 'NotificationFromOperation', FlagValue, 'WorkOrderOperationDetailsPage');
    }

    /**
	 * Set the FromWorkorder flag
	 * @param {IPageProxy} context 
	 * @param {boolean} FlagValue 
	 */
    static setAddFromSuboperationFlag(context, FlagValue) {
        libCom.setStateVariable(context, 'NotificationFromSubOperation', FlagValue, 'WorkOrderSubOperationDetailsPage');
    }

    /**
     * gets the FromWorkorder flag
     * 
     * @static
     * @param {IClientAPI} context 
     * @return {boolean}
     * 
     * @memberof WorkOrderLibrary
     */
    static getAddFromJobFlag(context) {
        let result = libCom.getStateVariable(context, 'NotificationFromWorkorder', 'WorkOrderDetailsPage');
        if (result) {
            return result;
        } else {
            return false;
        }
    }

    static getAddFromOperationFlag(context) {
        let result = libCom.getStateVariable(context, 'NotificationFromOperation', 'WorkOrderOperationDetailsPage');
        if (result) {
            return result;
        } else {
            return false;
        }
    }
    static getAddFromSuboperationFlag(context) {
        let result = libCom.getStateVariable(context, 'NotificationFromSubOperation', 'WorkOrderSubOperationDetailsPage');
        if (result) {
            return result;
        } else {
            return false;
        }
    }

    /**
	 * Set the FromMap flag
	 * @param {IPageProxy} context 
	 * @param {boolean} FlagValue 
	 */
    static setAddFromMapFlag(context, FlagValue) {
        libCom.setStateVariable(context, 'NotificationFromMap', FlagValue);
    }


    /**
     * gets the FromMap flag
     * 
     * @static
     * @param {IClientAPI} context 
     * @return {boolean}
     */
    static getAddFromMapFlag(context) {
        let result = libCom.getStateVariable(context, 'NotificationFromMap');
        if (result) {
            return result;
        } else {
            return false;
        }
    }

    static NotificationCreateMainWorkCenter(context) {
        if (libCom.getNotificationAssignmentType(context) === '5') {
            let mainWorkcenter = libCom.getUserDefaultWorkCenter();

            return context.read('/SAPAssetManager/Services/AssetManager.service', 'WorkCenters', [], "$filter=ExternalWorkCenterId eq '" + mainWorkcenter + "'")
                .then(function(result) {
                    return result.getItem(0).WorkCenterId;
                });
        }
        return '';
    }

    static NotificationCreateMainWorkCenterPlant(context) {
        if (libCom.getNotificationAssignmentType(context) === '5') {
            return libCom.getNotificationPlanningPlant(context);
        }
        return '';
    }

    static NotificationCreateUpdateEquipmentLstPkrValue(context) {
        let equipmentListPicker = libCom.getTargetPathValue(context, '#Control:EquipmentLstPkr/#Value');
        return libCom.getListPickerValue(equipmentListPicker);
    }

    static NotificationCreateUpdateFunctionalLocationLstPkrValue(context) {
        let flocListPicker = libCom.getTargetPathValue(context, '#Control:FunctionalLocationLstPkr/#Value');
        return libCom.getListPickerValue(flocListPicker);
    }

    static NotificationCreateUpdateTypeLstPkrValue(context) {
        let typeListPicker = libCom.getTargetPathValue(context, '#Control:TypeLstPkr/#Value');
        return libCom.getListPickerValue(typeListPicker);
    }

    static NotificationCreateUpdatePrioritySegValue(context) {
        let priorityPicker = libCom.getTargetPathValue(context, '#Control:PrioritySeg/#Value');
        return libCom.getListPickerValue(priorityPicker);
    }

    static NotificationCreateUpdateBreakdownSwitchValue(context) {
        if (libCom.getTargetPathValue(context, '#Control:BreakdownSwitch/#Value') === '') {
            return false;
        } else {
            return true;
        }
    }

    static NotificationCreateUpdateOrderId(context) {
        if (!libVal.evalIsEmpty(libCom.getTargetPathValue(context, '#Property:OrderId'))) {
            return libCom.getTargetPathValue(context, '#Property:OrderId');
        } else if (libThis.getAddFromJobFlag(context)) {
            let workOrder = context.evaluateTargetPathForAPI('#Page:WorkOrderDetailsPage').getBindingObject();
            if (workOrder) {
                return workOrder.OrderId;
            }
        }
        return '';
    }

    /**
     * handle error and warning processing for Part create/update
     */
    static NotificationCreateUpdateValidation(context) {

        var dict = libCom.getControlDictionaryFromPage(context);
        dict.NotificationDescription.clearValidation();
        dict.TypeLstPkr.clearValidation();
        let valPromises = [];
        valPromises.push(libThis.CharacterLimitValidation(context, dict.NotificationDescription));
        valPromises.push(libThis.ValidateNoteNotEmpty(context, dict.NotificationDescription));
        valPromises.push(libThis.ValidateNotificationTypeNotEmpty(context, dict.TypeLstPkr));
        valPromises.push(libThis.ValidateNotificationTypeNotEmpty(context, dict.PrioritySeg));


        // check attachment count, run the validation rule if there is an attachment
        if (libDoc.attachmentSectionHasData(context)) {
            valPromises.push(libDoc.createValidationRule(context));
        }

        // Based on Jin's implementation check all validation promises;
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
            let container = context.getControl('FormCellContainer');
            container.redraw();
            return false;
        });


    }

    static CharacterLimitValidation(context, control) {
        control.clearValidation();
        let descriptionLength = String(control.getValue()).length;
        let characterLimit = libCom.getAppParam(context, 'NOTIFICATION', 'DescriptionLength');
        let characterLimitInt = parseInt(characterLimit);

        if (descriptionLength <= characterLimitInt) {
            return Promise.resolve(true);
        } else {
            let dynamicParams = [characterLimit];
            let message = context.localizeText('validation_maximum_field_length', dynamicParams);
            libCom.executeInlineControlError(context, control, message);
            return Promise.reject(false);
        }
    }

    static ValidateNotificationTypeNotEmpty(context, control) {
        if (libVal.evalIsEmpty(libCom.getListPickerValue(control.getValue()))) {
            let message = context.localizeText('field_is_required');
            libCom.executeInlineControlError(context, control, message);
            return Promise.reject(false);
        }
        return Promise.resolve(true);
    }

    static ValidateNoteNotEmpty(context, control) {
        if (!libVal.evalIsEmpty(control.getValue())) {
            return Promise.resolve(true);
        } else {
            let message = context.localizeText('field_is_required');
            libCom.executeInlineControlError(context, control, message);
            return Promise.reject(false);
        }

    }

    static ValidateControlIsRequired(context, control) {
        var pass = false;
        var value = control.getValue();
        if (Array.isArray(value)) {
            if (control.getValue()[0]) {
                pass = true;
            }
        } else {
            if (!libVal.evalIsEmpty(value)) {
                pass = true;
            }
        }

        if (pass) {
            return Promise.resolve(true);
        } else {
            let message = context.localizeText('is_required');
            libCom.setInlineControlError(context, control, message);
            return Promise.reject(false);
        }

    }

    /**
	* validation rule of NotificationItem Create/Update action
	* 
	* @static
	* @param {IPageProxy} context 
	* @return {Boolean}
	*/
    static NotificationItemCreateUpdateValidation(context) {
        var dict = libCom.getControlDictionaryFromPage(context);
        dict.NameTitle.clearValidation();
        dict.PartGroupLstPkr.clearValidation();
        dict.PartDetailsLstPkr.clearValidation();
        dict.DamageGroupLstPkr.clearValidation();
        dict.DamageDetailsLstPkr.clearValidation();

        let valPromises = [];
        // put all validation promises on array
        valPromises.push(libThis.CharacterLimitValidation(context, dict.NameTitle));
        valPromises.push(libThis.ValidateControlIsRequired(context, dict.PartGroupLstPkr));
        valPromises.push(libThis.ValidateControlIsRequired(context, dict.PartDetailsLstPkr));
        valPromises.push(libThis.ValidateControlIsRequired(context, dict.DamageGroupLstPkr));
        valPromises.push(libThis.ValidateControlIsRequired(context, dict.DamageDetailsLstPkr));


        return Promise.all(valPromises).then(() => {
            return true;
        }).catch(() => {
            let container = context.getControl('FormCellContainer');
            container.redraw();
            return false;
        });
    }

    /**
     * validation rule of NotificationItem Create/Update action
     * 
     * @static
     * @param {IPageProxy} context 
     * @return {Boolean}
     */
    static NotificationTaskCreateUpdateValidationRule(context) {
        var dict = libCom.getControlDictionaryFromPage(context);
        dict.DescriptionTitle.clearValidation();
        dict.GroupLstPkr.clearValidation();
        dict.CodeLstPkr.clearValidation();

        let valPromises = [];
        // put all validation promises on array
        valPromises.push(libThis.CharacterLimitValidation(context, dict.DescriptionTitle));
        valPromises.push(libThis.ValidateControlIsRequired(context, dict.GroupLstPkr));
        valPromises.push(libThis.ValidateControlIsRequired(context, dict.CodeLstPkr));

        return Promise.all(valPromises).then(() => {
            return true;
        }).catch(() => {
            let container = context.getControl('FormCellContainer');
            container.redraw();
            return false;
        });
    }


    /**
     * validation rule of NotificationItem Create/Update action
     * 
     * @static
     * @param {IPageProxy} context 
     * @return {Boolean}
     */
    static NotificationActivityCreateUpdateValidation(context) {
        var dict = libCom.getControlDictionaryFromPage(context);
        dict.DescriptionTitle.clearValidation();
        dict.GroupLstPkr.clearValidation();
        dict.CodeLstPkr.clearValidation();

        let valPromises = [];
        // put all validation promises on array
        valPromises.push(libThis.CharacterLimitValidation(context, dict.DescriptionTitle));
        valPromises.push(libThis.ValidateControlIsRequired(context, dict.GroupLstPkr));
        valPromises.push(libThis.ValidateControlIsRequired(context, dict.CodeLstPkr));

        return Promise.all(valPromises).then(() => {
            return true;
        }).catch(() => {
            let container = context.getControl('FormCellContainer');
            container.redraw();
            return false;
        });
    }


    /**
     * validation rule of NotificationItemCause Create/Update action
     * 
     * @static
     * @param {IPageProxy} context 
     * @return {Boolean}
     */
    static NotificationItemCauseCreateUpdateValidation(context) {
        var dict = libCom.getControlDictionaryFromPage(context);
        dict.DescriptionTitle.clearValidation();
        dict.GroupLstPkr.clearValidation();
        dict.CodeLstPkr.clearValidation();

        let valPromises = [];
        // put all validation promises on array
        valPromises.push(libThis.CharacterLimitValidation(context, dict.DescriptionTitle));
        valPromises.push(libThis.ValidateControlIsRequired(context, dict.GroupLstPkr));
        valPromises.push(libThis.ValidateControlIsRequired(context, dict.CodeLstPkr));

        return Promise.all(valPromises).then(() => {
            return true;
        }).catch(() => {
            let container = context.getControl('FormCellContainer');
            container.redraw();
            return false;
        });
    }

    static createUpdateOnPageUnloaded(pageProxy) {
        //reset global state
        libCom.setOnCreateUpdateFlag(pageProxy, '');

    }

}
