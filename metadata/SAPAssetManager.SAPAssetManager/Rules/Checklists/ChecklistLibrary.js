import libCom from '../Common/Library/CommonLibrary';
import libVal from '../Common/Library/ValidationLibrary';
import Logger from '../Log/Logger';
import { ChecklistLibrary as libThis } from './ChecklistLibrary';
import ODataDate from '../Common/Date/ODataDate';

/**
 * Contains all checklist related methods
 */
export class ChecklistLibrary {

    /**
     * Triggered when one of the control has changed the value; Bound to each necessary control
     * @param {ControlProxy} control
     */
    static checklistCreateOnChange(control) {

        let controlName = control.getName();
        let context = control.getPageProxy();
        let controls = libCom.getControlDictionaryFromPage(context);
        let binding = context.binding;

        switch (controlName) {
            case 'CategoryLstPkr':
                //On category change, re-filter TemplateLstPkr by category
                try {
                    let templateLstPkrSpecifier = controls.TemplateLstPkr.getTargetSpecifier();
                    let templateLstPkrQueryOptions = '$expand=TemplateHeader_Nav&$orderby=TemplateHeader_Nav/ShortDescription';
                    let category = '';

                    if (!libVal.evalIsEmpty(libCom.getControlValue(controls.CategoryLstPkr))) {
                        category = libCom.getControlValue(controls.CategoryLstPkr);
                    }

                    let objectLookup = '';
                    if (binding['@odata.type'] === '#sap_mobile.MyEquipment') {
                        if (binding.hasOwnProperty('AssetCentralObjectLink_Nav') && binding.AssetCentralObjectLink_Nav.length >= 1) {
                            objectLookup = binding.AssetCentralObjectLink_Nav[0].AINObjectId;
                        } else {
                            break; //No object link, so exit this routine without updating the template list picker
                        }
                    }

                    controls.TemplateLstPkr.setValue('');
                    templateLstPkrSpecifier.setEntitySet("ObjectFormCategories(ObjectId='" + objectLookup + "',FormCategory='" + category + "')/FormCategoryTemplates_Nav");
                    templateLstPkrSpecifier.setQueryOptions(templateLstPkrQueryOptions);
                    controls.TemplateLstPkr.setTargetSpecifier(templateLstPkrSpecifier);
                } catch (err) {
                    /**Implementing our Logger class*/
                    Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryChecklists.global').getValue(),`ChecklistLibrary.checklistCreateOnChange(control) error: ${err}`);
                }
                break;
            default:
                break;
        }

        //JCL - Not doing this for now.  Put in place when we can handle for all fields
        if (!libVal.evalIsEmpty(control.getValue())) {
            control.clearValidation();
        }
        return true;
    }

