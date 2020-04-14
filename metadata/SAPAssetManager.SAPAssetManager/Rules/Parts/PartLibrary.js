import libCom from '../Common/Library/CommonLibrary';
import libVal from '../Common/Library/ValidationLibrary';
import libThis from './PartLibrary';
import libForm from '../Common/Library/FormatLibrary';
import Constants from '../Common/Library/ConstantsLibrary';
import Logger from '../Log/Logger';
import Stylizer from '../Common/Style/Stylizer';
import ODataDate from '../Common/Date/ODataDate';
import pageCaptionCount from '../Common/PageCaptionCount';
export default class {
    /**
     * Runs when the part details screen is loaded
     */
    static partDetailsOnPageLoad(pageClientAPI) {

        let binding = pageClientAPI.binding;
        let textCategory = libCom.getAppParam(pageClientAPI, 'PART', 'TextItemCategory');
        let textDescription = pageClientAPI.localizeText('text_item');
        let partLabel = pageClientAPI.localizeText('part');

        pageClientAPI.setCaption(libForm.formatDetailHeaderDisplayValue(pageClientAPI, libThis.getPartPlusDescription(pageClientAPI, binding.ItemCategory, textCategory, binding.TextTypeDesc, textDescription, binding.ComponentDesc, binding.MaterialNum, true, false), partLabel));
    }
    //*************************************************************
    // Create/Update Part
    //*************************************************************

    /**
     * Runs when a tracked field on the part add/edit screen is changed
     */
    static partCreateUpdateOnChange(control) {
        let controlName = control.getName();
        let context = control.getPageProxy();
        let controls = libCom.getControlDictionaryFromPage(context);

        switch (controlName) {
            case Constants.PartCategoryLstPkr:
                //Text item
                if (libThis.evalIsTextItem(context, controls)) {

                    libThis.partCreateUpdateFieldVisibility(context, controls);
                    // if it's a text item we will not have "Select Material" screen and the total count of the number of screen in the wizard will decreases from 3 to 2
                    libCom.setStateVariable(context, 'TotalPageCount',control.getGlobalDefinition('/SAPAssetManager/Globals/PageCounts/PartCreateTextItemCount.global').getValue());
                    //Material item
                } else {
                    libCom.setStateVariable(context, 'TotalPageCount',control.getGlobalDefinition('/SAPAssetManager/Globals/PageCounts/PartCreateCount.global').getValue());
                    libThis.partCreateUpdateFieldVisibility(context, controls);
                }
                pageCaptionCount(control.getPageProxy(), 'search_part');
                break;
            case Constants.PlantListPickerKey:
                //On plant change, re-filter storage location by Plant
                try {
                    controls.StorageLocationLstPkr.setValue('');
                    let slocControl = context.evaluateTargetPath('#Control:StorageLocationLstPkr');
                    slocControl.observable()._resolveCollection().then(() => { //Reload the storage location list picker - workaround since currently unsupported from MDK
                        slocControl.observable()._assignItems();
                        slocControl.observable()._assignSelections();
                        slocControl.redraw();
                    });
                } catch (err) {
                    /**Implementing our Logger class*/
                    Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryParts.global').getValue(),`PartLibrary.partCreateUpdateOnChange(PlantLstPkr) error: ${err}`);
                }
                break;
            case Constants.MaterialListPickerKey:
                //On material change, re-filter MaterialUOMLstPkr by material
                try {
                    let materialUOMLstPkrSpecifier = controls.MaterialUOMLstPkr.getTargetSpecifier();
                    let materialUOMLstPkrQueryOptions = '$select=UOM&$orderby=UOM';
                    let material = '';

                    if (!libVal.evalIsEmpty(libCom.getControlValue(controls.MaterialLstPkr))) {
                        material = libCom.getControlValue(controls.MaterialLstPkr);
                    }
                    controls.MaterialUOMLstPkr.setValue('');
                    materialUOMLstPkrQueryOptions += `&$filter=MaterialNum eq '${material}'`;
                    materialUOMLstPkrSpecifier.setQueryOptions(materialUOMLstPkrQueryOptions);
                    controls.MaterialUOMLstPkr.setTargetSpecifier(materialUOMLstPkrSpecifier);
                } catch (err) {
                    /**Implementing our Logger class*/
                    Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryParts.global').getValue(), `PartLibrary.partCreateUpdateOnChange(MaterialLstPkr) error: ${err}`);
                }
                break;
            default:
                break;
        }
    }


