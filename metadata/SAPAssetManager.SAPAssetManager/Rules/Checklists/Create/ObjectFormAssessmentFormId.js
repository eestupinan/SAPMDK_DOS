import { ChecklistLibrary as libChecklist } from '../ChecklistLibrary';

export default function objectFormAssessmentFormId(pageClientAPI) {

    return libChecklist.objectFormAssessmentCreateSetODataValue(pageClientAPI, 'FormId');
}
