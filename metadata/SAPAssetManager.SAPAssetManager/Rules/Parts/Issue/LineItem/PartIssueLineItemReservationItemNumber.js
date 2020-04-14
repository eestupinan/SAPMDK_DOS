import libPart from '../../PartLibrary';

export default function PartIssueLineItemReservationItemNumber(pageClientAPI) {
    
    if (!pageClientAPI) {
        throw new TypeError('Context can\'t be null or undefined');
    }

    return libPart.partIssueLineItemCreateUpdateSetODataValue(pageClientAPI, 'ReservationItemNumber');
}