    static partOnPageLoad(context) {
        let controls = libCom.getControlDictionaryFromPage(context);
        let textEntryStyle = new Stylizer(['FormCellTextEntry']);
        let stylizer = new Stylizer(['GrayText']);
        let formCellContainerProxy = context.getControl('FormCellContainer');
        let quantitySim = formCellContainerProxy.getControl('QuantitySim');
        if (quantitySim) {
            textEntryStyle.apply(quantitySim, 'Value');
        }
        let orderId = formCellContainerProxy.getControl('Order');
        if (orderId) {
            stylizer.apply(orderId, 'Value');
        }
        libThis.partCreateUpdateFieldVisibility(context, controls);
        libThis.partCreateUpdateFieldValues(context, controls);
        return context.getControl('FormCellContainer').redraw();
    }
    /**
     * Runs when the part add/edit screen is loaded
     */
    static partCreateUpdateOnPageLoad(context) {
        if (libCom.IsOnCreate(context)) {
            libCom.setStateVariable(context, 'TotalPageCount',context.getGlobalDefinition('/SAPAssetManager/Globals/PageCounts/PartCreateCount.global').getValue());
            pageCaptionCount(context, 'search_part');
        } else {
            context.setCaption(context.localizeText('edit_part'));
        }
        this.partOnPageLoad(context);
        let slocControl = context.evaluateTargetPath('#Control:StorageLocationLstPkr');
        if (slocControl) {
            return slocControl.observable()._resolveCollection().then(() => { //Reload the storage location list picker - workaround since currently unsupported from MDK
                slocControl.observable()._assignItems();
                slocControl.observable()._assignSelections();
                slocControl.redraw();
            });
        }
        return null;
    }
    static partSummaryCreateUpdateOnPageLoad(context) {
        pageCaptionCount(context, 'part_summary');
       return this.partOnPageLoad(context);
    }

    /**
     * Sets the initial values for fields when the screen is loaded
     */
    static partCreateUpdateFieldValues(context, controls) {
        let binding = context.binding;
        let partCatValue;
        let stockItemCode = libCom.getAppParam(context, 'PART', 'StockItemCategory');
        let stockItemDescription = context.localizeText('stock_item');
        let textItemCode = libCom.getAppParam(context, 'PART', 'TextItemCategory');
        let textItemDescription = context.localizeText('text_item');
        if (controls.OnlineSearchSwitch) controls.OnlineSearchSwitch.setValue(false);

        //Default to stock item on create, else use saved value
        if (binding.hasOwnProperty('ItemCategory')) {
            if (binding.ItemCategory === stockItemCode) {
                partCatValue = libForm.getFormattedKeyDescriptionPair(context,stockItemCode,stockItemDescription);
                controls.PartCategoryLstPkr.setValue(partCatValue);
            } else {
                partCatValue = libForm.getFormattedKeyDescriptionPair(context,textItemCode,textItemDescription);
                controls.PartCategoryLstPkr.setValue(partCatValue);
            }
        } else {
            partCatValue = libCom.getTargetPathValue(context,'#Page:PartCreatePage/#Control:PartCategoryLstPkr/#SelectedValue');
            controls.PartCategoryLstPkr.setValue(partCatValue);
        }
    }

    static partCreateSummaryFieldValues(context) {
        let controls = libCom.getControlDictionaryFromPage(context);
        let plantCtrl = controls.PlantLstPkr;
        if (libCom.isDefined(context.evaluateTargetPathForAPI('#Page:-Previous').getClientData().FromErrorArchive) || libCom.isDefined(context.evaluateTargetPathForAPI('#Page:-Previous').getClientData().ErrorObject)) {
            if (libCom.isDefined(context.binding)) {
                plantCtrl.setValue(context.binding.Plant);
                controls.MaterialLstPkr.setValue(context.binding.MaterialNum);
            }
        } else {
            plantCtrl.setValue(libCom.getListPickerDisplayValue(libThis.getPlantControl(context).getValue()));
        }
    }

    static getPlantControl(context) {
        if (libCom.IsOnCreate(context)) {
            if (libThis.isOnlineSearch(context)) {
                return context.evaluateTargetPath('#Page:PartCreatePage/#Control:WorkCenterPlantLstPkr');
            } else {
                return context.evaluateTargetPath('#Page:PartCreatePage/#Control:WorkCenterPlantLstPkr');
            }
        } else {
            return context.evaluateTargetPath('#Control:PlantLstPkr');
        }

    }

    static isOnlineSearch(context) {
        try {
            return context.evaluateTargetPath('#Page:PartCreatePage/#Control:OnlineSearchSwitch/#Value');
        } catch (err) {
            return false;
        }
    }

