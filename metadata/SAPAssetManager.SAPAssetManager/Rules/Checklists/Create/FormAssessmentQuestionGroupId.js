import { ChecklistLibrary as libChecklist } from '../ChecklistLibrary';

export default function formAssessmentQuestionGroupId(pageClientAPI) {

    return libChecklist.formAssessmentQuestionCreateSetODataValue(pageClientAPI, 'GroupId');
}
