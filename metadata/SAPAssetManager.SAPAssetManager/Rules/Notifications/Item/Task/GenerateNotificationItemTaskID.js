import GenerateLocalID from '../../../Common/GenerateLocalID';

export default function GenerateNotificationItemTaskID(context) {
    if (context.binding && context.binding.TaskSequenceNumber) {
        return context.binding.TaskSequenceNumber;
    }
    return GenerateLocalID(context, context.binding['@odata.readLink'] + '/ItemTasks', 'TaskSequenceNumber', '0000', '', '');
}
