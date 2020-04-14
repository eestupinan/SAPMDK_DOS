import libCommon from './Library/CommonLibrary';

export default function IsDiscardButtonVisible(context) {
    if (libCommon.IsOnCreate(context)) {
        return false;
    } else {
        let currentReadLink = context.binding['@odata.readLink'];
        if (context.binding['@odata.type'] !== '#sap_mobile.MyNotificationItem') {
            return libCommon.isCurrentReadLinkLocal(currentReadLink);
        } else {
            return context.read('/SAPAssetManager/Services/AssetManager.service', currentReadLink, [], '$expand=ItemActivities,ItemCauses,ItemTasks').then(function(result) {
                if (result) {
                    result = result.getItem(0);

                    // Check if any Item Causes are synced (non-local)
                    for (let i in result.ItemCauses) {
                        if (!libCommon.isCurrentReadLinkLocal(result.ItemCauses[i]['@odata.readLink'])) {
                            return false;
                        }
                    }

                    // Check if any Item Tasks are synced (non-local)
                    for (let i in result.ItemTasks) {
                        if (!libCommon.isCurrentReadLinkLocal(result.ItemTasks[i]['@odata.readLink'])) {
                            return false;
                        }
                    }
                    
                    // Check if any Item Tasks are synced (non-local)
                    for (let i in result.ItemActivities) {
                        if (!libCommon.isCurrentReadLinkLocal(result.ItemActivities[i]['@odata.readLink'])) {
                            return false;
                        }
                    }
                }
                // Deletion is permitted
                return true;
            });
        }
    }
}
