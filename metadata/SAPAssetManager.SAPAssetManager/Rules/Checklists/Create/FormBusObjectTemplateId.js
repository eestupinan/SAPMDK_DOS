import { ChecklistLibrary as libChecklist } from '../ChecklistLibrary';

export default function formBusObjectTemplateId(pageClientAPI) {

    return libChecklist.formBusObjectCreateSetODataValue(pageClientAPI, 'TemplateId');
}
