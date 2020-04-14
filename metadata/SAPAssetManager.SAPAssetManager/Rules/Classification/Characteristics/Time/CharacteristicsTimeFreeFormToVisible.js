import libCommon from '../../../Common/Library/CommonLibrary';
import freeForm from '../CharacteristicsFreeValue';
export default function CharacteristicsTimeFreeFormToVisible(formCellContainerProxy) {
    let dataType = formCellContainerProxy.binding.Characteristic.DataType;
    let valueRelation = formCellContainerProxy.binding.ValueRel;
    let valueCode = ['2','3','4','5'];
    let singleValue = formCellContainerProxy.binding.Characteristic.SingleValue;

    if (singleValue === 'X' && dataType === 'TIME' && freeForm(formCellContainerProxy) && valueCode.includes(valueRelation)) {
        libCommon.setStateVariable(formCellContainerProxy, 'VisibleControlTo',formCellContainerProxy.getName());
        libCommon.setStateVariable(formCellContainerProxy, 'ListPicker',false);
        return true;
    }
    return false;
}
