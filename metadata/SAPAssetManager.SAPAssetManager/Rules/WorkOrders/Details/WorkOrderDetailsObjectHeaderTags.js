import libWoMobile from '../MobileStatus/WorkOrderMobileStatusLibrary';
import Logger from '../../Log/Logger';

export default function WorkOrderDetailsObjectHeaderTags(context) {
    let binding = context.getBindingObject();
    var tags = [context.getBindingObject().OrderType, undefined, undefined];
    if (binding.MarkedJob && binding.MarkedJob.PreferenceValue && binding.MarkedJob.PreferenceValue === 'true') {
        tags[2] = context.localizeText('FAVORITE');
    }

    const promises = [
        libWoMobile.headerMobileStatus(context).then(status => {
            if (status) {
                tags[1] = context.localizeText(status);
            }
        }),
    ];
    return Promise.all(promises).then(() => {
        return tags;
    }, error => {
        /**Implementing our Logger class*/
        Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(), `WorkOrderDetailsObjectHeaderTags error: ${error}`);
        return tags;
    });
}
