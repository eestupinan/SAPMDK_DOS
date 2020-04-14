import libCommon from '../../Common/Library/CommonLibrary';
import minuteInterval from '../../TimeSheets/Entry/CreateUpdate/TimeSheetEntryMinuteInterval';

export default function ConfirmationCreateUpdateNav(context, override, defaultStart=DefaultDurationAgo(context), defaultEnd = new Date()) {

    let mConfirmation = {
        '_Start': defaultStart,
        '_End': defaultEnd,
        'IsOnCreate': true,
        'IsWorkOrderChangable': true,
        'IsOperationChangable': true,
        'IsSubOperationChangable': true,
        'IsDateChangable': true,
        'IsFinalChangable': true,
        'SubOperation': '',
        'VarianceReason': '',
        'AccountingIndicator': '',
        'ActivityType': '',
        'Description': '',
        'Operation': '',
        'OrderID': '',
        'Plant': '',
        'IsFinal': false,
        'WorkOrderHeader': undefined,
    };

    if (override) {
        for (const [key, value] of Object.entries(override)) {
            mConfirmation[key] = value;
        }
    }

    //set the CHANGSET flag to true
    libCommon.setOnChangesetFlag(context, true);
    libCommon.resetChangeSetActionCounter(context);

    context.setActionBinding(mConfirmation);
    return context.executeAction('/SAPAssetManager/Actions/Confirmations/ConfirmationCreateChangeset.action');

}

export function DefaultDurationAgo(context) {

    let minsDuration = minuteInterval(context);

    let date = new Date();
    date.setMinutes(date.getMinutes() - minsDuration);
    return date;
}