    /**
     * Sets the visibility state for fields when the screen is loaded
     */
    static partCreateUpdateFieldVisibility(context, controls) {

        let onlineSearch = libThis.isOnlineSearch(context);


        //Text item
        if (libThis.evalIsTextItem(context, controls) && onlineSearch === false) {
            if (controls.TextItemSim) controls.TextItemSim.setVisible(true);
            if (controls.MaterialLstPkr) controls.MaterialLstPkr.setVisible(false);
            if (controls.MaterialUOMLstPkr) controls.MaterialUOMLstPkr.setVisible(false);
            if (controls.UOMSim) controls.UOMSim.setVisible(false);
        //Material item
        } else {
            if (controls.TextItemSim) controls.TextItemSim.setVisible(false);
            if (controls.MaterialLstPkr) controls.MaterialLstPkr.setVisible(true);
            if (controls.MaterialUOMLstPkr) controls.MaterialUOMLstPkr.setVisible(true);
            if (controls.UOMSim) controls.UOMSim.setVisible(false);
            if (controls.StorageLocationLstPkr) {
                controls.StorageLocationLstPkr.setVisible(libThis.isOnlineSearch(context));
                controls.StorageLocationLstPkr.setValue('');
            }
            if (controls.material) {
                controls.material.setValue('');
                controls.material.setVisible(libThis.isOnlineSearch(context));
            }
            if (controls.materialDesc) {
                controls.materialDesc.setVisible(libThis.isOnlineSearch(context));
                controls.materialDesc.setValue('');

            }
        }
        ///Enable and disable controls for text or Stock items coming from Error archive
        if (libCom.isDefined(context.evaluateTargetPathForAPI('#Page:-Previous').getClientData().FromErrorArchive) || libCom.isDefined(context.evaluateTargetPathForAPI('#Page:-Previous').getClientData().ErrorObject)) {
            if (libCom.isDefined(context.binding)) {
                ////Check for TextItem
              if (context.binding.ItemCategory === libCom.getAppParam(context, 'PART', 'TextItemCategory')) {
                    if (controls.TextItemSim) controls.TextItemSim.setVisible(true);
                    if (controls.MaterialLstPkr) controls.MaterialLstPkr.setVisible(false);
                    if (controls.MaterialUOMLstPkr) controls.MaterialUOMLstPkr.setVisible(false);
                    if (controls.UOMSim) controls.UOMSim.setVisible(false);
                    if (controls.StorageLocationLstPkr) controls.StorageLocationLstPkr.setVisible(libThis.isOnlineSearch(context));
                    if (controls.material) controls.material.setVisible(libThis.isOnlineSearch(context));
                    if (controls.materialDesc) controls.materialDesc.setVisible(libThis.isOnlineSearch(context));           
                } else {
                    if (controls.TextItemSim) controls.TextItemSim.setVisible(false);
                    if (controls.MaterialLstPkr) controls.MaterialLstPkr.setVisible(true);
                    if (controls.MaterialUOMLstPkr) controls.MaterialUOMLstPkr.setVisible(true);
                    if (controls.UOMSim) controls.UOMSim.setVisible(false);
                    if (controls.StorageLocationLstPkr) controls.StorageLocationLstPkr.setVisible(libThis.isOnlineSearch(context));
                    if (controls.material) controls.material.setVisible(libThis.isOnlineSearch(context));
                    if (controls.materialDesc) controls.materialDesc.setVisible(libThis.isOnlineSearch(context));
                }
            }
        }
    }

    /**
     * handle error and warning processing for Part create/update
     */
    static partCreateUpdateValidation(pageClientAPI) {

        var dict = libCom.getControlDictionaryFromPage(pageClientAPI);

        libCom.setInlineControlErrorVisibility(dict.QuantitySim, false);
        libCom.setInlineControlErrorVisibility(dict.PlantLstPkr, false);
        libCom.setInlineControlErrorVisibility(dict.OperationLstPkr, false);
        libCom.setInlineControlErrorVisibility(dict.UOMSim, false);
        //Clear validation will refresh all fields on screen
        dict.MaterialLstPkr.clearValidation();

        return libThis.validateQuantityGreaterThanZero(pageClientAPI, dict)
            .then(libThis.validatePlantNotBlank.bind(null, pageClientAPI, dict), libThis.validatePlantNotBlank.bind(null, pageClientAPI, dict))
            .then(libThis.validateUOMExceedsLength.bind(null, pageClientAPI, dict), libThis.validateUOMExceedsLength.bind(null, pageClientAPI, dict))
            .then(libThis.validateOperationNotBlank.bind(null, pageClientAPI, dict), libThis.validateOperationNotBlank.bind(null, pageClientAPI, dict))
            .then(libThis.validateQuantityIsNumeric.bind(null, pageClientAPI, dict), libThis.validateQuantityIsNumeric.bind(null, pageClientAPI, dict))
            .then(libThis.validateMaterialNotBlank.bind(null, pageClientAPI, dict), libThis.validateMaterialNotBlank.bind(null, pageClientAPI, dict))
            .then(libThis.processInlineErrors.bind(null, pageClientAPI, dict), libThis.processInlineErrors.bind(null, pageClientAPI, dict))
            .then(function() {
                return true; 
            }, function() {
                return false; 
            }); //Pass back true or false to calling action
    }

