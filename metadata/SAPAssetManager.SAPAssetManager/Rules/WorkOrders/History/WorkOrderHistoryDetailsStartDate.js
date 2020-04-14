import CommonLib from '../../Common/Library/CommonLibrary';
import valLib from '../../Common/Library/ValidationLibrary';

/**
 * Rule to format the work order end date value as "<day of week>, MM/dd/YYYY"
 * @param {*} context
 * @returns {String} Formatted date string.
 */
export default function WorkOrderHistoryDetailsStartDate(context) {
    let binding = context.binding;
    if (binding.hasOwnProperty('StartDate') && !valLib.evalIsEmpty(context.binding.StartDate)) {
        let dt = CommonLib.backendDateTimeToLocalDateString(context, context.binding.StartDate);
        return dt.substring(5, 7) + '/' + dt.substring(8, 10) + '/' + dt.substring(0, 4);
    } else {
        return '';
    }
}
