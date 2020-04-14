import { ChecklistLibrary as libChecklist } from '../ChecklistLibrary';

export default function formAssessmentQuestionSortNumber(pageClientAPI) {

    return libChecklist.formAssessmentQuestionCreateSetODataValue(pageClientAPI, 'SortNumber');
}
