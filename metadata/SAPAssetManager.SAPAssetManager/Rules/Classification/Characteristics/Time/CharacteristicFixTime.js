
export default function CharacteristicFixTime(time) { 
    // In order to get the correct time we need to pass a six character string in the form HHMMSS
    // On occasion, it comes with 5 digits, indicating it is HMMSS, so pad with a leading zero
    // Sometimes it comes with 4 digits, indicating it HHMM, so pad with trailing zeros for seconds


    if (time.length === 5) {
        time = '0' + time;
    } else if (time.length === 4) {
        time = time + '00';
    }
    //there might be a case, when we receive an incorrect value which then causes invalid time errors -> prevent from that by 000000
    //that happens when a time picker is not displayed anyway, but the value of it is calculated by MDK from some incorrect data
    if (time.length < 6) {
        time = '000000';
    }

    return time;
}
