

export default function FinalConfirmationSubOperation(context) {
    let suboperation = context.getClientData().FinalConfirmationSubOperation;
    if (suboperation === undefined) {
        // Retrieve the readlink from the previous page
        // This is because Client data is not read from the same context the action was executed on
        suboperation = context.evaluateTargetPath('#Page:-Previous/#ClientData/#Property:FinalConfirmationSubOperation');
    }
    return suboperation;
}
