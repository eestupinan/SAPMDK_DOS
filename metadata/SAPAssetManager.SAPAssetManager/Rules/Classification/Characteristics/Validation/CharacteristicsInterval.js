import valueFromControl from '../CharacteristicValueFromControl';
import libCommon from '../../../Common/Library/CommonLibrary';
import ODataDate from '../../../Common/Date/ODataDate';
import dateTime from '../Time/CharacteristicsFormatBackendTimeToLocal';
import validationFlag from './CharacteristicsValidationCheck';


export default function CharacteristicsInterval(context, controlFrom, controlTo) {
    let valueRelation  = context.binding.CharValCode_Nav.ValueCode2;
    var valueFrom = valueFromControl(context, controlFrom);
    var valueTo = valueFromControl(context, controlTo);
    switch (context.binding.Characteristic.DataType) {
        case 'DATE':
            //Converting dates from String to Proper Date format
            valueFrom = valueFrom.toString();
            valueTo = valueTo.toString();
            valueFrom = [valueFrom.slice(0,4),'-',valueFrom.slice(4,6),'-',valueFrom.slice(6)].join('');
            valueFrom = new ODataDate(valueFrom);
            valueTo = [valueTo.slice(0,4),'-',valueTo.slice(4,6),'-',valueTo.slice(6)].join('');
            valueTo = new ODataDate(valueTo);
            break;
        case 'TIME':
            //Converting time from String to Proper time format
            valueFrom = valueFrom.toString();
            if (valueFrom.length < 6) {
                valueFrom = '0'+valueFrom;
            }
            valueFrom = dateTime(context, valueFrom);
            valueTo = valueTo.toString();
            if (valueTo.length < 6) {
                valueTo = '0'+valueTo;
            }
            valueTo = dateTime(context, valueTo);
            break;
        default:
            break;
    }
    //The validation flag checks for validation based on data type
    if (!validationFlag(context,valueFrom,valueTo,valueRelation)) {
        let message = context.localizeText('interval_not_valid');
        libCommon.executeInlineControlError(context, controlFrom, message);
        libCommon.executeInlineControlError(context, controlTo, message);
        return false;
    }
    return true;
}
