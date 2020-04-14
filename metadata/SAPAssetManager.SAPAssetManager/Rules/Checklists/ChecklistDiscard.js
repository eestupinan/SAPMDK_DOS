import libCommon from '../Common/Library/CommonLibrary';

export default function checklistDiscard(context) {
    return context.executeAction('/SAPAssetManager/Actions/Checklists/ChecklistDiscardConfirm.action').then(successResult => {
        if (successResult.data === true) {
            libCommon.setStateVariable(context, 'FormReadlink', context.binding.Form_Nav['@odata.readLink']);
            return context.executeAction('/SAPAssetManager/Actions/Checklists/ChecklistDelete.action');
        }
        return Promise.resolve(true);
    });
}
