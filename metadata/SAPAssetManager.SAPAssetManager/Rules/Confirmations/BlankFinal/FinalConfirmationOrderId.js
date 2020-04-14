

export default function FinalConfirmationOrderId(context) {
    let orderId = context.getClientData().FinalConfirmationOrderID;
    if (orderId === undefined) {
        // Retrieve the readlink from the previous page
        // This is because Client data is not read from the same context the action was executed on
        orderId = context.evaluateTargetPath('#Page:-Previous/#ClientData/#Property:FinalConfirmationOrderID');
    }
    return orderId;
}
