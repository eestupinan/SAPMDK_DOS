import GetStartDateTime from './GetStartDateTime';
import GetEndDateTime from './GetEndDateTime';
import ODataDate from '../../../Common/Date/ODataDate';

/**
 * 
 * @param {*} context 
 */
export default function IsValidConfirmation(context) {

    
    let binding = context.getBindingObject();

    if (binding.OrderID.length === 0) {
        return false;
    }

    let now = new Date();
    let start = GetStartDateTime(context);

    // If trying to start in the future, not valid
    if (start > now) {
        return context.executeAction('/SAPAssetManager/Actions/Confirmations/ConfirmationValidationInvalidStart.action').then(function() {
            return Promise.reject(false);
        });
    }


    let endDateTime = GetEndDateTime(context);

    //convert end date and time to backend date
    let dbEndDate = convertDateTimeToDBDate(context, endDateTime);

    //convert current date and time to backend date
    let currentDBDate = convertDateTimeToDBDate(context, now);

	//backend will not allow posting of labor time if the date is in the future
    if (dbEndDate > currentDBDate) {
        return context.executeAction('/SAPAssetManager/Actions/Confirmations/ConfirmationValidationInvalidEnd.action').then(function() {
            return false;
        });
    }

    return true;
}

function convertDateTimeToDBDate(context, dateTime) {
    let offset = new Date().getTimezoneOffset() * 60 * 1000;

    let dateTimeInUTC = dateTime.getTime() + offset;
    let odateDateTimeInUTC = new ODataDate(dateTimeInUTC);
    let dbDateTime = odateDateTimeInUTC.toDBDate(context);
    return new Date(dbDateTime.getFullYear(), dbDateTime.getMonth(), dbDateTime.getDate());
}
