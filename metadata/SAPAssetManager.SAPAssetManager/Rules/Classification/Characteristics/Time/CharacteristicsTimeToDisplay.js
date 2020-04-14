import dateTime from './CharacteristicsFormatBackendTimeToLocal';
import charValue from '../CharacteristicValueTo';

export default function CharacteristicsTimeToDisplay(formCellContainerProxy) {
    var time = charValue(formCellContainerProxy);
    if (time < 0 || isNaN(time)) {
        var currentDate = new Date();
        time = currentDate.getTime();
    }
    // In order to get the correct time we need to pass a six character string
    if (time.length < 6) {
        time = '0'+time;
    }
    //there might be a case, when we receive an incorrect value which then causes invalid time errors -> prevent from that by 000000
    //that happens when a time picker is not displayed anyway, but the value of it is calculated by MDK from some incorrect data
    if (time.length < 6) {
        time = '000000';
    }
    return dateTime(formCellContainerProxy, time);
}
