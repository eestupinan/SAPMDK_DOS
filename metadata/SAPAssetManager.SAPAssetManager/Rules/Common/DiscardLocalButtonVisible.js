import libCommon from './Library/CommonLibrary';

export default function IsDiscardButtonVisible(context) {
    let currentReadLink = libCommon.getTargetPathValue(context, '#Property:@odata.readLink');
    let isLocal = libCommon.isCurrentReadLinkLocal(currentReadLink);
    if (isLocal) {
        return true;
    }
    return false;
}
