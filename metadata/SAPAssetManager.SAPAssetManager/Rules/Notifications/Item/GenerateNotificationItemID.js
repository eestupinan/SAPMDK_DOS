import libCommon from '../../Common/Library/CommonLibrary';
import libNotif from '../NotificationLibrary';
import GenerateLocalID from '../../Common/GenerateLocalID';

export default function GenerateNotificationItemID(context) {
    // If adding from a Job, our context will not be right
    if (context.binding && !(libNotif.getAddFromJobFlag(context) || libNotif.getAddFromOperationFlag(context) || libNotif.getAddFromSuboperationFlag(context) || libNotif.getAddFromMapFlag(context))) {
        if (context.binding.ItemNumber) {
            return context.binding.ItemNumber;
        } else if (context.binding['@odata.readLink']) {
            // There is a notification in the context with a readlink
            return GenerateLocalID(context, context.binding['@odata.readLink'] + '/Items', 'ItemNumber', '0000', '', '');
        }
    }
    if (libCommon.isOnChangeset(context)) {
        return '0001';
    }
    return '';
}
