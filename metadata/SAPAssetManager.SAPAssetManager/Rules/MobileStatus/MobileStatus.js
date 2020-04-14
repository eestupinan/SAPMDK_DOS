import libCommon from '../Common/Library/CommonLibrary';
import Logger from '../Log/Logger';

export default function MobileStatus(context) {
    let currentReadLink = libCommon.getTargetPathValue(context, '#Property:@odata.readLink');
    let isLocal = libCommon.isCurrentReadLinkLocal(currentReadLink);
    if (!isLocal) {
        var binding = context.binding;
        return context.read('/SAPAssetManager/Services/AssetManager.service', binding['@odata.readLink'] + '/MobileStatus', [], '')
            .then(function(mobileStatusData) {
                if (mobileStatusData) {
                    if (mobileStatusData.getItem(0)) {
                        return context.localizeText(mobileStatusData.getItem(0).MobileStatus);
                    }
                }
                return '';
            }).catch(err => {
                /**Implementing our Logger class*/
                Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryMobileStatus.global').getValue(), err);
                return '';
            });
    }
    return Promise.resolve(context.localizeText('RECEIVED'));
}

