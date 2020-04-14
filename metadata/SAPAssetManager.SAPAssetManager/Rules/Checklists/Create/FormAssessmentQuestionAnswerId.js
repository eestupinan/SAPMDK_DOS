import { ChecklistLibrary as libChecklist } from '../ChecklistLibrary';

export default function formAssessmentQuestionAnswerId(pageClientAPI) {

    return libChecklist.formAssessmentQuestionCreateSetODataValue(pageClientAPI, 'AnswerId');
}
