import CompleteMobileStatusAction from '../../MobileStatus/CompleteMobileStatusAction';

export default class CompleteWorkOrderMobileStatusAction extends CompleteMobileStatusAction {

    name() {
        return 'CompleteMobileStatusAction_WorkOrder';
    }

    entitySet() {
        return 'MyWorkOrderHeaders';
    }

    identifier() {
        // Needs to be in single quotes for fetch request
        return `'${this.args.WorkOrderId}'`;
    }

    setActionQueue(actionQueue) {
        // Put this action at the front of the queue
        actionQueue.unshift(this.setMobileStatusComplete); 
        super.setActionQueue(actionQueue);
    }

    didSetFinalConfirmationParams() {
        // context.getClientData().FinalConfirmationOrderID = this.args.WorkOrderId;
        // // Make sure these are found, but blank
        // context.getClientData().FinalConfirmationOperation = '';
        // context.getClientData().FinalConfirmationSubOperation = '';

        // Operation is a minium requirement for Confirmation Entities
        // I am not certain it should be this way so keeping implementation commented
        return false;
    }

}
