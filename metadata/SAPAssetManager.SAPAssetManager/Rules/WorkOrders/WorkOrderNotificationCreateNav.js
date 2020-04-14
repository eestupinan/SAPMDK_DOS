import libNotif from '../Notifications/NotificationLibrary';
import notifCreateChangeSetNav from '../Notifications/CreateUpdate/NotificationCreateChangeSetNav';

export default function WorkOrderNotificationCreateNav(context) {

    //set the follow up flag
    libNotif.setAddFromJobFlag(context, true);

    let bindingObject = {
        '@odata.readLink': context.binding['@odata.readLink'],
        OrderId: context.binding.OrderId,
        HeaderEquipment: context.binding.HeaderEquipment,
        HeaderFunctionLocation: context.binding.HeaderFunctionLocation,
    };

    // Return the result of the change set nav
    return notifCreateChangeSetNav(context, bindingObject);
}