    /**
     * Sets values for part create/update properties before writing to the data store using OData service.
     * @param {*} context The context proxy depending on where this rule is being called from.
     * @param {String} key The PartCreate.action property name.
     */
    static partCreateUpdateSetODataValue(context, key) {
        var controls = libCom.getControlDictionaryFromPage(context);
        let isTextItem = libThis.evalIsTextItem(context, controls);
        let materialNum = libThis.getMaterialNum(context);
        let operationNo = libCom.getControlValue(controls.OperationLstPkr);
        let orderId = libCom.getControlValue(controls.Order);

        switch (key) {
            case Constants.ItemCategoryKey:
                if (isTextItem) {
                    return libCom.getAppParam(context, 'PART', 'TextItemCategory');
                } else {
                    return libCom.getAppParam(context, 'PART', 'StockItemCategory');
                }
            case Constants.ItemCategoryDescKey:
                if (isTextItem) {
                    return context.localizeText('text_item');
                } else {
                    return context.localizeText('stock_item');
                }
            case Constants.OperationNoKey:
                return operationNo;
            case Constants.MaterialNumKey:
                return materialNum;
            case Constants.TransactionID:
                return orderId;    
            case Constants.PlantKey:
                return libCom.getControlValue(libThis.getPlantControl(context));
            case Constants.UnitOfMeasureKey:
                if (isTextItem) {
                    return libCom.getControlValue(controls.UOMSim);
                } else {
                    return libCom.getControlValue(controls.MaterialUOMLstPkr);
                }
            case Constants.ComponentDescKey:
                return libThis.getPartDescription(context, materialNum);
            case Constants.OperationDescKey: {
                return libThis.getOperationDescription(context, operationNo, orderId);
            }
            case Constants.StorageLocationKey: {
                return libThis.getPartStorageLocation(context);
            }
            case Constants.CreateLinksKey: {
                let createLinks = [];

                //This link is needed to successfully add a local component to a local operation of a local work order in the SAP backend during sync.
                let operationCreateLink = context.createLinkSpecifierProxy('WOOperation', 'MyWorkOrderOperations', '$filter=OrderId eq \'' + orderId+ '\' and OperationNo eq \'' + operationNo + '\'' , '');
                createLinks.push(operationCreateLink.getSpecifier());

                //This link is needed to be able to navigate from a local work order to its parts list.
                // let workOrderReadLink = context.binding['@odata.readLink'];
                // let woCreateLink = context.createLinkSpecifierProxy('WOHeader', 'MyWorkOrderHeaders', '', workOrderReadLink);
                // createLinks.push(woCreateLink.getSpecifier());

                return createLinks;
            }
            default:
                return '';
        }
    }

    /**
     * Gets the material number given the part id.
     * 
     * @param {*} context The context proxy depending on where this rule is being called from.
     * @param {String} partId The material part id.
     */
    static getMaterialNum(context) {
        let binding = context.binding;
        if (binding.hasOwnProperty('MaterialNum')) {
            return binding.MaterialNum;
        } 
        return '';
    }

    /**
     * Gets the material description given the part id.
     * 
     * @param {*} context The context proxy depending on where this rule is being called from.
     * @param {String} partId The material part id.
     */
    static getPartDescription(context, partId) {
        return context.read(
            '/SAPAssetManager/Services/AssetManager.service', 'Materials', [],
            "$select=Description&$filter=MaterialNum eq '" + partId + "'").then(result => {
                if (!libVal.evalIsEmpty(result)) {
                    //Grab the first row (should only ever be one row)
                    return result.getItem(0).Description;
                } else {
                    return '';   
                }
            }, err => {
                /**Implementing our Logger class*/
                Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryParts.global').getValue(),`PartLibrary.getPartDescription() OData read error: ${err}`);
                return '';
            });
    }

    /**
     * Gets the material storage location given the part id.
     * 
     * @param {*} context The context proxy depending on where this rule is being called from.
     * @param {String} partId The material part id.
     */
    static getPartStorageLocation(context) {
        let sloc = '';
        if (libThis.isOnlineSearch(context)) {
            sloc = context.binding.StorageLocation;
        } else {
            if (context.binding.MaterialSLocs && context.binding.MaterialSLocs[0]) {
                sloc = context.binding.MaterialSLocs[0].StorageLocation;
            }
        }
        return sloc;
    }

    /**
     * Gets the operation description given the operation id and work order id
     * 
     * @param {*} context The context proxy depending on where this rule is being called from.
     * @param {String} operationNum The operation number.
     * @param {String} workOrderId Work order id.
     */
    static getOperationDescription(context, operationNum, workOrderId) {
        return context.read(
            '/SAPAssetManager/Services/AssetManager.service', 'MyWorkOrderOperations', [],
            "$select=OperationShortText&$filter=(OperationNo eq '" + operationNum + "' and OrderId eq '" + workOrderId + "')").then(result => {
                if (!libVal.evalIsEmpty(result)) {
                    //Grab the first row (should only ever be one row)
                    return result.getItem(0).OperationShortText;
                } else {
                    return ''; 
                }
            }, err => {
                /**Implementing our Logger class*/
                Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryParts.global').getValue(),`PartLibrary.getOperationDescription() OData read error: ${err}`);
                return '';
            });
    }


    //*************************************************************
    // Issue Part Create/Update
    //*************************************************************


    /**
     * Runs when the part issue add/edit screen is loaded
     */
    static PartIssueCreateUpdateOnPageLoad(pageClientAPI) {

        libThis.partIssueCreateUpdateFieldValues(pageClientAPI);
        libThis.partIssueCreateUpdateCalculateQuantity(pageClientAPI);
        libThis.partIssueCreateUpdateFieldVisibility(pageClientAPI);
        libThis.partIssueCreateUpdateFieldEnabled(pageClientAPI);
    }

    static partIssueUpdateFormattedValues(pageClientAPI) {
        let dict = {};
        dict = libCom.getControlDictionaryFromPage(pageClientAPI);
        let binding = '';
        if (pageClientAPI.binding.RelatedItem) {
            binding = pageClientAPI.binding.RelatedItem[0]; 
        } else {
            binding = pageClientAPI.binding;
        }
        libThis.getPlantPlusDescription(pageClientAPI, binding.Plant).then(result => {
            dict.PlantSim.setValue(result);
        });
        libThis.getPartDescription(pageClientAPI, binding.Material).then(result => {
            dict.MaterialSim.setValue(libForm.getFormattedKeyDescriptionPair(pageClientAPI, binding.Material, result));
        });
    }

