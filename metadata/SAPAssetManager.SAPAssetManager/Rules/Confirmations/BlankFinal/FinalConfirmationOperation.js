

export default function FinalConfirmationOperation(context) {
    let operation = context.getClientData().FinalConfirmationOperation;
    if (operation === undefined) {
        // Retrieve the readlink from the previous page
        // This is because Client data is not read from the same context the action was executed on
        operation = context.evaluateTargetPath('#Page:-Previous/#ClientData/#Property:FinalConfirmationOperation');
    }
    return operation;
}
