import libCom from '../../Common/Library/CommonLibrary';
import libVal from '../../Common/Library/ValidationLibrary';
import { ChecklistLibrary as libChecklist } from '../ChecklistLibrary';

export default function ChecklistCreateNav(context) {
   
    return context.executeAction('/SAPAssetManager/Actions/Checklists/Create/ChecklistCreateChangeset.action').then(() => {
        //If the changeset was created without error, continue processing non-changeset creates
        if (!libVal.evalIsEmpty(libCom.getStateVariable(context,'Checklist-AssessmentId'))) {
            return context.executeAction('/SAPAssetManager/Actions/Checklists/Create/ObjectFormAssessmentCreate.action').then(() => {
                return libChecklist.formAssessmentQuestionsCreateSave(context).then(() => {
                    libCom.clearFromClientData(context, ['Checklist-Question','Checklist-AssessmentId','Checklist-FormId','Checklist-TemplateId','Checklist-Rows'], undefined, true);
                    libCom.redrawPageSection(context, 'ChecklistsListViewPage', 'SectionedTable');  //Redraw the screen - subscriptions bug
                    return Promise.resolve(true);
                });
            });
        } else {
            libCom.clearFromClientData(context, ['Checklist-Question','Checklist-AssessmentId','Checklist-FormId','Checklist-TemplateId','Checklist-Rows'], undefined, true);
            return Promise.resolve(true);
        }
    });
}
