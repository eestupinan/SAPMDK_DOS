import ODataDate from '../../../Common/Date/ODataDate';
import charValue from '../CharacteristicValueTo';

export default function CharacteristicsDateToDisplay(formCellContainerProxy) {
    var date = charValue(formCellContainerProxy);
    if (formCellContainerProxy.binding.Characteristic.DataType === 'DATE' && date.lenght>7) {
        date = [date.slice(0,4),'-',date.slice(4,6),'-',date.slice(6)].join('');
        return new ODataDate(date).date();
    } else {
        return new ODataDate().date();
    }
}
