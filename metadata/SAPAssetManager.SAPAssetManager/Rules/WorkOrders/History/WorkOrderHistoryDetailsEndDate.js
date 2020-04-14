import CommonLib from '../../Common/Library/CommonLibrary';
import valLib from '../../Common/Library/ValidationLibrary';

/**
 * Rule to format the work order end date value as "<day of week>, MM/dd/YYYY"
 * @param {*} context
 * @returns {String} Formatted date string.
 */
export default function WorkOrderHistoryDetailsEndDate(context) {
    let binding = context.binding;
    if (binding.hasOwnProperty('EndDate') && !valLib.evalIsEmpty(context.binding.EndDate)) {
        let dt = CommonLib.backendDateTimeToLocalDateString(context, context.binding.EndDate);
        return dt.substring(5, 7) + '/' + dt.substring(8, 10) + '/' + dt.substring(0, 4);
    } else {
        return context.localizeText('ongoing');
    }
}
