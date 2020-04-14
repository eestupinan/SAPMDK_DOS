import { ChecklistLibrary as libChecklist } from '../ChecklistLibrary';

export default function formShortDescription(pageClientAPI) {

    return libChecklist.formCreateSetODataValue(pageClientAPI, 'ShortDescription');
}