   /**
     * This function tells you what is being displayed for the various properties of the checklist list view row.
     * @param context The PageProxy object.
     */
    static checklistListViewFormat(context) {
        var section = context.getName();
        var property = context.getProperty();
        var value = '';
        var odataDate;
        var checklist = libThis.getChecklistObjectFromContext(context);
        const openStatus = libCom.getAppParam(context, 'CHECKLISTS', 'MobileStatusOpen');
        const inProgressStatus = libCom.getAppParam(context, 'CHECKLISTS', 'MobileStatusInProgress');
        const completedStatus = libCom.getAppParam(context, 'CHECKLISTS', 'MobileStatusCompleted');

        switch (section) {
            case 'ChecklistsListViewSection':
                switch (property) {
                    case 'Subhead':
                        switch (checklist.Form_Nav.MobileStatus) {
                            case openStatus:
                                odataDate = new ODataDate(checklist.Form_Nav.CreatedOn).date();
                                value = context.localizeText('created') + ' ' + context.formatDate(odataDate);
                                break;
                            case inProgressStatus:
                                odataDate = new ODataDate(checklist.Form_Nav.UpdatedOn).date();
                                value = context.localizeText('updated') + ' ' + context.formatDate(odataDate);
                                break;
                            case completedStatus:
                                odataDate = new ODataDate(checklist.Form_Nav.UpdatedOn).date();
                                value = context.localizeText('completed') + ' ' + context.formatDate(odataDate);
                                break;
                            default:
                                value = '';
                                break;
                        }
                        break;
                    case 'SubstatusText':
                        //Display equipment status text.
                        value = checklist.Form_Nav.MobileStatus;
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

    /**
     * Find the checklist object from context
     * @param {*} context Could be SectionProxy, PageProxy, etc.
     * @return checklist object or undefined if nothing found.
     */
    static getChecklistObjectFromContext(context) {
        var checklist = context.binding;
        if (libCom.isDefined(checklist.AssessmentId)) {
            return checklist;
        }
        checklist = context.getPageProxy().binding;
        if (libCom.isDefined(checklist.AssessmentId)) {
            return checklist;
        }
        /**Implementing our Logger class*/
        Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryChecklists.global').getValue(), 'ChecklistLibrary.getChecklistObjectFromContext() Error: Could not find checklist object from context');
        return undefined;
    }

    /**
     * Generates a random GUID
     */
    static guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4();
    }

    /**
     * Sets values for ObjectFormAssessment OData record
     * @param {*} context
     * @param {*} key
     */
    static objectFormAssessmentCreateSetODataValue(context, key) {

        let binding = context.binding;

        switch (key) {
            case 'AssessmentId':
                if (libVal.evalIsEmpty(libCom.getStateVariable(context,'Checklist-AssessmentId'))) {
                    let guid = libThis.guid();
                    libCom.setStateVariable(context, 'Checklist-AssessmentId', guid);
                }
                return libCom.getStateVariable(context,'Checklist-AssessmentId');
            case 'EquipId':
                if (binding['@odata.type'] === '#sap_mobile.MyEquipment') {
                    return binding.EquipId;
                } else {
                    return '';
                }
            case 'FuncLocIdIntern':
                if (binding['@odata.type'] === '#sap_mobile.MyFunctionalLocation') {
                    return binding.FuncLocIdIntern;
                } else {
                    return '';
                }
            case 'ObjectId':
                return binding.AssetCentralObjectLink_Nav[0].AINObjectId;
            case 'FormId':
                return libCom.getStateVariable(context,'Checklist-FormId');
            default:
                return '';
        }
    }

    /**
     * Sets values for Form OData record
     * @param {*} context
     * @param {*} key
     */
    static formCreateSetODataValue(context, key) {

        var controls = libCom.getControlDictionaryFromPage(context);
 
        switch (key) {
            case 'FormId':
                if (libVal.evalIsEmpty(libCom.getStateVariable(context,'Checklist-FormId'))) {
                    let guid = libThis.guid();
                    libCom.setStateVariable(context, 'Checklist-FormId', guid);
                }
                return libCom.getStateVariable(context,'Checklist-FormId');
            case 'ShortDescription':
                return libCom.getListPickerDisplayValue(controls.TemplateLstPkr.getValue());
            case 'CreatedOn':
                return new ODataDate().toLocalDateString(context);
            default:
                return '';
        }
    }

    /**
     * Sets values for FormBusObject OData record
     * @param {*} context
     * @param {*} key
     */
    static formBusObjectCreateSetODataValue(context, key) {

        var controls = libCom.getControlDictionaryFromPage(context);
 
        switch (key) {
            case 'TemplateId':
                libCom.setStateVariable(context, 'Checklist-TemplateId', libCom.getControlValue(controls.TemplateLstPkr));
                return libCom.getControlValue(controls.TemplateLstPkr);
            default:
                return '';
        }
    }

    /**
     * Sets values for FormAssessmentQuestion OData record during create
     * @param {*} context
     * @param {*} key
     */
    static formAssessmentQuestionCreateSetODataValue(context, key) {

        const row = libCom.getStateVariable(context, 'Checklist-Question'); //This is the current row, set during formAssessmentQuestionProcessLoop

        switch (key) {
            case 'AnswerId':
                return row.AnswerId;
            case 'DisplayId':
                return row.DisplayId;
            case 'GroupId':
                return row.GroupId;
            case 'QuestionId':
                return row.QuestionId;
            case 'SortNumber':
                return row.SortNumber;
            default:
                return '';
        }
    }

    /**
     * Creates the navigation relationships for a new FormBusObject record
     * @param {*} context
     */
    static formBusObjectCreateLinks(context) {
        var links = [];

        let link = context.createLinkSpecifierProxy(
            'Form_Nav',
            'Forms',
            '',
            'pending_1'
        );
        links.push(link.getSpecifier());

        return links;
    }

    /**
     * Creates the navigation relationships for a new ObjectFormAssessment record
     * @param {*} context
     */
    static objectFormAssessmentCreateLinks(context) {

        var links = [];

        links.push({
            'Property': 'Form_Nav',
            'Target':
            {
                'EntitySet': 'Forms',
                'ReadLink': "Forms('" + libCom.getStateVariable(context, 'Checklist-FormId') + "')",
            },
        });

        if (context.binding['@odata.type'] === '#sap_mobile.MyEquipment') {
            links.push({
                'Property': 'Equipment_Nav',
                'Target':
                {
                    'EntitySet': 'MyEquipments',
                    'ReadLink': context.binding['@odata.readLink'],
                },
            });
        }

        links.push({
            'Property': 'AssessmentBusObject_Nav',
            'Target':
            {
                'EntitySet': 'FormBusObjects',
                'ReadLink': "FormBusObjects('" + libCom.getStateVariable(context, 'Checklist-AssessmentId') + "')",
            },
        });

        return links;
    }

    /**
     * Creates the navigation relationships for a new FormAssessmentQuestion record
     * @param {*} context
     */
    static formAssessmentQuestionCreateLinks(context) {

        var links = [];

        links.push({
            'Property': 'FormQuestion_Nav',
            'Target':
            {
                'EntitySet': 'FormQuestions',
                'ReadLink': "FormQuestions('" + libCom.getStateVariable(context, 'Checklist-Question').QuestionId + "')",
            },
        });

        links.push({
            'Property': 'FormGroup_Nav',
            'Target':
            {
                'EntitySet': 'FormGroups',
                'ReadLink': "FormGroups('" + libCom.getStateVariable(context, 'Checklist-Question').GroupId + "')",
            },
        });

        links.push({
            'Property': 'FormBusObject_Nav',
            'Target':
            {
                'EntitySet': 'FormBusObjects',
                'ReadLink': "FormBusObjects('" + libCom.getStateVariable(context, 'Checklist-AssessmentId') + "')",
            },
        });

        return links;

    }

    /**
     * Runs after new assessment is created, adding the questions from master data
     * @param {*} context
     */
    static formAssessmentQuestionsCreateSave(context) {
        //Loop over all questions selected for add
        return context.read('/SAPAssetManager/Services/AssetManager.service', 'FormTemplateQuestions', [], "$orderby=SortNumber&$filter=TemplateId eq '" + libCom.getStateVariable(context, 'Checklist-TemplateId') + "'").then(rows => {
            if (!libVal.evalIsEmpty(rows)) {
                //Save the rows for sequential processing/posting
                libCom.setStateVariable(context, 'Checklist-Rows', rows);
                libCom.setStateVariable(context, 'Checklist-Counter', -1);
                //Start processing the question add loop
                return libThis.formAssessmentQuestionProcessLoop(context);
            } else {
                return Promise.resolve(true); //No rows to process
            }
        }, err => {
            Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryChecklists.global').getValue(),`ChecklistsLibrary.formAssessmentQuestionCreateSave() OData read error: ${err}`);
            return '';
        });
    }

    /**
     * Process the next form assessment question create during form assessment add
     * @param {*} context
     */
    static formAssessmentQuestionProcessLoop(context) {
        const questions = libCom.getStateVariable(context, 'Checklist-Rows');
        let counter = libCom.getStateVariable(context, 'Checklist-Counter');
        counter++;
        if (counter === questions.length) { //We are done processing rows
            return Promise.resolve(true);
        } else { //Process row
            libCom.setStateVariable(context, 'Checklist-Counter', counter); //Increment the counter
            libCom.setStateVariable(context, 'Checklist-Question', questions.getItem(counter)); //Save the current row for processing in action
            return context.executeAction('/SAPAssetManager/Actions/Checklists/Create/FormAssessmentQuestionCreate.action');
        }
    }

    /**
     * The FormAssessmentQuestions have been updated, so update the ObjectFormAssessment header statuses and display success
     * @param {*} context 
     */
    static checklistFDCUpdateSuccess(context) {

        let answered = 0;
        let successAction = '/SAPAssetManager/Actions/Checklists/UpdateChecklistSuccessMessage.action';

        //Read the questions for this assessment
        return context.read('/SAPAssetManager/Services/AssetManager.service', 'FormAssessmentQuestions', [], "$filter=AssessmentId eq '" + context.binding.AssessmentId + "'").then(results => {
            if (!libVal.evalIsEmpty(results)) {
                for (var i = 0; i < results.length; i++) {
                    let row = results.getItem(i);
                    if (!libVal.evalIsEmpty(row.SelectedAnswerOptionId)) {
                        answered++; //Question has been answered
                    }
                }
                if (answered > 0) {
                    if (answered < results.length) { //Not all questions answered
                        return context.executeAction('/SAPAssetManager/Actions/Checklists/FormsUpdateInProgress.action').then(() => {
                            return context.executeAction(successAction);
                        });
                    } else { //All questions answered
                        return context.executeAction('/SAPAssetManager/Actions/Checklists/FormsUpdateCompleted.action').then(() => {
                            return context.executeAction(successAction);
                        });
                    }
                } else {
                    return context.executeAction(successAction); //No questions answered
                }
            } else {
                return context.executeAction(successAction); //No rows to process   
            }
        }, err => {
            Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryChecklists.global').getValue(),`ChecklistsLibrary.checklistFDCUpdateSuccess() OData read error: ${err}`);
            return Promise.reject(false);
        });        
    }

    /**
     * Check the current equipment for non-completed checklist assessments.  Prompt user with a warning if any are found
     * @param {*} context 
     * @param {*} equipment 
     */
    static allowWorkOrderComplete(context, equipment) {

        let checklistEnabled = (libCom.getAppParam(context, 'CHECKLISTS', 'Enable') === 'Y');
        if (!checklistEnabled || libVal.evalIsEmpty(equipment)) { //Only process this method if the checklists feature is enabled and equipment is populated
            return Promise.resolve(true);
        }
        let completed = libCom.getAppParam(context, 'CHECKLISTS', 'MobileStatusCompleted');
        
        return context.count('/SAPAssetManager/Services/AssetManager.service',"MyEquipments('" + equipment + "')/EquipAssessments_Nav", "$expand=Form_Nav&$filter=Form_Nav/MobileStatus ne '" + completed + "'").then(count => {
            if (count < 1) { //No incomplete checklists
                return Promise.resolve(true);
            }
            return context.executeAction('/SAPAssetManager/Actions/Checklists/UnfinishedChecklistConfirm.action').then(successResult => {
                    return Promise.resolve(successResult.data);
            });
        });
    }

}
