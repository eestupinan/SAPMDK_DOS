import GenerateLocalID from '../../Common/GenerateLocalID';

export default function ChangesetSwitchNotificationTaskID(context) {
    if (context.binding && context.binding.TaskSequenceNumber) {
        return context.binding.TaskSequenceNumber;
    }
    return GenerateLocalID(context, context.binding['@odata.readLink'] + '/Tasks', 'TaskSequenceNumber', '0000', '', '');
}
