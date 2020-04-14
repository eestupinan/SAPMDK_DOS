import libPart from '../../PartLibrary';

export default function PartIssueLineItemMovementType(pageClientAPI) {
    
    if (!pageClientAPI) {
        throw new TypeError('Context can\'t be null or undefined');
    }

    return libPart.partIssueLineItemCreateUpdateSetODataValue(pageClientAPI, 'MovementType');
}
