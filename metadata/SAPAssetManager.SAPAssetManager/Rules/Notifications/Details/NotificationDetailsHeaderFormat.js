import {ValueIfExists} from '../../Common/Library/Formatter';
import common from '../../Common/Library/CommonLibrary';
import mobileStatus from '../../MobileStatus/MobileStatusLibrary';

export default function NotificationDetailsHeaderFormat(context) {
    var binding = context.binding;
    var priority;
    switch (context.getProperty()) {
        case 'HeadlineText':
            return ValueIfExists(context.binding.NotificationDescription, '-');
        case 'BodyText':
            return context.read('/SAPAssetManager/Services/AssetManager.service', binding['@odata.readLink'] + '/FunctionalLocation', [], '')
                .then(function(data) {
                    if (data.length > 0) {
                        var item = data.getItem(0);
                        return `${item.FuncLocId} - ${item.FuncLocDesc}`;
                    } else {
                        return '';
                    }
                });
        case 'Footnote':
            return context.read('/SAPAssetManager/Services/AssetManager.service', binding['@odata.readLink'] + '/Equipment', [], '')
                .then(function(data) {
                    if (data.length > 0) {
                        var item = data.getItem(0);
                        return item.EquipDesc + ' (' + item.EquipId + ')';
                    } else {
                        return '';
                    }
                });
        case 'Description':
            return '';
        case 'StatusImage':
            priority = binding.NotifPriority.Priority;
            return common.shouldDisplayPriorityIcon(parseInt(priority));
        case 'SubstatusText':
            priority = binding.NotifPriority;
            return ValueIfExists(priority, context.localizeText('none'), function(value) {
                return value.PriorityDescription;
            });
        case 'Tags':
            var tags = [];
            tags.push(context.getBindingObject().NotificationType);
            return mobileStatus.mobileStatus(context, binding).then((status) => {
                if (status) {
                    tags.push(context.localizeText(status));
                }
                return tags;
            });
        default:
            return '';
    }
}
