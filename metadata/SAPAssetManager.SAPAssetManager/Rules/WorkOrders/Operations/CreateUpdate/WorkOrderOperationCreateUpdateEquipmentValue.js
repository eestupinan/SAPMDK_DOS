import {OperationControlLibrary as libOperationControl} from '../WorkOrderOperationLibrary';

export default function WorkOrderOperationCreateUpdateEquipmentValue(pageProxy) {
    return libOperationControl.getEquipment(pageProxy);
}
