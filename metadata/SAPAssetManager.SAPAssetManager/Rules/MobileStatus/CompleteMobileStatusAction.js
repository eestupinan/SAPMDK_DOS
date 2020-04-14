
import MobileStatusAction from './MobileStatusAction';

export default class CompleteMobileStatusAction extends MobileStatusAction {


    getDefaultArgs() {
        let defaultArgs = super.getDefaultArgs();

        defaultArgs.didCreateFinalConfirmation = false;

        return defaultArgs;
    }

    didSetFinalConfirmationParams() {
        // This should be implemented by parent classes
        // Implementing class must set the following values in client data:
        // - FinalConfirmationOrderID
        // - FinalConfirmationOperation
        // - FinalConfirmationSubOperation

        return true;
    }

    setMobileStatusComplete(context, instance) {
        // Fill the client data with the mobileStatusReadLink + ObjectKey
        return instance.fetchMobileStatus(context, instance).then(mobileStatus => {
            if (mobileStatus === null) {
                // Exit early
                // True until we handle errors in this class properly
                return true;
            }
            context.getClientData().MobileStatusReadLink = mobileStatus['@odata.readLink'];
            context.getClientData().MobileStatusObjectKey = mobileStatus.ObjectKey;
            return context.executeAction('/SAPAssetManager/Actions/Confirmations/MobileStatusSetComplete.action');

        });
        
    }

    executeCreateBlankConfirmationIfMissing(context, instance) {	
        if (!instance.args.didCreateFinalConfirmation && instance.didSetFinalConfirmationParams(context)) {	
            // Execute the blank final confirmation create action	
            return context.executeAction('/SAPAssetManager/Actions/Confirmations/ConfirmationCreateBlank.action');	
        }	
        return Promise.resolve(true);	
    }
}
