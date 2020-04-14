import libCom from '../Common/Library/CommonLibrary';
import libForm from '../Common/Library/FormatLibrary';
import libVal from '../Common/Library/ValidationLibrary';
import libThis from './MeasuringPointLibrary';
import Logger from '../Log/Logger';
import ODataDate from '../Common/Date/ODataDate';
import OffsetODataDate from '../Common/Date/OffsetODataDate';

export default class {

    /**
     * Runs when a tracked field on the measuring point reading screen is changed
     */
    static measurementDocumentCreateUpdateOnChange(clientAPI) {

        var control = clientAPI.getControl();
        var name = control.definition().getName();

        switch (name) {
            default:
                break;
        }
    }

    /**
     * Runs when the point details screen is loaded
     */
    static pointDetailsOnPageLoad(pageClientAPI) {
        let binding = pageClientAPI.binding;
        pageClientAPI.setCaption(libForm.formatDetailHeaderDisplayValue(pageClientAPI, binding.Point,
            pageClientAPI.localizeText('point')));
    }

    /**
     * Runs when the measuring point reading screen is loaded
     */
    static measurementDocumentCreateUpdateOnPageLoad(pageClientAPI) {

        if (!pageClientAPI.getClientData().LOADED) {
            //prevent OnLoaded code from firing more than once for this page
            pageClientAPI.getClientData().LOADED = true;
            libThis.measurementDocumentCreateUpdateSetPageCaption(pageClientAPI);
            let params = libThis.measurementDocumentCreateUpdateFieldVisibility(pageClientAPI);
            //Set the list picker specifier and capture the async response to proceed
            if (params) {
                return params.picker.setTargetSpecifier(params.specifier).then(() => {
                    libThis.measurementDocumentCreateUpdateFieldValues(pageClientAPI);
                });
            } else {
                libThis.measurementDocumentCreateUpdateFieldValues(pageClientAPI);
            }
        }
        return Promise.resolve();
    }

    /**
     * Sets the page caption
     */
    static measurementDocumentCreateUpdateSetPageCaption(pageClientAPI) {

        let message;
        if (libThis.evalIsUpdateTransaction(pageClientAPI)) {
            message = pageClientAPI.localizeText('edit_point_reading');
        } else {
            message = pageClientAPI.localizeText('take_reading');
        }
        pageClientAPI.setCaption(message);
    }

    /**
    * Sets values for create/update service before writing OData record
    */
    static measurementDocumentCreateUpdateSetODataValue(pageClientAPI, key) {
        let binding = pageClientAPI.binding;
        let currentDateTime = libCom.getStateVariable(pageClientAPI, 'CurrentDateTime') || new Date();
        let odataDate = new ODataDate(currentDateTime);

        //Only create will be supported for now.  SB and HCP SDK cannot support local updates merging into the create.
        //This means that we cannot allow local updates (edits) on a measurement document
        switch (key) {
            case 'RecordedValue':
                return String(libCom.getFieldValue(pageClientAPI, 'ReadingSim', '', null, true));
            case 'ReadingValue': {
                let readingValue = libCom.getFieldValue(pageClientAPI, 'ReadingSim', '', null, true);
                // if readingValue contains "," only then the type would be string, otherwise would be number
                if (typeof(readingValue) === 'string') {
                    return Number(readingValue.replace(',', '.'));
                } else {
                    return readingValue;
                }
            }
            case 'ReadingTime':
                return odataDate.toDBTimeString(pageClientAPI);
            case 'ReadingDate':
                return odataDate.toDBDateString(pageClientAPI);
            case 'MeasurementDocNum':
                return libCom.GenerateOfflineEntityId();
            case 'ValuationCode':
                return libCom.getListPickerValue(libCom.getFieldValue(pageClientAPI, 'ValuationCodeLstPkr', '', null, true));
            case 'CodeDescription':
                return pageClientAPI.read(
                '/SAPAssetManager/Services/AssetManager.service',
                "PMCatalogCodes(Catalog='"+ binding.CatalogType+"',Code='"+ libCom.getListPickerValue(libCom.getFieldValue(pageClientAPI, 'ValuationCodeLstPkr', '', null, true)) +"',CodeGroup='"+ binding.CodeGroup + "')",
                [],'').then(result2 => {
                    if (result2.length > 0) {
                        //Grab the first row (should only ever be one row)
                        let row = result2.getItem(0);
                        let codeDescription = row.CodeDescription;
                        return codeDescription;
                    }
                    return '';
                }).catch((error) => {
                    Logger.error('measurementDocumentCreateUpdateSetODataValue', error);
                    return '';
                });
            case 'ReadBy':
                return libCom.getSapUserName(pageClientAPI);
            case 'ShortTextNote':
                return libCom.getFieldValue(pageClientAPI, 'ShortTextNote', '', null, true);
            case 'CodeGroup':
                if (binding.hasOwnProperty('CodeGroup')) {
                    return binding.CodeGroup;
                } else {
                    return binding.MeasuringPoint.CodeGroup;
                }
            case 'HasReadingValue':
                return (libVal.evalIsEmpty(libCom.getFieldValue(pageClientAPI, 'ReadingSim', '', null, true))) ? '' : 'X';
            case 'ReadingTimestamp':
                {
                    return odataDate.toDBDateTimeString(pageClientAPI);
                }
            case 'UOM':
                {
                    if (binding.hasOwnProperty('RangeUOM')) {
                        return binding.RangeUOM;
                    } else if (binding.hasOwnProperty('MeasuringPoint') && binding.MeasuringPoint.hasOwnProperty('RangeUOM')) {
                        return binding.MeasuringPoint.RangeUOM;
                    } else {
                        return '';
                    }
                }
            default:
                return '';
        }
    }

    /** 
     * Sets the initial values for fields when the screen is loaded
     */
    static measurementDocumentCreateUpdateFieldValues(pageClientAPI) {

        //Check to see if there is a local record in MeasurementDocument entity set that matches this point.  If so, grab the record
        //and use it to set initial values for these fields.
        //The rest of the fields can use their default binding from MeasuringPoint entity set row:
        let dict = {};
        dict = libCom.getControlDictionaryFromPage(pageClientAPI);
        let binding = pageClientAPI.binding;
        if (libThis.evalIsUpdateTransaction(pageClientAPI)) {
            dict.ReadingSim = binding.ReadingValue;
            dict.ValuationCodeLstPkr.setValue([binding.ValuationCode.trim()]);
            dict.ShortTextNote.setValue(binding.ShortText);
        }
        let charName = '';
        if (binding.hasOwnProperty('CharName')) {
            charName = binding.CharName;
        } else {
            charName = binding.MeasuringPoint.CharName;
        }
        let charDescription = '';
        if (binding.hasOwnProperty('CharDescription')) {
            charDescription = binding.CharDescription;
        } else {
            charDescription = binding.MeasuringPoint.CharDescription;
        }
        let charDisplay = '';
        if (!libVal.evalIsEmpty(charName)) {
            charDisplay = libForm.getFormattedKeyDescriptionPair(pageClientAPI, charName, charDescription);
        }
        if (dict.CharacteristicSim) {
            dict.CharacteristicSim.setValue(charDisplay);
        }
        //If this is a counter type point, read and save the last local counter reading to a state variable so it can be used during validation rules
        //Updated for 2.0 to support multiple points for new multiple point reading screen
        if (libCom.IsOnCreate(pageClientAPI)) {
            var isCounter = '';
            if (binding.hasOwnProperty('IsCounter')) {
                isCounter = binding.IsCounter;
            } else {
                isCounter = binding.MeasuringPoint.IsCounter;
            }
            var point = libCom.getTargetPathValue(pageClientAPI, '#Property:Point');
            if (isCounter === 'X') {
                return pageClientAPI.read(
                '/SAPAssetManager/Services/AssetManager.service',
                'MeasurementDocuments',
                [],
                "$select=RecordedValue&$filter=Point eq '" + point + "' and PointObjectKey eq ''&$orderby=ReadingTimestamp desc&$top=1").then(result => {
                    if (result && result.length > 0) {
                        let row = result.getItem(0);
                        var recordedValue = row.RecordedValue;
                        //Store in dictionary by point number
                        let prevReadingDict = {};
                        if (libCom.getStateVariable(pageClientAPI, 'LastCounterReading')) {
                            prevReadingDict = libCom.getStateVariable(pageClientAPI, 'LastCounterReading');
                        }
                        prevReadingDict[point] = recordedValue;                        
                        libCom.setStateVariable(pageClientAPI, 'LastCounterReading', prevReadingDict);
                    }
                });
            }
        }
        return Promise.resolve();
    }

