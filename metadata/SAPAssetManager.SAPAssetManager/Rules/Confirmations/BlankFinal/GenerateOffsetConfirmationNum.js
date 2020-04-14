import GenerateLocalConfirmatioNum from '../CreateUpdate/OnCommit/GenerateLocalConfirmationNum';

/**
 * Since multiple Confirmations may be created as part of one Change Set operation,
 * we need to offset the Generated local ID. Incremeted every time it is accessed
 * @param {*} context 
 */
export default function GenerateOffsetConfirmationNum(context) {


    let finalConfOffset = context.getClientData().FinalConfirmationOffset;
    if (finalConfOffset === undefined) {
        finalConfOffset = 1;
    }

    context.getClientData().FinalConfirmationOffset = finalConfOffset + 1;

    return GenerateLocalConfirmatioNum(context, finalConfOffset);
}
