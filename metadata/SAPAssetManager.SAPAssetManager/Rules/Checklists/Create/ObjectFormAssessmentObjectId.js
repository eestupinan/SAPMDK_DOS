import { ChecklistLibrary as libChecklist } from '../ChecklistLibrary';

export default function objectFormAssessmentObjectId(pageClientAPI) {

    return libChecklist.objectFormAssessmentCreateSetODataValue(pageClientAPI, 'ObjectId');
}
