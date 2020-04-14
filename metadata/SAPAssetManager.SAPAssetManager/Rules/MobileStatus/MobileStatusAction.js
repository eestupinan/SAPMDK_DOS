import CascadingAction from '../Common/Action/CascadingAction';
import QueryBuilder from '../Common/Query/QueryBuilder';
import FetchRequest from '../Common/Query/FetchRequest';

export default class MobileStatusAction extends CascadingAction {

    fetchMobileStatus(context, instance) {
        let query = new QueryBuilder();
        query.addExpandStatement('MobileStatus');
        return new FetchRequest(instance.entitySet(), query.build()).get(context, instance.identifier()).then(result => {

            if (result.getItem(0) && result.getItem(0).MobileStatus) {
                return result.getItem(0).MobileStatus;
            }

            return null;
        }); 
    }

    entitySet() {
        return '';
    }

    identifier() {
        return '';
    }

    executeCreateBlankConfirmationIfMissing(context, instance) {
        if (instance.didSetConfirmationParams(context)) {
            // Execute the blank confirmation create action
            return context.executeAction('/SAPAssetManager/Actions/Confirmations/ConfirmationCreateBlank.action');
        }
        return Promise.resolve(true);
    }

    setActionQueue(actionQueue) {
        // Put this action at the front of the queue
        actionQueue.unshift(this.executeCreateBlankConfirmationIfMissing);        
        super.setActionQueue(actionQueue);
    }
}
