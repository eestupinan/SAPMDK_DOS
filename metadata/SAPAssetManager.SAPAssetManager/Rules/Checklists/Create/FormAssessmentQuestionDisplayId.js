import { ChecklistLibrary as libChecklist } from '../ChecklistLibrary';

export default function formAssessmentQuestionDisplayId(pageClientAPI) {

    return libChecklist.formAssessmentQuestionCreateSetODataValue(pageClientAPI, 'DisplayId');
}
