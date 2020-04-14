import libCommon from '../../Common/Library/CommonLibrary';
import Constants from '../../Common/Library/ConstantsLibrary';
import { NoteLibrary as NoteLib } from '../../Notes/NoteLibrary';
import notif from '../../Notifications/NotificationLibrary';


export default class {

    static createNoteIfDefined(context, transactionType, noteFieldKey = Constants.longTextNoteFieldKey) {
        //In order to handle note creation during the changeset action we need to keep a counter of the all the acitons for readlink purposes
        libCommon.incrementChangeSetActionCounter(context);

        let note = libCommon.getFieldValue(context, noteFieldKey, null);
        if (note) {
            NoteLib.setNoteTypeTransactionFlag(context, transactionType);

            if (transactionType.noteCreateAction) {
                // If there is an otherwise defined note create action, execute it
                return context.executeAction(transactionType.noteCreateAction);
            }

            return context.executeAction('/SAPAssetManager/Actions/Notes/NoteCreateDuringEntityCreate.action');
        }
        
        if (transactionType && transactionType.name === 'Notification' && (libCommon.getNotificationAssignmentType(context) === '1' || notif.getAddFromOperationFlag(context) || notif.getAddFromSuboperationFlag(context))) {
            if (libCommon.getNotificationAssignmentType(context) === '1') {
                libCommon.incrementChangeSetActionCounter(context);
            }
            if (notif.getAddFromOperationFlag(context)) {
                libCommon.incrementChangeSetActionCounter(context);
            } else if (notif.getAddFromSuboperationFlag(context)) {
                libCommon.incrementChangeSetActionCounter(context);
            }
        }
        
        return context.executeAction('/SAPAssetManager/Actions/CreateUpdateDelete/CreateEntitySuccessMessage.action');
    }

}
