
import ConfirmationCreateUpdateNav from './ConfirmationCreateUpdateNav';
import ODataDate from '../../Common/Date/ODataDate';
import minuteInterval from '../../TimeSheets/Entry/CreateUpdate/TimeSheetEntryMinuteInterval';

export default function ConfirmationCreateWithPostingDate(context) {


    let durationInMillis = minuteInterval(context) * 60 * 1000;
    let currentDate = new Date();
    currentDate.setTime(currentDate.getTime() - durationInMillis);
    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();
    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;
    let timeStr = `${hours}:${minutes}:00`;
    let postingDate = context.getBindingObject().PostingDate;
    let odataDate = new ODataDate(postingDate, timeStr);
    
    let override = {
        'IsDateChangable': false,
    };

    return ConfirmationCreateUpdateNav(context, override, odataDate.date(), odataDate.date());
} 
