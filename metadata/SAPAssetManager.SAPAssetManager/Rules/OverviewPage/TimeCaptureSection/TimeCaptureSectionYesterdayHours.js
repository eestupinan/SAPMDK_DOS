import TimeCaptureTypeHelper from './TimeCaptureTypeHelper';
import TimeSheetYesterdayHours from '../../TimeSheets/TimeSheetsYesterdaysHours';
import ConfirmationTotalDuration from '../../Confirmations/ConfirmationTotalDuration';

export default function TimeCaptureSectionYesterdayHours(context) {

    return TimeCaptureTypeHelper(context, ConfirmationYesterdayHours, TimeSheetYesterdayHours);
}

function ConfirmationYesterdayHours(context) {

    let date = new Date();
    date.setDate(date.getDate() - 1);
    return ConfirmationTotalDuration(context, date).then(hours => {
        return context.localizeText('x_hours', [hours]);
    });
}