    /**
     * Sets the visibility state for fields when the screen is loaded
     */
    static measurementDocumentCreateUpdateFieldVisibility(pageClientAPI) {

        let controls = libCom.getControlDictionaryFromPage(pageClientAPI);

        let binding = pageClientAPI.binding;
        let codeGroup = '';
        if (binding.hasOwnProperty('CodeGroup')) {
            codeGroup = binding.CodeGroup;
        } else {
            codeGroup = binding.MeasuringPoint.CodeGroup;
        }
        let charName = '';
        if (binding.hasOwnProperty('CharName')) {
            charName = binding.CharName;
        } else {
            charName = binding.MeasuringPoint.CharName;
        }
        let picker = controls.ValuationCodeLstPkr;
        let valDescription = controls.ValDescriptionSim;

        //Hide the reading/characteristic fields if characteristic is blank                                     
        if (libVal.evalIsEmpty(charName)) {
            let control = libCom.getTargetPathValue(pageClientAPI, '#Control:ReadingSim');
            control.setVisible(false);
            if (libCom.getStateVariable(pageClientAPI, 'ReadingType') === 'MULTIPLE') {                
                if (valDescription) {
                    valDescription.setVisible(true);
                }
            }
            control = libCom.getTargetPathValue(pageClientAPI, '#Control:CharacteristicSim');
            if (control) {
                control.setVisible(false);
            }
        }

        //Hide the valuation code control if code group is empty for the point
        if (libVal.evalIsEmpty(codeGroup)) {
            picker.setVisible(false);
        }

        return null;
    }

    /**
    * Runs when the user presses the "Read" button on a measuring point
    * We allow one local reading per point, so decide if this is a create doc or update doc for the current point
    * Save some state variables to be used later
    * Run the nav action to the screen
    */
    static measurementDocumentCreateUpdateNav(pageClientAPI) {
        let point = libCom.getTargetPathValue(pageClientAPI, '#Property:Point');
        //Read from measurment documents looking for a modified row matching this point
        return pageClientAPI.read(
            '/SAPAssetManager/Services/AssetManager.service',
            'MeasurementDocuments',
            [],
            "$filter=Point eq '" + point + "'&$orderby=ReadingTimestamp desc&$top=1").then(result => {
                if (result && result.length > 0) {
                    //Grab the first row (should only ever be one row)
                    let row = result.getItem(0);
                    if (libCom.isCurrentReadLinkLocal(row['@odata.readLink'])) {
                        libCom.setStateVariable(pageClientAPI, 'TransactionType', 'UPDATE');
                        libCom.setStateVariable(pageClientAPI, 'MeasurementRow', row);
                        return pageClientAPI.executeAction('/SAPAssetManager/Actions/Measurements/MeasurementDocumentCreateUpdateNav.action');
                    }
                }
                libCom.setStateVariable(pageClientAPI, 'TransactionType', 'CREATE');
                return pageClientAPI.executeAction('/SAPAssetManager/Actions/Measurements/MeasurementDocumentCreateUpdateNav.action');
            });
    }
    //*************************************************************
    //Validation Rules
    //*************************************************************

