import Validate from '../Common/Library/ValidationLibrary';

/**
 * This is a simple rule to get around a race condition
 * @param {PageProxy} context 
 */
export default function MobileStatusSetCompleteObjectKey(context) {

    let readlink = context.getClientData().MobileStatusObjectKey;
    if (Validate.evalIsEmpty(readlink)) {
        // Retrieve the readlink from the previous page
        // This is because Client data is not read from the same context the action was executed on
        readlink = context.evaluateTargetPath('#Page:-Previous/#ClientData/#Property:MobileStatusObjectKey');
    }
    return readlink;
}
