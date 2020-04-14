import { ChecklistLibrary as libChecklist } from '../ChecklistLibrary';

export default function objectFormAssessmentEquipId(pageClientAPI) {

    return libChecklist.objectFormAssessmentCreateSetODataValue(pageClientAPI, 'EquipId');
}