    /**
     * handle error and warning processing for measurement document create/update
     */
    static measurementDocumentCreateUpdateValidation(pageClientAPI) {
        let binding = pageClientAPI.binding;
        var dict = {};

        //Grab all variables used in all rules, storing in a dictionary
        libCom.getFieldValue(pageClientAPI, 'ReadingSim', '', dict, true);
        dict.ReadingSim = libCom.convertSapStringToNumber(dict.ReadingSim);
        libCom.getFieldValue(pageClientAPI, 'ShortTextNote', '', dict, true);
        libCom.getFieldValue(pageClientAPI, 'ValuationCodeLstPkr', '', dict, true);
        dict.ValuationCodeLstPkr = libCom.getListPickerValue(dict.ValuationCodeLstPkr);
        if (binding.hasOwnProperty('CounterOverflow')) {
            dict.CounterOverflow = libCom.convertSapStringToNumber(binding.CounterOverflow);
        } else {
            dict.CounterOverflow = libCom.convertSapStringToNumber(binding.MeasuringPoint.CounterOverflow);
        }
        if (binding.hasOwnProperty('PrevReadingValue')) {
            dict.PrevReadingValue = libCom.convertSapStringToNumber(binding.PrevReadingValue);
        } else {
            dict.PrevReadingValue = libCom.convertSapStringToNumber(binding.MeasuringPoint.PrevReadingValue);
        }
        if (binding.hasOwnProperty('IsCounter')) {
            dict.IsCounter = binding.IsCounter;
        } else {
            dict.IsCounter = binding.MeasuringPoint.IsCounter;
        }
        if (binding.hasOwnProperty('IsCounterOverflow')) {
            dict.IsCounterOverflow = binding.IsCounterOverflow;
        } else {
            dict.IsCounterOverflow = binding.MeasuringPoint.IsCounterOverflow;
        }
        if (binding.hasOwnProperty('IsReverse')) {
            dict.IsReverse = binding.IsReverse;
        } else {
            dict.IsReverse = binding.MeasuringPoint.IsReverse;
        }
        if (binding.hasOwnProperty('IsLowerRange')) {
            dict.IsLowerRange = binding.IsLowerRange;
        } else {
            dict.IsLowerRange = binding.MeasuringPoint.IsLowerRange;
        }
        if (binding.hasOwnProperty('IsUpperRange')) {
            dict.IsUpperRange = binding.IsUpperRange;
        } else {
            dict.IsUpperRange = binding.MeasuringPoint.IsUpperRange;
        }
        if (binding.hasOwnProperty('IsCodeSufficient')) {
            dict.IsCodeSufficient = binding.IsCodeSufficient;
        } else {
            dict.IsCodeSufficient = binding.MeasuringPoint.IsCodeSufficient;
        }
        if (binding.hasOwnProperty('LowerRange')) {
            dict.LowerRange = libCom.convertSapStringToNumber(binding.LowerRange);
        } else {
            dict.LowerRange = libCom.convertSapStringToNumber(binding.MeasuringPoint.LowerRange);
        }
        if (binding.hasOwnProperty('UpperRange')) {
            dict.UpperRange = libCom.convertSapStringToNumber(binding.UpperRange);
        } else {
            dict.UpperRange = libCom.convertSapStringToNumber(binding.MeasuringPoint.UpperRange);
        }
        if (binding.hasOwnProperty('CodeGroup')) {
            dict.CodeGroup = binding.CodeGroup;
        } else {
            dict.CodeGroup = binding.MeasuringPoint.CodeGroup;
        }
        if (binding.hasOwnProperty('Decimal')) {
            dict.Decimal = Number(binding.Decimal);
        } else {
            dict.Decimal = Number(binding.MeasuringPoint.Decimal);
        }
        if (binding.hasOwnProperty('CharName')) {
            dict.CharName = binding.CharName;
        } else {
            dict.CharName = binding.MeasuringPoint.CharName;
        }
        if (binding.hasOwnProperty('Point')) {
            dict.Point = Number(binding.Point);
        } else {
            dict.Point = Number(binding.MeasuringPoint.Point);
        }

        //If this is a counter and a local reading exists, use it for validation
        if (dict.IsCounter === 'X' && libCom.IsOnCreate(pageClientAPI)) {
            if (libCom.getStateVariable(pageClientAPI, 'LastCounterReading')) {
                const prevReadingDict = libCom.getStateVariable(pageClientAPI, 'LastCounterReading');
                if (prevReadingDict.hasOwnProperty(dict.Point)) {
                    dict.PrevReadingValue = prevReadingDict[dict.Point];
                }
            }
        }
        //Process all warnings and errors for this screen
        //Use .then chaining to sequentially process the async events

        libCom.setInlineControlErrorVisibility(libCom.getControlProxy(pageClientAPI, 'ReadingSim'), false);
        libCom.setInlineControlErrorVisibility(libCom.getControlProxy(pageClientAPI, 'ShortTextNote'), false);
        libCom.setInlineControlErrorVisibility(libCom.getControlProxy(pageClientAPI, 'ValuationCodeLstPkr'), false);
        //Clear validation will refresh all fields on screen
        libCom.getControlProxy(pageClientAPI, 'ValuationCodeLstPkr').clearValidation();

        //Start with inline errors
        return libThis.validateReadingIsNumeric(pageClientAPI, dict)
            .then(libThis.validateReadingExceedsLength.bind(null, pageClientAPI, dict), libThis.validateReadingExceedsLength.bind(null, pageClientAPI, dict))
            .then(libThis.validateShortTextExceedsLength.bind(null, pageClientAPI, dict), libThis.validateShortTextExceedsLength.bind(null, pageClientAPI, dict))
            .then(libThis.validateValuationCodeEntered.bind(null, pageClientAPI, dict), libThis.validateValuationCodeEntered.bind(null, pageClientAPI, dict))
            .then(libThis.validatePrecisionWithinLimit.bind(null, pageClientAPI, dict), libThis.validatePrecisionWithinLimit.bind(null, pageClientAPI, dict))
            .then(libThis.validateReadingLessThanCounterOverflow.bind(null, pageClientAPI, dict), libThis.validateReadingLessThanCounterOverflow.bind(null, pageClientAPI, dict))
            .then(libThis.validateContinuousReverseCounter.bind(null, pageClientAPI, dict), libThis.validateContinuousReverseCounter.bind(null, pageClientAPI, dict))
            .then(libThis.validateContinuousReverseCounterPositiveReading.bind(null, pageClientAPI, dict), libThis.validateContinuousReverseCounterPositiveReading.bind(null, pageClientAPI, dict))
            .then(libThis.validateContinuousCounter.bind(null, pageClientAPI, dict), libThis.validateContinuousCounter.bind(null, pageClientAPI, dict))
            .then(libThis.validateOverflowCounterIsNotNegative.bind(null, pageClientAPI, dict), libThis.validateOverflowCounterIsNotNegative.bind(null, pageClientAPI, dict))
            .then(libThis.validateReverseCounterWithoutOverflowIsNotPositive.bind(null, pageClientAPI, dict), libThis.validateReverseCounterWithoutOverflowIsNotPositive.bind(null, pageClientAPI, dict))
            .then(libThis.processInlineErrors.bind(null, pageClientAPI, dict), libThis.processInlineErrors.bind(null, pageClientAPI, dict))
            //Dialog based warnings
            .then(libThis.validateZeroReading.bind(null, pageClientAPI, dict), null)
            .then(libThis.validateReadingGreaterThanOrEqualLowerRange.bind(null, pageClientAPI, dict), null)
            .then(libThis.validateReadingLessThanOrEqualUpperRange.bind(null, pageClientAPI, dict), null)
            .then(libThis.validateReverseCounterRollover.bind(null, pageClientAPI, dict), null)
            .then(libThis.validateCounterReadingEqualToPreviousReading.bind(null, pageClientAPI, dict), null)
            .then(libThis.validateCounterRolloverWithOverflow.bind(null, pageClientAPI, dict), null)
            .then(function() {
                return true;
            }, function() {
                return false;
            }); //Pass back true or false to calling action
    }
      /**
     * Checks if Point is  a counter
     */

