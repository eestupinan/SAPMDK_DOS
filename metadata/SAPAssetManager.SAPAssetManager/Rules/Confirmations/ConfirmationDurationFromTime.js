import ODataDate from '../Common/Date/ODataDate';

export default function ConfirmationDurationFromTime(confirmation) {

    if (confirmation.ActualDuration && confirmation.ActualDuration > 0 ) { //As per Syam, the order of precedence should be AcutalDuration -> AcutalWork -> Start/End time
        if (confirmation.ActualDurationUOM === 'HR') { //As per Syam, we should only expect the UOM to be MIN or HR
            return confirmation.ActualDuration * 60;
        } else {
            return confirmation.ActualDuration;
        }

    } else if (confirmation.ActualWork && confirmation.ActualWork > 0 ) {
        if (confirmation.ActualWorkUOM === 'HR') {
            return confirmation.ActualWork * 60;
        } else {
            return confirmation.ActualWork;
        }

    } else if (confirmation.StartTime && confirmation.StartDate && confirmation.FinishTime && confirmation.FinishDate) {

        let start = new ODataDate(confirmation.StartDate, confirmation.StartTime);
        let finish = new ODataDate(confirmation.FinishDate, confirmation.FinishTime);

        return (finish.date() - start.date()) / (60 * 1000); 
    } else {
        return 0.0;
    }
}
