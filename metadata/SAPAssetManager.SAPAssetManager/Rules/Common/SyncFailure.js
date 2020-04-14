import libCom from './Library/CommonLibrary';

export default function SyncFailure(context) {
    let error = '';
    try {
        error = + '\n' + libCom.getActionResultError(context, 'result');
    } catch (actionResultError) {
        // do nothing
    }
    var message = '';
    if (error !== '0not allowed') {
        message = error;
    }
    return (context.localizeText('service_unavailable_message') + message);
}