    /**
     * Sets the initial values for fields when the screen is loaded
     */
    static partIssueCreateUpdateFieldValues(pageClientAPI) {

        let dict = {};
        dict = libCom.getControlDictionaryFromPage(pageClientAPI);
        let binding = pageClientAPI.binding;

        let textCategory = libCom.getAppParam(pageClientAPI, 'PART', 'TextItemCategory');
        let textDescription = pageClientAPI.localizeText('text_item');

        dict.MaterialSim.setValue(libThis.getPartPlusDescription(pageClientAPI, binding.ItemCategory, textCategory, binding.TextTypeDesc, textDescription, binding.ComponentDesc, binding.MaterialNum));
        return libThis.getPlantPlusDescription(pageClientAPI, binding.Plant).then(result => {
            dict.PlantSim.setValue(result);
        }).catch(err => {
            /**Implementing our Logger class*/
            Logger.error(pageClientAPI.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryParts.global').getValue(), err);
            dict.PlantSim.setValue('');
        });
    }

    /**
     * Sets the initial valuefor quantity to issue when the screen is loaded
     * Calcuation is: required - withdrawn (backend) - withdrawn (local issues)
     * @param {*} context 
     */
    static partIssueCreateUpdateCalculateQuantity(context) {

        let binding = context.binding;
        let required = Number(binding.RequirementQuantity);
        let withdrawn = Number(binding.WithdrawnQuantity);
        let control = libCom.getControlProxy(context, 'QuantitySim');

        return libThis.getLocalQuantityIssued(context, binding).then(result => {
            withdrawn += result;
            if (withdrawn > required) {
                withdrawn = required;
            }
            control.setValue((required - withdrawn).toString());
        }).catch(err => {
            /**Implementing our Logger class*/
            Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryParts.global').getValue(), err);
            control.setValue('');
        });
    }

    /**
     * handle error and warning processing for Part create/update
     */
    static partIssueCreateUpdateValidation(pageClientAPI) {

        var dict = libCom.getControlDictionaryFromPage(pageClientAPI);
        dict.InlineErrorsExist = false;

        libCom.setInlineControlErrorVisibility(dict.StorageLocationLstPkr, false);
        dict.QuantitySim.clearValidation();

        //First process the inline errors
        return libThis.validateQuantityGreaterThanZero(pageClientAPI, dict)
            .then(libThis.validateQuantityIsNumeric.bind(null, pageClientAPI, dict), libThis.validateQuantityIsNumeric.bind(null, pageClientAPI, dict))
            .then(libThis.validateStorageLocationNotBlank.bind(null, pageClientAPI, dict), libThis.validateStorageLocationNotBlank.bind(null, pageClientAPI, dict))
            .then(libThis.processInlineErrors.bind(null, pageClientAPI, dict), libThis.processInlineErrors.bind(null, pageClientAPI, dict))
            //If there are dialog based validation rules or warnings, add them to the chain here
            .then(function() {
                return true; 
            }, function() {
                return false; 
            }); //Pass back true or false to calling action
    }

    /**
     * Called after all inline validation has taken place in the main promise chain.
     * If an inline enabled validation rule has failed, then return a promise failure, else return a promise success
     * Chain will move on to dialog enabled validation if no inline we're triggered
     * @param {*} dict 
     */
    static processInlineErrors(context, dict) {
        if (dict.InlineErrorsExist) {
            context.getControl('FormCellContainer').redraw();
            return Promise.reject(false);
        } else {
            return Promise.resolve(true);
        }

    }

    //*************************************************************
    // Validation Rules
    //*************************************************************

    /**
     * UOM be <= length limit defined in global
     */
    static validateUOMExceedsLength(pageClientAPI, dict) {
        
        //New short text length must be <= global maximum
        let error = false;
        let message;
        let max = libCom.getAppParam(pageClientAPI, 'PART', 'UOMLength');

        if (libThis.evalIsTextItem(pageClientAPI, dict)) {
            if (libThis.evalUOMLengthWithinLimit(dict, max)) {
                return Promise.resolve(true);
            } else {
                error = true;
                let params=[max];
                message = pageClientAPI.localizeText('maximum_field_length',params);
            }
        }
        if (error) {
            libCom.setInlineControlError(pageClientAPI, dict.UOMSim, message);
            dict.InlineErrorsExist = true;
            return Promise.reject(false);
        } else {
            return Promise.resolve(true);
        }
    }

    /**
     * Plant required for a part
     */
    static validatePlantNotBlank(pageClientAPI, dict) {

        if (!libThis.evalPlantIsEmpty(dict)) {
            return Promise.resolve(true);
        } else {
            let message = pageClientAPI.localizeText('field_is_required');
            libCom.setInlineControlError(pageClientAPI, dict.PlantLstPkr, message);
            dict.InlineErrorsExist = true;
            return Promise.reject(false);
        }
    }

    /**
     * Operation required for a part
     */
    static validateOperationNotBlank(pageClientAPI, dict) {

        if (!libThis.evalOperationIsEmpty(dict)) {
            return Promise.resolve(true);
        } else {
            let message = pageClientAPI.localizeText('field_is_required');
            libCom.setInlineControlError(pageClientAPI, dict.OperationLstPkr, message);
            dict.InlineErrorsExist = true;
            return Promise.reject(false);
        }
    }

    /**
     * Storage Location required for an issue
     */
    static validateStorageLocationNotBlank(pageClientAPI, dict) {

        if (!libThis.evalStorageLocationIsEmpty(dict)) {
            return Promise.resolve(true);
        } else {
            let message = pageClientAPI.localizeText('field_is_required');
            libCom.setInlineControlError(pageClientAPI, dict.StorageLocationLstPkr, message);
            dict.InlineErrorsExist = true;
            return Promise.reject(false);
        }
    }

    /**
     * Quantity must be > 0
     */
    static validateQuantityGreaterThanZero(pageClientAPI, dict) {

        //Quantity > 0?
        if (libThis.evalQuantityGreaterThanZero(dict)) {
            return Promise.resolve(true);
        } else {
            let message = pageClientAPI.localizeText('quantity_must_be_greater_than_zero');
            libCom.setInlineControlError(pageClientAPI, dict.QuantitySim, message);
            dict.InlineErrorsExist = true;
            return Promise.reject(false);
        }
    }

    /**
     * Part must be selected if text item is not true
     */
    static validateMaterialNotBlank(pageClientAPI, dict) {

        let error = false;
        let message;

        //Not Text item
        if (!libThis.evalIsTextItem(pageClientAPI, dict)) {
            //Item is empty
            if (libThis.evalMaterialIsEmpty(dict)) {
                error = true;
                message = pageClientAPI.localizeText('field_is_required');
            }
        }
        if (error) {
            libCom.setInlineControlError(pageClientAPI, dict.MaterialLstPkr, message);
            dict.InlineErrorsExist = true;
            return Promise.reject(false);
        } else {
            return Promise.resolve(true);
        }
    }

    /**
     * Quantity must be numeric
     */
    static validateQuantityIsNumeric(pageClientAPI, dict) {

        //New reading must be a number
        if (libThis.evalQuantityIsNumeric(dict)) {
            return Promise.resolve(true);
        } else {
            let message = pageClientAPI.localizeText('validate_numeric_quantity');
            libCom.setInlineControlError(pageClientAPI, dict.QuantitySim, message);
            dict.InlineErrorsExist = true;
            return Promise.reject(false);
        }
    }
    
    /**
    * Evaluates whether the current UOM length is within length limit
    */
    static evalUOMLengthWithinLimit(dict, limit) {
        return (libCom.getControlValue(dict.UOMSim).length <= Number(limit));
    }

    /**
    * Evaluates whether storage location is empty
    */
    static evalStorageLocationIsEmpty(dict) {
        return (libVal.evalIsEmpty(libCom.getControlValue(dict.StorageLocationLstPkr)));
    }

    /**
    * Evaluates whether plant is empty
    */
    static evalPlantIsEmpty(dict) {
        return (libVal.evalIsEmpty(dict.PlantLstPkr));
    }

    /**
    * Evaluates whether operation is empty
    */
    static evalOperationIsEmpty(dict) {
        return (libVal.evalIsEmpty(dict.OperationLstPkr));
    }

    /**
    * Evaluates whether quantity > 0
    */
    static evalQuantityGreaterThanZero(dict) {
        let qty = libCom.getControlValue(dict.QuantitySim).toString();
        if (qty.includes(',')) {
            qty = qty.replace(',', '.');
        }
        return (Number(qty) > 0);
    }

    /**
    * Evaluates whether text item switch control is true
    */
    static evalIsTextItem(context, dict) {
        let partCatValue = libForm.getFormattedKeyDescriptionPair(context, libCom.getAppParam(context, 'PART', 'TextItemCategory'),context.localizeText('text_item'));
        return (libCom.getControlValue(dict.PartCategoryLstPkr) === partCatValue);
    }

    /**
    * Evaluates whether Item list picker is empty
    */
    static evalMaterialIsEmpty(dict) {
        return (libVal.evalIsEmpty(libCom.getControlValue(dict.MaterialLstPkr)));
    }

    /**
    * Evaluates whether the current reading is a number
    */
    static evalQuantityIsNumeric(dict) {
        return (libVal.evalIsNumeric(libCom.getControlValue(dict.QuantitySim).replace(',', '.')));
    }

    /**
    * Sets header values for create/update service before writing OData record
    */
    static partIssueHeaderCreateUpdateSetODataValue(pageClientAPI, key) {

        //Only create will be supported for now.  SB and HCP SDK cannot support local updates merging into the create.
        //This means that we cannot allow local updates (edits) on a measurement document
        switch (key) {
            case 'DocumentDate':
                return new ODataDate().toDBDateString(pageClientAPI);
            case 'GMCode':
                return libCom.getAppParam(pageClientAPI, 'PART', 'GoodsIssue');
            case 'MaterialDocYear':
                return new ODataDate().toDBDate(pageClientAPI).getFullYear().toString();
            case 'PostingDate':
                return new ODataDate().toDBDateTimeString(pageClientAPI);
            case 'UserName':
                return libCom.getSapUserName(pageClientAPI);
            default:
                return '';
        }
    }

    /**
    * Sets line item values for create/update service before writing OData record
    */
    static partIssueLineItemCreateUpdateSetODataValue(pageClientAPI, key) {

        switch (key) {
            case 'OrderNumber':
                return pageClientAPI.evaluateTargetPath('#Property:OrderId');
            case 'MovementType':
                return libCom.getAppParam(pageClientAPI, 'WORKORDER', 'MovementType');
            case 'ReservationNumber':
                return pageClientAPI.evaluateTargetPath('#Property:RequirementNumber');
            case 'ReservationItemNumber':
                return pageClientAPI.evaluateTargetPath('#Property:ItemNumber');
            case 'Material':
                return pageClientAPI.evaluateTargetPath('#Property:MaterialNum');
            case 'Plant':
                return pageClientAPI.evaluateTargetPath('#Property:Plant');
            case 'StorageLocation':
                return libCom.getListPickerValue(libCom.getFieldValue(pageClientAPI, 'StorageLocationLstPkr', '', null, true));
            case 'Quantity':
                return libCom.getFieldValue(pageClientAPI, 'QuantitySim', '', null, true);
            default:
                return '';
        }
    }

    /**
     * Create the OData relationship links for part issue line item row
     * @param {*} pageProxy 
     */
    static partIssueCreateLineItemLinks(pageProxy) {

        var links = [];

        //MatDoc_MatDocItem_ASet
        let woLink = pageProxy.createLinkSpecifierProxy(
            'AssociatedMaterialDoc',
            'MaterialDocuments',
            '',
            'pending_1'
        );
        links.push(woLink.getSpecifier());

        return links;
    }

    /**
    * Formats the field formats for various part screens
    */
    static partFieldFormat(sectionProxy, key = '') {
        let section = sectionProxy.getName();
        let property = sectionProxy.getProperty();
        let binding = sectionProxy.binding;

        let textCategory = libCom.getAppParam(sectionProxy, 'PART', 'TextItemCategory');
        let textDescription = sectionProxy.localizeText('text_item');
        let format = '';

        switch (section) {
            case 'PartsList':
                switch (property) {
                    case 'Title':
                        format = libThis.getPartPlusDescription(sectionProxy, binding.ItemCategory, textCategory, binding.TextTypeDesc, textDescription, binding.ComponentDesc, binding.MaterialNum, false);
                        break;
                    case 'Subhead':
                        format = libThis.getPartPlusDescription(sectionProxy, binding.ItemCategory, textCategory, binding.TextTypeDesc, textDescription, binding.ComponentDesc, binding.MaterialNum, true, false);
                        break;
                        case 'SubstatusText': 
                        return libThis.getLocalQuantityIssued(sectionProxy, binding).then(result => {
                            return sectionProxy.localizeText('issued_parts_count',[sectionProxy.formatNumber(Number(binding.WithdrawnQuantity + result)),sectionProxy.formatNumber(binding.RequirementQuantity),binding.UnitOfMeasure]);
    
                        }).catch(err => {
                            /**Implementing our Logger class*/
                            Logger.error(sectionProxy.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryParts.global').getValue(), err);
                            return sectionProxy.localizeText('issued_parts_count',[binding.WithdrawnQuantity,binding.RequirementQuantity,binding.UnitOfMeasure]);
                        });
                    case 'Footnote':
                        format = libForm.getFormattedKeyDescriptionPair(sectionProxy, binding.OperationNo, binding.OperationDesc);
                        break;
                    default:
                        break;
                }
                break;
            case 'RelatedStep':
                switch (property) {
                    case 'Description':
                        format = libForm.getFormattedKeyDescriptionPair(sectionProxy, binding.OperationNo, binding.OperationShortText);
                        break;
                    default:
                        break;
                }
                break;
            case 'KeyValuePairs':
                switch (key) {
                    case 'CommittedQty':
                        format = sectionProxy.formatNumber(binding.CommittedQuantity) + ' ' + binding.UnitOfMeasure;
                        break;
                    case 'Description':
                        format = libThis.getPartPlusDescription(sectionProxy, binding.ItemCategory, textCategory, binding.TextTypeDesc, textDescription, binding.ComponentDesc, binding.MaterialNum, false);
                        break;
                    case 'WithdrawnQty':
                        return libThis.getLocalQuantityIssued(sectionProxy, binding).then(result => {
                            return sectionProxy.formatNumber(Number(binding.WithdrawnQuantity + result)) + ' ' + binding.UnitOfMeasure;
                        }).catch(err => {
                            /**Implementing our Logger class*/
                            Logger.error(sectionProxy.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryParts.global').getValue(), err);
                            return '';
                        });
                    case 'RequiredQty':
                        format = sectionProxy.formatNumber(binding.RequirementQuantity) + ' ' + binding.UnitOfMeasure;
                        break;
                    case 'StockType':
                        format = libForm.getFormattedKeyDescriptionPair(sectionProxy, binding.ItemCategory, binding.ItemCategoryDesc);
                        break;
                    case 'Plant':
                        return libThis.getPlantPlusDescription(sectionProxy, binding.Plant).then(result => {
                            return result;
                        }).catch(err => {
                            /**Implementing our Logger class*/
                            Logger.error(sectionProxy.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryParts.global').getValue(), err);
                            return '';
                        });
                    case 'Location':
                        if (!libVal.evalIsEmpty(binding.StorageLocation)) {
                            var locationValue = '';
                            return sectionProxy.read(
                                '/SAPAssetManager/Services/AssetManager.service',
                                'MaterialSLocs',
                                [],
                                "$select=StorageLocationDesc&$filter=Plant eq '" + binding.Plant + "' and StorageLocation eq '" + binding.StorageLocation + "'").then(result => {
                                    if (result && result.length > 0) {
                                        //Grab the first row (should only ever be one row)
                                        let row = result.getItem(0);
                                        locationValue = libForm.getFormattedKeyDescriptionPair(sectionProxy, binding.StorageLocation, row.StorageLocationDesc);
                                    }
                                    return locationValue;
                                });
                        } else {
                            break;
                        }
                    default:
                        break;
                }
                break;
            default:
                break;
        }
        return format;
    }

    /**
     * Get the part and description for display
     */
    static getPartPlusDescription(context, itemCategory, textCategory, textTypeDesc, textDescription, materialDescription, materialNum, part = true, description = true) {
        if (itemCategory === textCategory) {
            if (!libVal.evalIsEmpty(textTypeDesc)) {
                if (part && description) {
                    return libForm.getFormattedKeyDescriptionPair(context, textDescription, textTypeDesc);
                } else if (part) {
                    return textDescription;
                } else {
                    return textTypeDesc;
                }
            } else {
                return (part) ? textDescription : '';
            }
        } else {
            if (!libVal.evalIsEmpty(materialDescription)) {
                if (part && description) {
                    return libForm.getFormattedKeyDescriptionPair(context, materialNum, materialDescription);
                } else if (part) {
                    return materialNum;
                } else {
                    return materialDescription;
                }
            } else {
                return (part) ? materialNum : '';
            }
        }
    }

    static getPlantPlusDescription(proxy, plant) {
        var plantValue = '';
        try {
            return proxy.read(
                '/SAPAssetManager/Services/AssetManager.service',
                'Plants',
                [],
                "$select=PlantDescription&$filter=Plant eq '" + plant + "'").then(result => {
                    if (result && result.length > 0) {
                        //Grab the first row (should only ever be one row)
                        let row = result.getItem(0);
                        plantValue = libForm.getFormattedKeyDescriptionPair(proxy, plant, row.PlantDescription);
                    }
                    return Promise.resolve(plantValue);
                });
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /**
     * Reads the local material document lines for the current workorder part to get the issued quantity for display
     * @param {*} context 
     * @param {*} binding 
     */
    static getLocalQuantityIssued(context, binding) {
        var count = 0;
        try {
            return context.read(
                '/SAPAssetManager/Services/AssetManager.service',
                'MaterialDocItems',
                [],
                "$select=EntryQuantity&$filter=sap.islocal() and OrderNumber eq '" + binding.OrderId + "' and ReservationItemNumber eq '" + binding.ItemNumber + "' and ReservationNumber eq '" + binding.RequirementNumber + "'").then(result => {
                    if (result && result.length > 0) {
                        for (var x = 0; x < result.length; x++)
                            count += result.getItem(x).EntryQuantity;
                    }
                    return Promise.resolve(count);
                });
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /**
     * Refresh the part details page and run toast message after point issue change set save
     */
    static createPartIssueSuccessMessage(context) {
        try {
            let pageProxy = libCom.getStateVariable(context, 'PartDetailsPageRefresh');
            let section = pageProxy.getControl('SectionedTable');
            if (section) {
                section.redraw();
            }
            libCom.setStateVariable(context, 'PartDetailsPageRefresh', undefined);
        } catch (err) {
            /**Implementing our Logger class*/
            Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryParts.global').getValue(),'createPartIssueSuccessMessage Error: ' + err);
        }
    }

    /**
     * Save the part details page to state variabe, and finish the change set by closing the modal screen
     * @param {*} context 
     */
    static partIssueCreateLineItemSuccess(context) {
        if (context.currentPage.previousPage.id !== 'BarcodeScannerExtensionControl') {
            let pageProxy = context.evaluateTargetPathForAPI('#Page:PartDetailsPage');
            libCom.setStateVariable(context, 'PartDetailsPageRefresh', pageProxy);
        }
        context.executeAction('/SAPAssetManager/Actions/CreateUpdateDelete/CreateEntitySuccessMessage.action');
        
    }

    /**
     * Create the query options for a part add/edit.  This is required because we can add/edit from different screens and parent object context changes
     * @param {*} context 
     */
    static partUOMQueryOptions(context) {
        let materialNum = libThis.getMaterialNum(context);
        let query = "$select=UOM&$orderby=UOM&$filter=MaterialNum eq '" +  materialNum + "'";
        return query;
    }
}

