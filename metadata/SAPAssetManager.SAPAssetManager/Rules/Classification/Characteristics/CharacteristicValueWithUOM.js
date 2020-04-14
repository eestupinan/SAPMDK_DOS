
/**
 * Assemble Characteristics with theri respective Unit of Measure to
 * display on the list view.
 */
import assembleDisplayValues from './CharacteristicAssembleDisplayValue';
import dateDisplayValue from '../Characteristics/Date/CharacteristicsDateDisplayValue';
import timeDisplayValue from '../Characteristics/Time/CharacteristicsTimeDisplayValue';
import charValue from '../Characteristics/Character/CharacteristicCharacterDescription';

export default function CharacteristicValueWithUOM(context, characteristic) {
    let dataType = context.binding.Characteristic.DataType;
    let singleValue = context.binding.Characteristic.SingleValue;
    let numberOfDecimals = context.binding.Characteristic.NumofDecimal;
    let result = characteristic.CharValue;
    switch (dataType) {
        case 'NUM':
            switch (singleValue) {
                case 'X':
                    result = assembleDisplayValues(context, characteristic.ValueRel, context.formatNumber(characteristic.CharValFrom,'',{maximumFractionDigits:numberOfDecimals}), context.formatNumber(characteristic.CharValTo,'', {maximumFractionDigits:numberOfDecimals}), 'SingleValues', true);
                    break;
                default:
                    result = assembleDisplayValues(context, characteristic.ValueRel,  context.formatNumber(characteristic.CharValFrom,'', {maximumFractionDigits:numberOfDecimals}), context.formatNumber(characteristic.CharValTo, '', {maximumFractionDigits:numberOfDecimals}), 'MultipleValues', true);
                    break;
            }
            break;
        case 'CURR': 
            switch (singleValue) {
                case 'X':
                    result = assembleDisplayValues(context, characteristic.ValueRel, context.formatNumber(characteristic.CharValFrom, '', {maximumFractionDigits:numberOfDecimals}), context.formatNumber(characteristic.CharValTo, '', {maximumFractionDigits:numberOfDecimals}), 'SingleValues', true);
                    break;
                default:
                    result = assembleDisplayValues(context, characteristic.ValueRel,  context.formatNumber(characteristic.CharValFrom, '', {maximumFractionDigits:numberOfDecimals}), context.formatNumber(characteristic.CharValTo, '', {maximumFractionDigits:numberOfDecimals}), 'MultipleValues', true);
                    break;
            }
            break;
        case 'DATE': 
            switch (singleValue) {
                case 'X':
                    result = assembleDisplayValues(context,characteristic.ValueRel, dateDisplayValue(context,characteristic.CharValFrom),dateDisplayValue(context, characteristic.CharValTo), 'SingleValues', true);
                    break;
                default:
                    result = assembleDisplayValues(context, characteristic.ValueRel, dateDisplayValue(context, characteristic.CharValFrom), dateDisplayValue(context, characteristic.CharValTo), true);
                    break;
            }
            break;
        case 'TIME': 
            switch (singleValue) {
                case 'X':
                    result = assembleDisplayValues(context,characteristic.ValueRel, timeDisplayValue(context, characteristic.CharValFrom), timeDisplayValue(context, characteristic.CharValTo), 'SingleValues', true);
                    break;
                default:
                    result = assembleDisplayValues(context, characteristic.ValueRel, timeDisplayValue(context, characteristic.CharValFrom), timeDisplayValue(context, characteristic.CharValTo), true);
                    break;
            }
            break;
        default:
            result = charValue(characteristic); 
            break;
    }
    return result;
}
