export default function DeleteEntityOnSuccess(context) {
    return context.executeAction('/SAPAssetManager/Actions/CreateUpdateDelete/DeleteEntitySuccessMessage.action').then(() => {
        return context.executeAction('/SAPAssetManager/Actions/Page/ClosePage.action');
    });
}
