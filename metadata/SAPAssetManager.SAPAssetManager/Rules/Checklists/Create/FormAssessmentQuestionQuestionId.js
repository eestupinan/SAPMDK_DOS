import { ChecklistLibrary as libChecklist } from '../ChecklistLibrary';

export default function formAssessmentQuestionQuestionId(pageClientAPI) {

    return libChecklist.formAssessmentQuestionCreateSetODataValue(pageClientAPI, 'QuestionId');
}
