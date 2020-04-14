import common from '../../Common/Library/CommonLibrary';
import libNotif from '../NotificationLibrary';

export default function NotificationLinks(context) {
    var links = [{
        'Property': 'NotifPriority',
        'Target':
        {
            'EntitySet': 'Priorities',
            'ReadLink': `Priorities(PriorityType='${context.binding.PriorityType}',Priority='${context.evaluateTargetPath('#Control:PrioritySeg/#Value/#First/#Property:ReturnValue')}')`,
        },
    }];

    var flocValue = common.getListPickerValue(common.getTargetPathValue(context, '#Control:FunctionalLocationLstPkr/#Value'));
    var equipmentValue = common.getListPickerValue(common.getTargetPathValue(context, '#Control:EquipmentLstPkr/#Value'));
    if (flocValue) {
        links.push({
            'Property': 'FunctionalLocation',
            'Target':
            {
                'EntitySet': 'MyFunctionalLocations',
                'ReadLink': `MyFunctionalLocations('${flocValue}')`,
            },
        });
    }
    if (equipmentValue) {
        links.push({
            'Property': 'Equipment',
            'Target':
            {
                'EntitySet': 'MyEquipments',
                'ReadLink': `MyEquipments('${equipmentValue}')`,
            },
        });
    }
    if (context.binding['@odata.readLink'] === '#sap_mobile.MyWorkOrderHeader' || libNotif.getAddFromJobFlag(context)) {
        links.push({
            'Property': 'WorkOrder',
            'Target':
            {
                'EntitySet': 'MyWorkOrderHeaders',
                'ReadLink': context.binding['@odata.readLink'],
            },
        });
    }
    return links;
}