    static validateIsCounter(binding) {
        if (binding.hasOwnProperty('IsCounter')) {
            return binding.IsCounter === 'X';
        } else {
            return binding.MeasuringPoint.IsCounter === 'X';
        }
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

    /**
     * New reading must be numeric
     */
    static validateReadingIsNumeric(pageClientAPI, dict) {

        //Reading is not allowed, or reading is optional and empty
        if (libThis.evalIgnoreReading(dict)) {
            return Promise.resolve(true);
        }

        //New reading must be a number
        if (libThis.evalReadingIsNumeric(dict)) {
            return Promise.resolve(true);
        } else {
            let message = pageClientAPI.localizeText('validation_reading_is_numeric');
            libCom.setInlineControlError(pageClientAPI, libCom.getControlProxy(pageClientAPI, 'ReadingSim'), message);
            dict.InlineErrorsExist = true;
            return Promise.reject(false);
        }
    }

    /**
     * New reading decimal precision must be within limits
     */
    static validatePrecisionWithinLimit(pageClientAPI, dict) {

        //Reading is not allowed, or reading is optional and empty
        if (libThis.evalIgnoreReading(dict)) {
            return Promise.resolve(true);
        }

        let error = false;
        let message = '';

        //New reading must be a number
        if (libThis.evalReadingIsNumeric(dict)) {
            //Did user provide decimal when integer is required for point?
            if (libThis.evalBadInteger(dict)) {
                message = pageClientAPI.localizeText('validation_reading_must_be_an_integer_without_decimal_precision');
                error = true;
            } else {
                //Did user provide allowed decimal precision for point?
                if (libThis.evalBadDecimal(dict)) {
                    let dynamicParams = [dict.Decimal];
                    message = pageClientAPI.localizeText('validation_reading_within_decimal_precision_of',dynamicParams);
                    error = true;
                }
            }
        }
        if (error) {
            libCom.setInlineControlError(pageClientAPI, libCom.getControlProxy(pageClientAPI, 'ReadingSim'), message);
            dict.InlineErrorsExist = true;
            return Promise.reject(false);
        } else {
            return Promise.resolve(true);
        }
    }

    /**
     * Valuation code must be selected if code group is not blank and either 
     * (characteristic is blank) or (characteristic is not blank and code sufficient is set and reading is blank)
     */
    static validateValuationCodeEntered(pageClientAPI, dict) {
        let error = false;
        let message = '';
        //Code group is not empty
        if (!libThis.evalCodeGroupIsEmpty(dict)) {
            //Characteristic is blank
            if (libThis.evalIsCodeOnly(dict)) {
                error = (libThis.evalValuationCodeIsEmpty(dict));
                if (error) {
                    message = pageClientAPI.localizeText('field_is_required');
                    libCom.setInlineControlError(pageClientAPI, libCom.getControlProxy(pageClientAPI, 'ValuationCodeLstPkr'), message);
                }
            } else {
                //Code sufficient is set and reading is empty
                if (libThis.evalIsCodeSufficient(dict) && libThis.evalIsReadingEmpty(dict)) {
                    error = (libThis.evalValuationCodeIsEmpty(dict));
                    if (error) {
                        message = pageClientAPI.localizeText('validation_valuation_code_or_reading_must_be_selected');
                        libCom.setInlineControlError(pageClientAPI, libCom.getControlProxy(pageClientAPI, 'ReadingSim'), message);
                        libCom.setInlineControlError(pageClientAPI, libCom.getControlProxy(pageClientAPI, 'ValuationCodeLstPkr'), message);
                    }
                }
            }
        }
        if (error) {
            dict.InlineErrorsExist = true;
            return Promise.reject(false);
        } else {
            return Promise.resolve(true);
        }
    }

    /**
     * New reading must be <= length limit defined in global
     */
    static validateReadingExceedsLength(pageClientAPI, dict) {

        //Reading is not allowed, or reading is optional and empty
        if (libThis.evalIgnoreReading(dict)) {
            return Promise.resolve(true);
        }

        //New reading length must be <= global maximum
        let max = libCom.getAppParam(pageClientAPI, 'MEASURINGPOINT', 'ReadingLength');

        if (libThis.evalReadingLengthWithinLimit(dict, max)) {
            return Promise.resolve(true);
        } else {
            let dynamicParams = [max];
            let message = pageClientAPI.localizeText('validation_maximum_field_length', dynamicParams);
            libCom.setInlineControlError(pageClientAPI, libCom.getControlProxy(pageClientAPI, 'ReadingSim'), message);
            dict.InlineErrorsExist = true;
            return Promise.reject(false);
        }
    }

    /**
     * New short text must be <= length limit defined in global
     */
    static validateShortTextExceedsLength(pageClientAPI, dict) {

        //New short text length must be <= global maximum
        let max = libCom.getAppParam(pageClientAPI, 'MEASURINGPOINT', 'ShortTextLength');

        if (libThis.evalShortTextLengthWithinLimit(dict, max)) {
            return Promise.resolve(true);
        } else {
            let dynamicParams = [max];
            let message = pageClientAPI.localizeText('validation_maximum_field_length', dynamicParams);
            libCom.setInlineControlError(pageClientAPI, libCom.getControlProxy(pageClientAPI, 'ShortTextNote'), message);
            dict.InlineErrorsExist = true;
            return Promise.reject(false);
        }
    }

    /**
     * If this is a counter overflow point, the current reading must be less than the overflow value
     */
    static validateReadingLessThanCounterOverflow(pageClientAPI, dict) {

        //Reading is not allowed, or reading is optional and empty
        if (libThis.evalIgnoreReading(dict)) {
            return Promise.resolve(true);
        }

        let error = false;
        //Is a counter and has overflow value
        if (libThis.evalIsCounter(dict) && libThis.evalIsCounterOverflow(dict)) {
            //previous = new reading or overflow > new reading
            error = (libThis.evalIsPreviousReadingNotEmptyAndReadingEqualsPrevious(dict) || libThis.evalIsOverflowNotEmptyAndOverflowGreaterThanReading(dict)) ? false : true;
        }
        if (error) {
            let dynamicParams = [dict.CounterOverflow];
            let message = pageClientAPI.localizeText('validation_reading_less_than_counter_overflow',dynamicParams);
            libCom.setInlineControlError(pageClientAPI, libCom.getControlProxy(pageClientAPI, 'ReadingSim'), message);
            dict.InlineErrorsExist = true;
            return Promise.reject(false);
        } else {
            return Promise.resolve(true);
        }
    }

    /**
     * If this is a counter point, the new reading should not equal the previous
     */
    static validateCounterReadingEqualToPreviousReading(pageClientAPI, dict) {

        //Reading is not allowed, or reading is optional and empty
        if (libThis.evalIgnoreReading(dict)) {
            return Promise.resolve(true);
        }

        let warning = false;
        //Previous reading not empty
        if (!libThis.evalIsPreviousReadingEmpty(dict)) {
            //previous = new reading
            if (libThis.evalIsCounter(dict)) {
                warning = (libThis.evalPreviousReadingEqualsReading(dict));
            }
        }
        if (warning) {
            let message = pageClientAPI.localizeText('validation_counter_reading_is_the_same_as_the_previous_counter_reading');
            let caption = pageClientAPI.localizeText('validation_warning_x', [dict.Point]);
            return libCom.showWarningDialog(pageClientAPI, message, caption);
        } else {
            return Promise.resolve(true);
        }
    }

    /**
     * If this is a reverse counter point, the previous reading must be >= current reading
     */
    static validateContinuousReverseCounter(pageClientAPI, dict) {

        //Reading is not allowed, or reading is optional and empty
        if (libThis.evalIgnoreReading(dict)) {
            return Promise.resolve(true);
        }

        let error = false;
        //Reverse counter with no overflow value
        if (libThis.evalIsCounter(dict) && libThis.evalIsReverse(dict) && !libThis.evalIsCounterOverflow(dict)) {
            //Previous reading is not empty
            if (!libThis.evalIsPreviousReadingEmpty(dict)) {
                //Previous reading >= new reading
                error = (!libThis.evalPreviousReadingGreaterThanOrEqualReading(dict));
            }
        }
        if (error) {
            let dynamicParams = [dict.PrevReadingValue];
            let message = pageClientAPI.localizeText('validation_reading_must_be_less_than_or_equal_to_previous_reverse_counter_reading_of', dynamicParams);
            libCom.setInlineControlError(pageClientAPI, libCom.getControlProxy(pageClientAPI, 'ReadingSim'), message);
            dict.InlineErrorsExist = true;
            return Promise.reject(false);
        } else {
            return Promise.resolve(true);
        }
    }

    /**
     * If this is a reverse counter point and no previous reading exists, the new reading must be <= 0
     */
    static validateContinuousReverseCounterPositiveReading(pageClientAPI, dict) {

        //Reading is not allowed, or reading is optional and empty
        if (libThis.evalIgnoreReading(dict)) {
            return Promise.resolve(true);
        }

        let error = false;
        //Is reverse counter and does not have overflow value
        if (libThis.evalIsCounter(dict) && libThis.evalIsReverse(dict) && !libThis.evalIsCounterOverflow(dict)) {
            //Previous reading is empty
            if (libThis.evalIsPreviousReadingEmpty(dict)) {
                //New reading <= 0
                error = (!libThis.evalReadingLessThanEqualToZero(dict));
            }
        }
        if (error) {
            let message = pageClientAPI.localizeText('validation_reverse_counter_reading_must_be_less_than_or_equal_toZero');
            libCom.setInlineControlError(pageClientAPI, libCom.getControlProxy(pageClientAPI, 'ReadingSim'), message);
            dict.InlineErrorsExist = true;
            return Promise.reject(false);
        } else {
            return Promise.resolve(true);
        }
    }

    /**
     * If this is a non-reverse, non-overflow continuous counter point, the new reading must be >= previous reading, or >= 0 if no previous reading
     */
    static validateContinuousCounter(pageClientAPI, dict) {

        //Reading is not allowed, or reading is optional and empty
        if (libThis.evalIgnoreReading(dict)) {
            return Promise.resolve(true);
        }

        let error = false;
        let message = '';
        //Non-reverse counter with no overflow value
        if (libThis.evalIsCounter(dict) && !libThis.evalIsReverse(dict) && !libThis.evalIsCounterOverflow(dict)) {
            //Previous reading is not empty
            if (!libThis.evalIsPreviousReadingEmpty(dict)) {
                //New reading < previous reading
                if (!libThis.evalReadingGreaterThanOrEqualPreviousReading(dict)) {
                    error = true;
                    let dynamicParams = [dict.PrevReadingValue];
                    message = pageClientAPI.localizeText('validation_reading_greater_than_or_equal_to_previous_counter_reading',dynamicParams);
                }
                //Previous reading empty
            } else {
                //Reading < 0
                if (!libThis.evalReadingGreaterThanOrEqualToZero(dict)) {
                    error = true;
                    message = pageClientAPI.localizeText('validation_reading_greater_than_or_equal_toZero');
                }
            }
        }
        if (error) {
            libCom.setInlineControlError(pageClientAPI, libCom.getControlProxy(pageClientAPI, 'ReadingSim'), message);
            dict.InlineErrorsExist = true;
            return Promise.reject(false);

        } else {
            return Promise.resolve(true);
        }
    }

    /**
     * If this is a reverse counter point with overflow, the new reading must be >= 0 if no previous reading, or <= previous reading if one exists
     */
    static validateReverseCounterRollover(pageClientAPI, dict) {

        //Reading is not allowed, or reading is optional and empty
        if (libThis.evalIgnoreReading(dict)) {
            return Promise.resolve(true);
        }

        let warning = false;
        //Reverse counter with overflow value
        if (libThis.evalIsCounter(dict) && libThis.evalIsReverse(dict) && libThis.evalIsCounterOverflow(dict)) {
            //Previous reading is empty
            if (libThis.evalIsPreviousReadingEmpty(dict)) {
                //New reading >= previous blank reading (zero)
                warning = (!libThis.evalReadingGreaterThanOrEqualPreviousReading(dict));
                //Previous reading exists
            } else {
                //Previous reading >= new reading
                warning = (!libThis.evalPreviousReadingGreaterThanOrEqualReading(dict));
            }
        }
        if (warning) {
            let message = pageClientAPI.localizeText('validation_reverse_counter_reading_overflow');
            let caption = pageClientAPI.localizeText('validation_warning_x', [dict.Point]);
            return libCom.showWarningDialog(pageClientAPI, message, caption);
        } else {
            return Promise.resolve(true);
        }
    }

    /**
     * If this is a non-reverse counter point with overflow, the new reading must be >= previous reading
     */
    static validateCounterRolloverWithOverflow(pageClientAPI, dict) {

        //Reading is not allowed, or reading is optional and empty
        if (libThis.evalIgnoreReading(dict)) {
            return Promise.resolve(true);
        }

        let warning = false;
        //Non-reverse counter with overflow value
        if (libThis.evalIsCounter(dict) && !libThis.evalIsReverse(dict) && libThis.evalIsCounterOverflow(dict)) {
            //Previous reading is not empty
            if (!libThis.evalIsPreviousReadingEmpty(dict)) {
                //New reading >= previous blank reading (zero)
                warning = (!libThis.evalReadingGreaterThanOrEqualPreviousReading(dict));
            }
        }
        if (warning) {
            let message = pageClientAPI.localizeText('validation_entered_counter_reading_would_cause_a_counter_overflow');
            let caption = pageClientAPI.localizeText('validation_warning_x', [dict.Point]);
            return libCom.showWarningDialog(pageClientAPI, message, caption);
        } else {
            return Promise.resolve(true);
        }
    }

    /**
     * If this is an overflow counter point, the new reading must be >= 0
     */
    static validateOverflowCounterIsNotNegative(pageClientAPI, dict) {

        //Reading is not allowed, or reading is optional and empty
        if (libThis.evalIgnoreReading(dict)) {
            return Promise.resolve(true);
        }

        //Overflow counter
        if (libThis.evalIsCounter(dict) && libThis.evalIsCounterOverflow(dict)) {
            //New reading >= 0
            if (libThis.evalReadingGreaterThanOrEqualToZero(dict)) {
                return Promise.resolve(true);
            } else {
                let message = pageClientAPI.localizeText('validation_overflow_counter_reading_must_be_greater_than_or_equal_toZero');
                libCom.setInlineControlError(pageClientAPI, libCom.getControlProxy(pageClientAPI, 'ReadingSim'), message);
                dict.InlineErrorsExist = true;
                return Promise.reject(false);
            }
        }
        return Promise.resolve(false);
    }

    /**
     * If this is a reverse non-overflow counter point, the new reading must be <= 0
     */
    static validateReverseCounterWithoutOverflowIsNotPositive(pageClientAPI, dict) {

        //Reading is not allowed, or reading is optional and empty
        if (libThis.evalIgnoreReading(dict)) {
            return Promise.resolve(true);
        }

        //Reverse counter with no overflow value
        if (libThis.evalIsCounter(dict) && libThis.evalIsReverse(dict) && !libThis.evalIsCounterOverflow(dict)) {
            //New reading <= 0
            if (libThis.evalReadingLessThanEqualToZero(dict)) {
                return Promise.resolve(true);
            } else {
                let message = pageClientAPI.localizeText('validation_reverse_counter_reading_must_be_less_than_or_equal_toZero');
                libCom.setInlineControlError(pageClientAPI, libCom.getControlProxy(pageClientAPI, 'ReadingSim'), message);
                dict.InlineErrorsExist = true;
                return Promise.reject(false);
            }
        }
        return Promise.resolve(false);
    }

    /**
     * Confirm zero reading from user
     */
    static validateZeroReading(pageClientAPI, dict) {

        //Reading is not allowed, or reading is optional and empty
        if (libThis.evalIgnoreReading(dict)) {
            return Promise.resolve(true);
        }

        //New reading = 0
        if (libThis.evalReadingIsZero(dict)) {
            let message = pageClientAPI.localizeText('validation_zero_reading_entered');
            let caption = pageClientAPI.localizeText('validation_warning_x', [dict.Point]);
            return libCom.showWarningDialog(pageClientAPI, message, caption);
        } else {
            return Promise.resolve(true);
        }
    }

    /**
    * If lower range exists, new reading must be >= lower range
    */
    static validateReadingGreaterThanOrEqualLowerRange(pageClientAPI, dict) {

        //Reading is not allowed, or reading is optional and empty
        if (libThis.evalIgnoreReading(dict)) {
            return Promise.resolve(true);
        }

        //Lower range value exists
        if (libThis.evalIsLowerRange(dict) && !libThis.evalLowerRangeIsEmpty(dict)) {
            //New reading >= lower range
            if (libThis.evalReadingGreaterThanEqualToLowerRange(dict)) {
                return Promise.resolve(true);
            } else {
                let dynamicParams = [dict.LowerRange];
                let message = pageClientAPI.localizeText('validation_reading_below_lower_range_of',dynamicParams);
                let caption = pageClientAPI.localizeText('validation_warning_x', [dict.Point]);
                return libCom.showWarningDialog(pageClientAPI, message, caption);
            }
        }
        return Promise.resolve(false);
    }

    /**
     * If lower range exists, new reading must be >= lower range
     */
    static validateReadingLessThanOrEqualUpperRange(pageClientAPI, dict) {

        //Reading is not allowed, or reading is optional and empty
        if (libThis.evalIgnoreReading(dict)) {
            return Promise.resolve(true);
        }

        //Lower range value exists
        if (libThis.evalIsUpperRange(dict) && !libThis.evalUpperRangeIsEmpty(dict)) {
            //New reading <= upper range
            if (libThis.evalReadingLessThanEqualToUpperRange(dict)) {
                return Promise.resolve(true);
            } else {
                let dynamicParams = [dict.UpperRange];
                let message = pageClientAPI.localizeText('validation_reading_exceeds_upper_range_of',dynamicParams);
                let caption = pageClientAPI.localizeText('validation_warning_x', [dict.Point]);
                return libCom.showWarningDialog(pageClientAPI, message, caption);
            }
        }

        return Promise.resolve(false);
    }

    /**
     * Evaluates whether this point is a counter
     */
    static evalIsCounter(dict) {
        return dict.IsCounter === 'X';
    }

    /**
     * Evaluates whether this point is a lower range
     */
    static evalIsLowerRange(dict) {
        return dict.IsLowerRange === 'X';
    }

    /**
     * Evaluates whether this point is a upper range
     */
    static evalIsUpperRange(dict) {
        return dict.IsUpperRange === 'X';
    }

    /**
     * Evaluates whether this point is a reverse
     */
    static evalIsReverse(dict) {
        return dict.IsReverse === 'X';
    }

    /**
    * Evaluates whether this point is a counter overflow candidate
    */
    static evalIsCounterOverflow(dict) {
        return dict.IsCounterOverflow === 'X';
    }

    /**
     * Evaluates whether the previous reading is blank
     */
    static evalIsPreviousReadingEmpty(dict) {
        return libVal.evalIsEmpty(dict.PrevReadingValue);
    }

    /**
     * Evaluates whether the reading is blank
     */
    static evalIsReadingEmpty(dict) {
        return libVal.evalIsEmpty(dict.ReadingSim);
    }

    /**
     * Evaluates whether the lower range is empty
     */
    static evalLowerRangeIsEmpty(dict) {
        return libVal.evalIsEmpty(dict.LowerRange);
    }

    /**
     * Evaluates whether the upper range is empty
     */
    static evalUpperRangeIsEmpty(dict) {
        return libVal.evalIsEmpty(dict.UpperRange);
    }

    /**
     * Evaluates whether the counter overflow reading is blank
     */
    static evalIsCounterOverflowEmpty(dict) {
        return libVal.evalIsEmpty(dict.CounterOverflow);
    }

    /**
      * Evaluates whether the code group property is blank
      */
    static evalCodeGroupIsEmpty(dict) {
        return libVal.evalIsEmpty(dict.CodeGroup);
    }

    /**
     * Evaluates whether the valuation code is blank
     */
    static evalValuationCodeIsEmpty(dict) {
        return libVal.evalIsEmpty(dict.ValuationCodeLstPkr);
    }

    /**
     * Evaluates whether the previous reading is not blank and current reading = previous reading
     */
    static evalIsPreviousReadingNotEmptyAndReadingEqualsPrevious(dict) {
        if (!libThis.evalIsPreviousReadingEmpty(dict)) {
            return libThis.evalPreviousReadingEqualsReading(dict);
        } else {
            return false;
        }
    }

    /**
     * Evaluates whether the previous reading = new reading
     */
    static evalPreviousReadingEqualsReading(dict) {
        return (Number(dict.PrevReadingValue) === Number(dict.ReadingSim));
    }

    /**
    * Evaluates whether the counter overflow is not blank and overflow > reading
    */
    static evalIsOverflowNotEmptyAndOverflowGreaterThanReading(dict) {
        if (!libThis.evalIsCounterOverflowEmpty(dict)) {
            return (Number(dict.CounterOverflow) > Number(dict.ReadingSim));
        } else {
            return false;
        }
    }

    /**
    * Evaluates whether the previous reading > current reading
    */
    static evalPreviousReadingGreaterThanOrEqualReading(dict) {
        return (Number(dict.PrevReadingValue) >= Number(dict.ReadingSim));
    }

    /**
    * Evaluates whether the new reading >= previous reading
    */
    static evalReadingGreaterThanOrEqualPreviousReading(dict) {
        return (Number(dict.ReadingSim) >= Number(dict.PrevReadingValue));
    }

    /**
    * Evaluates whether the current reading <= 0
    */
    static evalReadingLessThanEqualToZero(dict) {
        return (Number(dict.ReadingSim) <= 0);
    }

    /**
    * Evaluates whether the current reading = 0
    */
    static evalReadingIsZero(dict) {
        return (Number(dict.ReadingSim) === 0);
    }

    /**
    * Evaluates whether the current reading >= 0
    */
    static evalReadingGreaterThanOrEqualToZero(dict) {
        return (Number(dict.ReadingSim) >= 0);
    }

    /**
     * Evaluates whether the current reading >= lower range
     */
    static evalReadingGreaterThanEqualToLowerRange(dict) {
        return (Number(dict.ReadingSim) >= Number(dict.LowerRange));
    }

    /**
    * Evaluates whether the current reading <= upper range
    */
    static evalReadingLessThanEqualToUpperRange(dict) {
        return (Number(dict.ReadingSim) <= Number(dict.UpperRange));
    }

    /**
    * Evaluates whether the current reading is a number
    */
    static evalReadingIsNumeric(dict) {
        return (libVal.evalIsNumeric(dict.ReadingSim));
    }

    /**
    * Evaluates whether the current reading length is within length limit
    */
    static evalReadingLengthWithinLimit(dict, limit) {
        return (dict.ReadingSim.toString().length <= Number(limit));
    }

    /**
    * Evaluates whether the current short text length is within length limit
    */
    static evalShortTextLengthWithinLimit(dict, limit) {
        return (dict.ShortTextNote.length <= Number(limit));
    }

    /**
    * Evaluates whether there is no characteristic, meaning a valuation code must be used
    */
    static evalIsCodeOnly(dict) {
        return (libVal.evalIsEmpty(dict.CharName));
    }

    /**
    * Evaluates whether code sufficient is set
    */
    static evalIsCodeSufficient(dict) {
        return (dict.IsCodeSufficient === 'X');
    }

    /**
     * Returns the decimal precision of the passed in number
     */
    static evalPrecision(value) {
        try {
            value = Number(value);
            if (!isFinite(value)) return 0;
            var e = 1, p = 0;
            while (Math.round(value * e) / e !== value) {
                e *= 10; p++;
            }
            return p;
        } catch (err) {
            // eslint-disable-next-line no-console
            console.log('evalPrecision: ' + err.message);
            return 0;
        }
    }

    /**
     * Evaluates whether point requires an integer but user provided decimal
     */
    static evalBadInteger(dict) {
        let temp = false;
        if (!libVal.evalIsEmpty(dict.Decimal)) {
            if (Number(dict.Decimal) === 0) {
                temp = (libThis.evalPrecision(dict.ReadingSim) > 0);
            }
        }
        return temp;
    }

    /**
     * Evaluates whether point's decimal precision was exceeded by user reading
     */
    static evalBadDecimal(dict) {
        let temp = false;
        if (!libVal.evalIsEmpty(dict.Decimal)) {
            let target = Number(dict.Decimal);
            if (target > 0) {
                temp = (Number(libThis.evalPrecision(dict.ReadingSim) > target));
            }
        }
        return temp;
    }

    /**
     * Evaluates whether an reading needs to be validated or not
     */
    static evalIgnoreReading(dict) {
        //Reading is not allowed, or reading is optional and empty
        return (libThis.evalIsCodeOnly(dict) || (libThis.evalIsCodeSufficient(dict) && libThis.evalIsReadingEmpty(dict)));
    }


    /**
     * Evaluates whether we are currently in an update transaction
     */
    static evalIsUpdateTransaction(pageClientAPI) {
        return (libCom.getStateVariable(pageClientAPI, 'TransactionType') === 'UPDATE');
    }

    /**
     * Formats the measurement documents list
     */
    static measurementDocumentFieldFormat(sectionProxy) {
        var section = sectionProxy.getName();
        var property = sectionProxy.getProperty();
        var binding = sectionProxy.binding;
        let format = '';
        switch (section) {
            case 'MeasurementDocumentsList': {

                switch (property) {
                    case 'Footnote': {
                        let offset = -1 * libCom.getBackendOffsetFromSystemProperty(sectionProxy);
                        let odataDate = new ODataDate(binding.ReadingDate, binding.ReadingTime, offset);
                        format = sectionProxy.formatDatetime(odataDate.date());
                        break;
                    }
                    case 'Subhead': {
                        format = binding.ReadBy;
                        break;
                    }
                    case 'Description': {
                        let value = '';
                        if (!libVal.evalIsEmpty(binding.ValuationCode)) {
                            if (!libVal.evalIsEmpty(value)) {
                                value = value + ': ';
                            }
                            value = value + libForm.getFormattedKeyDescriptionPair(sectionProxy, binding.ValuationCode, binding.CodeShortText);
                        }
                        format = value;
                        break;
                    }
                    case 'Title': {
                        let value = '';
                        if (binding.HasReadingValue === 'X') {
                            value = binding.ReadingValue + value + ' ' + binding.UOM;
                        } else {
                            value = binding.ReadingValue + ' ' + binding.MeasuringPoint.UoM;
                        }
                        if (!libVal.evalIsEmpty(binding.ValuationCode)) {
                            if (!libVal.evalIsEmpty(value)) {
                                value = value + ': ';
                            }
                            value = value + libForm.getFormattedKeyDescriptionPair(sectionProxy, binding.ValuationCode, binding.CodeShortText);
                        }
                        format = value;
                        break;
                    }
                    default:
                        break;
                }
                break;
            }
            default:
                break;
        }
        return format;
    }

    /**
     * Formats the measuring points detail fields
     */
    static measuringPointDetailsFieldFormat(sectionProxy, key) {

        var binding = sectionProxy.binding;

        //Handle the previous reading fields on the point detail screen
        var dateTime;
        if (binding.IsPrevReading === 'X') {
            dateTime = new OffsetODataDate(sectionProxy,binding.PrevReadingDate, binding.PrevReadingTime);
        }
        let value = '';
        switch (key) {
            case 'Reading':
                if (binding.IsPrevReading === 'X') {
                    if (binding.PrevHasReadingValue === 'X') {
                        value = sectionProxy.formatNumber(binding.PrevReadingValue) + ' ' + binding.UoM;
                    }
                    return value;
                }
                break;
            case 'Valuation':
                if (binding.IsPrevReading === 'X') {
                    if (!libVal.evalIsEmpty(binding.PrevValuationCode)) {
                        value = libForm.getFormattedKeyDescriptionPair(sectionProxy, binding.PrevValuationCode, binding.PrevCodeDescription);
                    }
                    return value;
                }
                break;
            case 'ReadingDate':
                if (binding.IsPrevReading === 'X') {
                    value = sectionProxy.formatDate(dateTime.date());
                }
                return value;
            case 'ReadingTime':
                if (binding.IsPrevReading === 'X') {
                    value = sectionProxy.formatTime(dateTime.date());
                }
                return value;
            case 'ReadBy':
                if (binding.IsPrevReading === 'X') {
                    value = binding.PrevReadBy;
                }
                return value;
            case 'LowerRange':
                if (binding.IsLowerRange === 'X') {
                    return sectionProxy.formatNumber(binding.LowerRange);
                } else {
                    return '';
                }
            case 'UpperRange':
                if (binding.IsUpperRange === 'X') {
                    return sectionProxy.formatNumber(binding.UpperRange);
                } else {
                    return '';
                }
            case 'Characteristic':
                if (!libVal.evalIsEmpty(binding.CharName)) {
                    value = libForm.getFormattedKeyDescriptionPair(sectionProxy, binding.CharName, binding.CharDescription);
                }
                return value;
            case 'Difference':
                if (binding.IsPrevReading === 'X') {
                    if (binding.IsCounter === 'X') {
                        value = sectionProxy.formatNumber(binding.PrevCounterReadingDiff);
                    }
                }
                return value;
            case 'CurrentReading':
                return sectionProxy.read(
                    '/SAPAssetManager/Services/AssetManager.service',
                    'MeasurementDocuments',
                    [],
                    "$select=RecordedValue&$filter=Point eq '" + binding.Point + "' and PointObjectKey eq ''&$orderby=ReadingTimestamp desc&$top=1").then(result => {
                        if (result && result.length > 0) {
                            //Grab the first row (should only ever be one row)
                            let row = result.getItem(0);
                            var recordedValue = row.RecordedValue;
                            if (!libVal.evalIsEmpty(recordedValue)) {
                                return sectionProxy.formatNumber(recordedValue) + ' ' + binding.UoM;
                            } else {
                                return '';
                            }
                        } else {
                            return '';
                        }
                    });
            case 'CurrentShortText':
                return sectionProxy.read(
                    '/SAPAssetManager/Services/AssetManager.service',
                    'MeasurementDocuments',
                    [],
                    "$select=ShortText&$filter=Point eq '" + binding.Point + "' and PointObjectKey eq ''&$orderby=ReadingTimestamp desc&$top=1").then(result => {
                        if (result && result.length > 0) {
                            //Grab the first row (should only ever be one row)
                            let row = result.getItem(0);
                            var shortText = row.ShortText;
                            if (!libVal.evalIsEmpty(shortText)) {
                                return shortText;
                            } else {
                                return '';
                            }
                        } else {
                            return '';
                        }
                    });
            case 'CurrentValuation':
                return sectionProxy.read(
                    '/SAPAssetManager/Services/AssetManager.service',
                    'MeasurementDocuments',
                    [],
                    "$select=ValuationCode&$filter=Point eq '" + binding.Point + "' and PointObjectKey eq ''&$orderby=ReadingTimestamp desc&$top=1").then(result => {
                        if (result && result.length > 0) {
                            //Grab the first row (should only ever be one row)
                            let row = result.getItem(0);
                            var valuation = row.ValuationCode;
                            if (!libVal.evalIsEmpty(valuation)) {
                                return sectionProxy.read(
                                    '/SAPAssetManager/Services/AssetManager.service',
                                    'PMCatalogCodes',
                                    [],
                                    "$select=CodeDescription&$filter=Code eq '" + valuation + "' and CodeGroup eq '" + binding.CodeGroup + "' and Catalog eq '" + binding.CatalogType + "'").then(result2 => {
                                        if (result2.length > 0) {
                                            //Grab the first row (should only ever be one row)
                                            row = result2.getItem(0);
                                            let codeDescription = row.CodeDescription;
                                            return libForm.getFormattedKeyDescriptionPair(sectionProxy, valuation, codeDescription);
                                        }
                                        return '';
                                    });
                            }
                            return '';
                        }
                        return '';
                    });
            default:
                return '';
        }
        return value;
    }

    static measuringPointFieldFormat(sectionProxy) {
        let property = sectionProxy.getProperty();
        let binding = sectionProxy.binding;
        var propertyValue = '-';
        
        switch (property) {
            case 'Subhead': {
                if (!libVal.evalIsEmpty(binding.PointDesc)) {
                    propertyValue = binding.PointDesc;
                }
                if ((binding.hasOwnProperty('PRTPoint'))) {
                    if (!libVal.evalIsEmpty(binding.PRTPoint.PointDesc)) {
                        propertyValue = binding.PRTPoint.PointDesc;
                    }
                }
                return propertyValue;
            }
            case 'Footnote': {
                if (!libVal.evalIsEmpty(binding.Point)) {
                    propertyValue = binding.Point;
                }
                if ((binding.hasOwnProperty('PRTPoint'))) {
                    if (!libVal.evalIsEmpty(binding.PRTPoint.Point)) {
                        propertyValue = binding.PRTPoint.Point;
                    }
                }
                return propertyValue;
            }
            default:
                return propertyValue;
        }
    }

    /**
    * Formats the measuring points list
    */
    static measuringPointListFieldFormat(sectionProxy) {
        var section = sectionProxy.getName();
        let property = sectionProxy.getProperty();
        var binding = sectionProxy.binding;
        var evaluate = false;
        var value = '';

        if (binding.IsPrevReading === 'X') {
            evaluate = true;
        }
        if ((binding.hasOwnProperty('PRTPoint'))) {
            if (binding.PRTPoint.IsPrevReading === 'X') {
                evaluate = true;
            }
        }

        if (section === 'MeasuringPointsList') {
            if (evaluate) {

                let readLink = binding['@odata.readLink'] + '/MeasurementDocs';
                if ((binding.hasOwnProperty('PRTPoint'))) {
                    readLink = binding.PRTPoint['@odata.readLink'] + '/MeasurementDocs';
                }

                if (!libVal.evalIsEmpty(readLink)) {
                    return sectionProxy.read('/SAPAssetManager/Services/AssetManager.service', readLink, [], '$top=1&$orderby=ReadingTimestamp desc').then( data => {
                        var point;
                        if (data && (point = data.getItem(0))) {
                            switch (property) {
                                case 'StatusText': {
                                    let dateTime = new OffsetODataDate(sectionProxy,point.ReadingDate, point.ReadingTime);
                                    return sectionProxy.formatDatetime(dateTime.date());
                                }
                                case 'Title': {
                                    if (point.HasReadingValue === 'X') {
                                        value = point.ReadingValue;
                                        value = sectionProxy.formatNumber(value)+ ' ' + point.UOM;
                                    }
                                    if (point.HasReadingValue === 'X' && binding.hasOwnProperty('UoM')) {
                                        value = point.ReadingValue;
                                        value = sectionProxy.formatNumber(value) + ' ' + binding.UoM;
                                    }
                                    if (point.HasReadingValue === 'X' && !libVal.evalIsEmpty(binding.PRTPoint) && binding.PRTPoint.hasOwnProperty('UoM')) {
                                        value = point.ReadingValue;
                                        value = sectionProxy.formatNumber(value) + ' ' + binding.PRTPoint.UoM;
                                    }
                                    if (!libVal.evalIsEmpty(point.ValuationCode)) {
                                        if (!libVal.evalIsEmpty(value)) {
                                            value = value + ': ';
                                        }
                                        value = value + libForm.getFormattedKeyDescriptionPair(sectionProxy, point.ValuationCode, point.CodeShortText);
                                    }
                                    return value;
                                }
                                case 'SubstatusText': {
                                    if (!libVal.evalIsEmpty(point.ReadBy)) {
                                        value = point.ReadBy;
                                    }
                                    return value;
                                }
                                case 'Subhead': {
                                    if (!libVal.evalIsEmpty(binding.PointDesc)) {
                                        value = binding.PointDesc;
                                    }
                                    if ((binding.hasOwnProperty('PRTPoint'))) {
                                        if (!libVal.evalIsEmpty(binding.PRTPoint.PointDesc)) {
                                            value = binding.PRTPoint.PointDesc;
                                        }
                                    }
                                    return value;
                                }
                                case 'Footnote': {
                                    if (!libVal.evalIsEmpty(binding.Point)) {
                                        value = binding.Point;
                                    }
                                    if ((binding.hasOwnProperty('PRTPoint'))) {
                                        if (!libVal.evalIsEmpty(binding.PRTPoint.Point)) {
                                            value = binding.PRTPoint.Point;
                                        }
                                    }
                                    return value;
                                }
                                default:
                                    return value;
                            }
                        } else {
                            return value;
                        }
                    }, error => {
                        /**Implementing our Logger class*/
                        Logger.error(sectionProxy.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryMeasuringPoints.global').getValue(), error);
                        return value;
                    });
                }
            } else {
                return value;
            }
        }
        return value;
    }

    /**
     * Formats a date/time string that is sortable by OData
     */
    static getMeasuringDocumentTimestamp(context, dateTime) {
        let dt = libCom.DateTimeToBackendDateTime(context, dateTime);
        
        return dt;
    }

    /**
     * Refresh the point details page and run toast message after measuring point reading save
     */
    static createPointReadingSuccessMessage(proxyAPI) {
        try {

            let pageProxy = proxyAPI.evaluateTargetPathForAPI('#Page:MeasuringPointDetailsPage');
            let section = pageProxy.getControl('SectionedTable');
            if (section) {
                section.redraw();
            }
        } catch (err) {
            /**Implementing our Logger class*/
            Logger.error(proxyAPI.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryMeasuringPoints.global').getValue(), 'CreatePointReadingSuccessMessage Error: ' + err);
        }
        proxyAPI.executeAction('/SAPAssetManager/Actions/CreateUpdateDelete/CreateEntitySuccessMessage.action');
    }

}
