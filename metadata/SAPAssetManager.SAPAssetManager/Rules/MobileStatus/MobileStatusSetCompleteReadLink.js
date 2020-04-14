import Validate from '../Common/Library/ValidationLibrary';

/**
 * This is a simple rule to get around a race condition
 * @param {PageProxy} context 
 */
export default function MobileStatusSetCompleteReadLink(context) {

    let readlink = context.getClientData().MobileStatusReadLink;
    if (Validate.evalIsEmpty(readlink)) {
        // Retrieve the readlink from the previous page
        // This is because Client data is not read from context action was executed on
        readlink = context.evaluateTargetPath('#Page:-Previous/#ClientData/#Property:MobileStatusReadLink');
    }
    return readlink;
}
