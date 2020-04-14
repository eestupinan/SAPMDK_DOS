import libCommon from '../Common/Library/CommonLibrary';
export default function ScanAllButtonVisibility(context) {
    let queryOption = '$filter=OrderId eq ' + '\'' + context.binding.OrderId + '\'' + ' and WithdrawnQuantity ne RequirementQuantity';
    return libCommon.getEntitySetCount(context,'MyWorkOrderComponents', queryOption).then(count => {
        return count !== 0;
    });
}
