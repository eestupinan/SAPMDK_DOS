import libCommon from '../Library/CommonLibrary';
import documentCreate from '../../Documents/Create/DocumentCreateBDS';
import resetFlags from './ResetFlags';
import Logger from '../../Log/Logger';
/**
 * After changeset success, reset the state variables
 */
export default function ChangeSetOnSuccess(pageProxy) {
     
    if (pageProxy.currentPage.id === 'SubOperationsListViewPage') {
        pageProxy.getDefinitionValue('/SAPAssetManager/Rules/WorkOrders/Operations/WorkOrderOperationListViewCaption.js');
    } 

    if (libCommon.getStateVariable(pageProxy, 'attachmentCount') > 0) {
        return documentCreate(pageProxy, libCommon.getStateVariable(pageProxy, 'Doc')).then(() => {
            resetFlags(pageProxy);
            return pageProxy.executeAction('/SAPAssetManager/Actions/CreateUpdateDelete/CreateEntitySuccessMessageNoClosePage.action');
        }).catch((error) => {
            resetFlags(pageProxy);
            Logger.error(pageProxy.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryDocuments.global').getValue(), error);
        });
    } else {
        resetFlags(pageProxy);
        return pageProxy.executeAction('/SAPAssetManager/Actions/CreateUpdateDelete/CreateEntitySuccessMessageNoClosePage.action');
    }
}
