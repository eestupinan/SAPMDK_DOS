import DeleteUnusedOverviewEntities from '../Confirmations/Init/DeleteUnusedOverviewEntities';
import setSyncInProgressState from '../Sync/SetSyncInProgressState';
import isSyncInProgress from '../Sync/IsSyncInProgress';

export default function ApplicationOnSync(clientAPI) {
    if (!isSyncInProgress(clientAPI)) {
        return clientAPI.executeAction('/SAPAssetManager/Actions/SyncIntializeMessage.action').then(() => {
            setSyncInProgressState(clientAPI, true);
            return DeleteUnusedOverviewEntities(clientAPI).then( ()=> {
                return clientAPI.executeAction('/SAPAssetManager/Actions/OData/UploadOfflineData.action');
            });
        });
    } else {
        return clientAPI.executeAction('/SAPAssetManager/Actions/SyncInProgress.action');
    }
}
