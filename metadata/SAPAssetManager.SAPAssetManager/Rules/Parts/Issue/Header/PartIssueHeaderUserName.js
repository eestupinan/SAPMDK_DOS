import libPart from '../../PartLibrary';

export default function PartIssueHeaderUserName(pageClientAPI) {
    
    if (!pageClientAPI) {
        throw new TypeError('Context can\'t be null or undefined');
    }

    return libPart.partIssueHeaderCreateUpdateSetODataValue(pageClientAPI, 'UserName');
}
