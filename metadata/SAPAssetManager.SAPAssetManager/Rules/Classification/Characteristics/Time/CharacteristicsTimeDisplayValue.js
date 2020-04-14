import dateTime from './CharacteristicsFormatBackendTimeToLocal';
import fixTime from  './CharacteristicFixTime';

export default function CharacteristicsTimeDisplayValue(context,time) {
    var timeString = time.toString();
    // Need to check if the time string is not '0' or dummy value which 
    // would be in form of 10000000000000000
    // We need a 6 digit time in the form of HHMMSS.  In testing it was found that
    // sometimes the time contains 5 digits, indicating it is HMMSS, so pad with a leading zero
    // Sometimes the time contains 4 digits, indicating it HHMM, so pad with trailing zeros for seconds
    if (timeString !== '0' && timeString.length < 7) {
        timeString = fixTime(timeString);
        return context.formatTime(dateTime(context, timeString));
    }
    return '0';
}
